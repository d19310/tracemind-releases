/**
 * Hermes Agent Provider
 *
 * Invokes the locally installed `hermes` CLI as a chat backend.
 * Hermes supports one-shot mode (-z) which outputs the response directly to stdout.
 */

import type { AgentProvider, AgentSession, AgentMessage, AgentResult, ExecuteOptions } from '../provider';
import { resolveExecutable } from '../provider';

const { spawn } = require('child_process');
const readline = require('readline');

const EXECUTABLE = 'hermes';
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

export const hermesProvider: AgentProvider = {
  name: 'Hermes',
  description: '开源 AI agent 框架，支持多 provider，通过 hermes CLI 调用',

  async detect(): Promise<boolean> {
    const path = await resolveExecutable(EXECUTABLE);
    if (!path) return false;
    try {
      const { execSync } = require('child_process');
      const version = execSync(`${path} --version 2>&1`, {
        encoding: 'utf-8',
        timeout: 10000,
      });
      return /Hermes Agent/i.test(version);
    } catch {
      return false;
    }
  },

  execute(prompt: string, opts?: ExecuteOptions): AgentSession {
    let proc: ReturnType<typeof spawn> | null = null;
    let aborted = false;
    let onMessage: ((msg: AgentMessage) => void) | null = null;
    let onDone: ((result: AgentResult) => void) | null = null;
    let onError: ((error: Error) => void) | null = null;
    const startTime = Date.now();

    const run = async () => {
      try {
        const exePath = await resolveExecutable(EXECUTABLE);
        if (!exePath) {
          const err = new Error('找不到 hermes CLI，请确认已安装 Hermes Agent');
          onError?.(err);
          onDone?.({ status: 'failed', output: '', error: err.message, durationMs: Date.now() - startTime });
          return;
        }

        const args = ['-z', prompt]; // one-shot mode

        if (opts?.model) {
          args.unshift('-m', opts.model);
        }

        const env = { ...process.env as Record<string, string>, ...opts?.env };

        proc = spawn(exePath, args, {
          env,
          cwd: opts?.cwd || process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        if (aborted) { proc.kill(); return; }

        proc.on('error', (err: Error) => {
          onError?.(err);
          onDone?.({ status: 'failed', output: '', error: err.message, durationMs: Date.now() - startTime });
        });

        const timer = setTimeout(() => {
          if (proc && !proc.killed) {
            proc.kill();
            onDone?.({ status: 'timeout', output: '', error: '执行超时', durationMs: Date.now() - startTime });
          }
        }, opts?.timeoutMs || DEFAULT_TIMEOUT);

        // Hermes outputs plain text to stdout in oneshot mode
        let outputBuffer = '';
        const rl = readline.createInterface({ input: proc.stdout!, crlfDelay: Infinity });

        rl.on('line', (line: string) => {
          outputBuffer += line + '\n';
          onMessage?.({ type: 'text', content: line + '\n' });
        });

        rl.on('close', () => {
          clearTimeout(timer);
          onDone?.({ status: 'completed', output: outputBuffer.trim(), durationMs: Date.now() - startTime });
        });

        // Capture stderr for diagnostics
        let stderr = '';
        if (proc.stderr) {
          proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
        }

        proc.on('close', (code: number | null) => {
          clearTimeout(timer);
          if (code !== 0 && outputBuffer === '') {
            onDone?.({
              status: 'failed',
              output: '',
              error: `hermes 退出码 ${code}: ${stderr.slice(0, 500)}`,
              durationMs: Date.now() - startTime,
            });
          }
        });

      } catch (err) {
        onError?.(err as Error);
        onDone?.({ status: 'failed', output: '', error: (err as Error).message, durationMs: Date.now() - startTime });
      }
    };

    run();

    return {
      set onMessage(cb) { onMessage = cb; },
      get onMessage() { return onMessage; },
      set onDone(cb) { onDone = cb; },
      get onDone() { return onDone; },
      set onError(cb) { onError = cb; },
      get onError() { return onError; },
      abort() {
        aborted = true;
        if (proc && !proc.killed) proc.kill();
      },
    };
  },
};
