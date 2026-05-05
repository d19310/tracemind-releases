/**
 * Claude Code Agent Provider
 *
 * Invokes the locally installed `claude` CLI (Claude Code) as a chat backend.
 * Uses child_process.spawn + stdin/stdout JSON stream-json protocol.
 */

import type { AgentProvider, AgentSession, AgentMessage, AgentResult, ExecuteOptions } from '../provider';
import { resolveExecutable } from '../provider';
import { ChildProcess, spawn } from 'node:child_process';
import * as readline from 'node:readline';

const EXECUTABLE = 'claude';
const DEFAULT_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Claude Code JSON stream message shapes
 */
interface ClaudeStreamMessage {
  type: 'assistant' | 'user' | 'system' | 'result';
  message?: {
    content?: Array<{
      type: 'text' | 'tool_use';
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
  session_id?: string;
  subtype?: string;
  is_error?: boolean;
  output?: string;
  final_response?: Array<{ text?: string }>;
}

export const claudeCodeProvider: AgentProvider = {
  name: 'Claude Code',
  description: 'Anthropic 出品的本地 AI 编程 agent，通过 claude CLI 调用',

  async detect(): Promise<boolean> {
    const path = await resolveExecutable(EXECUTABLE);
    if (!path) return false;

    // Verify it's actually Claude Code (not a different 'claude' binary)
    try {
      const { execSync } = await import('node:child_process');
      const version = execSync(`${path} --version 2>&1`, {
        encoding: 'utf-8',
        timeout: 10000,
      });
      // Claude Code version output contains "Claude Code" or version pattern
      return /[Cc]laude|[0-9]+\.[0-9]+\.[0-9]+/.test(version);
    } catch {
      return false;
    }
  },

  execute(prompt: string, opts?: ExecuteOptions): AgentSession {
    let proc: ChildProcess | null = null;
    let aborted = false;
    let onMessage: ((msg: AgentMessage) => void) | null = null;
    let onDone: ((result: AgentResult) => void) | null = null;
    let onError: ((error: Error) => void) | null = null;
    const startTime = Date.now();

    const timeoutMs = opts?.timeoutMs || DEFAULT_TIMEOUT;

    const run = async () => {
      try {
        const exePath = await resolveExecutable(EXECUTABLE);
        if (!exePath) {
          const err = new Error('找不到 claude CLI，请确认已安装 Claude Code');
          onError?.(err);
          onDone?.({ status: 'failed', output: '', error: err.message, durationMs: Date.now() - startTime });
          return;
        }

        const args = [
          '-p',
          '--output-format', 'stream-json',
          '--input-format', 'stream-json',
          '--verbose',
        ];

        if (opts?.model) {
          args.push('--model', opts.model);
        }

        const env: Record<string, string> = { ...process.env as Record<string, string> };
        if (opts?.env) {
          Object.assign(env, opts.env);
        }

        proc = spawn(exePath, args, {
          env,
          cwd: opts?.cwd || process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        if (aborted) {
          proc.kill();
          return;
        }

        // Guard against unhandled process errors
        proc.on('error', (err) => {
          onError?.(err);
          onDone?.({ status: 'failed', output: '', error: err.message, durationMs: Date.now() - startTime });
        });

        // Timeout
        const timer = setTimeout(() => {
          if (proc && !proc.killed) {
            proc.kill();
            onDone?.({ status: 'timeout', output: '', error: '执行超时', durationMs: Date.now() - startTime });
          }
        }, timeoutMs);

        // Parse stdout as JSON stream
        const rl = readline.createInterface({ input: proc.stdout!, crlfDelay: Infinity });
        let sessionId = '';
        let outputBuffer = '';

        rl.on('line', (line: string) => {
          if (!line.trim()) return;
          try {
            const msg: ClaudeStreamMessage = JSON.parse(line);

            switch (msg.type) {
              case 'system':
                if (msg.session_id) sessionId = msg.session_id;
                if (msg.subtype === 'init') {
                  onMessage?.({ type: 'status', content: 'running', sessionId });
                }
                break;

              case 'assistant': {
                const blocks = msg.message?.content || [];
                for (const block of blocks) {
                  if (block.type === 'text' && block.text) {
                    outputBuffer += block.text;
                    onMessage?.({ type: 'text', content: block.text });
                  } else if (block.type === 'tool_use') {
                    onMessage?.({
                      type: 'tool-use',
                      toolName: block.name,
                      toolInput: block.input,
                    });
                  }
                }
                break;
              }

              case 'user': {
                // Tool results
                const blocks = msg.message?.content || [];
                for (const block of blocks) {
                  if (block.type === 'tool_use' && block.name) {
                    onMessage?.({ type: 'tool-result', toolName: block.name });
                  }
                }
                break;
              }

              case 'result':
                clearTimeout(timer);
                const isError = msg.is_error || msg.subtype === 'error_during_execution';
                const finalOutput = msg.output || outputBuffer;
                onDone?.({
                  status: isError ? 'failed' : 'completed',
                  output: finalOutput,
                  error: isError ? (msg.output || '未知错误') : undefined,
                  durationMs: Date.now() - startTime,
                });
                break;
            }
          } catch {
            // Skip unparseable lines (partial JSON during streaming)
          }
        });

        rl.on('close', () => {
          clearTimeout(timer);
          if (!aborted) {
            onDone?.({
              status: 'completed',
              output: outputBuffer,
              durationMs: Date.now() - startTime,
            });
          }
        });

        // Write prompt to stdin as JSON
        const input = JSON.stringify({
          type: 'user',
          message: {
            role: 'user',
            content: prompt,
          },
        });
        proc.stdin!.write(input + '\n');
        proc.stdin!.end();

      } catch (err) {
        onError?.(err as Error);
        onDone?.({ status: 'failed', output: '', error: (err as Error).message, durationMs: Date.now() - startTime });
      }
    };

    // Start execution (async, don't block)
    run();

    return {
      set onMessage(cb: ((msg: AgentMessage) => void) | null) { onMessage = cb; },
      get onMessage() { return onMessage; },
      set onDone(cb: ((result: AgentResult) => void) | null) { onDone = cb; },
      get onDone() { return onDone; },
      set onError(cb: ((error: Error) => void) | null) { onError = cb; },
      get onError() { return onError; },
      abort() {
        aborted = true;
        if (proc && !proc.killed) {
          proc.kill();
        }
      },
    };
  },
};
