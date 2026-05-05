/**
 * Local Agent Provider abstraction.
 * Enables TraceMind to invoke locally installed AI agent CLIs (claude, hermes, openclaw, etc.)
 * as alternative backends for chat mode, instead of calling cloud APIs.
 *
 * Pattern inspired by Multica's Backend interface.
 */

export interface AgentMessage {
  type: 'text' | 'thinking' | 'tool-use' | 'tool-result' | 'error' | 'status';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  sessionId?: string;
}

export interface AgentResult {
  status: 'completed' | 'failed' | 'timeout' | 'aborted';
  output: string;
  error?: string;
  durationMs: number;
}

export interface ExecuteOptions {
  /** Working directory for the agent process */
  cwd?: string;
  /** System prompt (supported by some agents) */
  systemPrompt?: string;
  /** Model override */
  model?: string;
  /** Max execution time in ms */
  timeoutMs?: number;
  /** Additional environment variables */
  env?: Record<string, string>;
}

export interface AgentProvider {
  /** Human-readable name for UI display */
  readonly name: string;
  /** Short description */
  readonly description: string;

  /**
   * Check if the agent CLI is available on this machine.
   * Should check PATH and return false gracefully if not found.
   */
  detect(): Promise<boolean>;

  /**
   * Execute a prompt via the local agent CLI.
   * Returns an AgentSession for streaming messages and awaiting the result.
   */
  execute(prompt: string, opts?: ExecuteOptions): AgentSession;
}

export interface AgentSession {
  /** Called for each streaming message (text, thinking, tool-use, etc.) */
  onMessage: ((msg: AgentMessage) => void) | null;
  /** Called when execution completes */
  onDone: ((result: AgentResult) => void) | null;
  /** Called on error */
  onError: ((error: Error) => void) | null;
  /** Abort the running session */
  abort(): void;
}

/**
 * Resolve an executable path by checking common locations.
 * Returns the first found path, or null if not found.
 */
export async function resolveExecutable(name: string): Promise<string | null> {
  const { execSync } = await import('node:child_process');
  try {
    const path = execSync(`which ${name} 2>/dev/null || where ${name} 2>nul`, {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim().split('\n')[0];
    return path || null;
  } catch {
    return null;
  }
}
