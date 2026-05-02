/**
 * Clarification Session - Manages multi-turn knowledge gap clarification
 * Drives the question-answer loop to fill entity knowledge gaps.
 */

import { KnowledgeGap } from './knowledge-gap';

export interface SessionAnswer {
  question: string;
  userResponse: string;
  extractedAttributes: Record<string, unknown>;
  timestamp?: string;
}

export interface ClarificationSessionState {
  id: string;
  blockId: string;
  status: 'active' | 'stopped' | 'completed' | 'error';
  gapQueue: KnowledgeGap[];
  answers: SessionAnswer[];
  maxTurns: number;
  turnCount: number;
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

const STOP_COMMANDS = new Set([
  '跳过', '不用问了', '结束', 'stop', 'skip',
  '算了', '不需要', '别问了', '不用', '停止',
]);

export class ClarificationSession {
  readonly id: string;
  blockId: string;
  status: ClarificationSessionState['status'];
  gapQueue: KnowledgeGap[];
  answers: SessionAnswer[];
  readonly maxTurns: number;
  turnCount: number;
  readonly startedAt: string;
  endedAt?: string;
  summary?: string;

  private constructor(gaps: KnowledgeGap[], options: { maxTurns?: number; blockId?: string } = {}) {
    const sorted = [...gaps].sort((a, b) => b.score - a.score);
    this.id = generateSessionId();
    this.blockId = options.blockId || '';
    this.status = 'active';
    this.gapQueue = sorted;
    this.answers = [];
    this.maxTurns = options.maxTurns ?? 5;
    this.turnCount = 0;
    this.startedAt = new Date().toISOString();
  }

  /**
   * Create a new clarification session
   */
  static create(gaps: KnowledgeGap[], options?: { maxTurns?: number; blockId?: string }): ClarificationSession {
    return new ClarificationSession(gaps, options);
  }

  /**
   * Get the next question from the gap queue
   * Returns null if session is stopped, completed, or max turns reached
   */
  nextQuestion(): KnowledgeGap | null {
    if (this.status !== 'active') return null;
    if (this.gapQueue.length === 0) return null;
    if (this.turnCount >= this.maxTurns) {
      this.status = 'completed';
      this.endedAt = new Date().toISOString();
      return null;
    }

    const gap = this.gapQueue.shift()!;
    this.turnCount++;
    return gap;
  }

  /**
   * Check if a user response is a stop command
   */
  static isStopCommand(response: string): boolean {
    const trimmed = response.trim().toLowerCase();
    return STOP_COMMANDS.has(trimmed);
  }

  /**
   * Process a user answer
   * If it's a stop command, end the session
   * Otherwise, record the answer and move to next gap
   */
  processAnswer(answer: SessionAnswer): void {
    const isSkip = ClarificationSession.isStopCommand(answer.userResponse);

    if (isSkip) {
      // Skip current gap, don't record attributes
      this.answers.push({
        ...answer,
        timestamp: new Date().toISOString(),
      });

      if (this.gapQueue.length === 0 || this.turnCount >= this.maxTurns) {
        this.status = 'completed';
        this.endedAt = new Date().toISOString();
      }
      return;
    }

    // Record answer with extracted attributes
    this.answers.push({
      ...answer,
      timestamp: new Date().toISOString(),
    });

    // Check if session is complete
    if (this.gapQueue.length === 0 || this.turnCount >= this.maxTurns) {
      this.status = 'completed';
      this.endedAt = new Date().toISOString();
      this.summary = this.generateSummary();
    }
  }

  /**
   * Stop the session early
   */
  stop(): void {
    this.status = 'stopped';
    this.endedAt = new Date().toISOString();
  }

  /**
   * Generate a closing summary of what was learned
   */
  private generateSummary(): string {
    const answered = this.answers.filter(
      a => !ClarificationSession.isStopCommand(a.userResponse),
    );
    const skipped = this.answers.filter(
      a => ClarificationSession.isStopCommand(a.userResponse),
    );

    const parts = [`本次澄清会话共 ${this.turnCount} 轮对话，`];

    if (answered.length > 0) {
      const filled = answered
        .map(a => `回答了关于 ${a.question} 的信息`)
        .join('；');
      parts.push(filled);
    }

    if (skipped.length > 0) {
      parts.push(`${skipped.length} 个问题被跳过`);
    }

    if (this.gapQueue.length > 0) {
      parts.push(`还有 ${this.gapQueue.length} 个问题未解答`);
    }

    return parts.join('，');
  }
}

function generateSessionId(): string {
  return Date.now().toString(16).slice(-10) + Math.random().toString(16).slice(2, 6);
}
