/**
 * Session Store - Per-block AI conversation session management
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type AnalysisPhase =
  | 'analysis'
  | 'detection'
  | 'processing'
  | 'complete';

export interface BlockSession {
  blockId: string;
  content: string;
  messages: ChatMessage[];
  analysisResult?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  currentPhase: AnalysisPhase;
}

/**
 * Serialize a session to JSON string for vault storage
 */
export function saveSession(session: BlockSession): string {
  return JSON.stringify(session, null, 2);
}

/**
 * Parse a session from JSON string
 */
export function loadSession(json: string): BlockSession {
  const data = JSON.parse(json);
  return {
    blockId: data.blockId,
    content: data.content,
    messages: data.messages || [],
    analysisResult: data.analysisResult,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    currentPhase: data.currentPhase || 'analysis',
  };
}
