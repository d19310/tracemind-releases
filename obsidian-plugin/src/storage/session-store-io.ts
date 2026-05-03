/**
 * Session Store File I/O
 * Reads/writes per-block AI sessions from/to Obsidian vault files.
 * Complements the serialization in session-store.ts.
 */

import { BlockSession, saveSession, loadSession } from './session-store';

const SESSIONS_DIR = 'TraceMind/sessions';

/**
 * Get the vault file path for a given block ID.
 */
export function sessionFilePath(blockId: string): string {
  return `${SESSIONS_DIR}/${blockId}.json`;
}

/**
 * Format a BlockSession as JSON for vault storage.
 */
export function formatSessionJson(session: BlockSession): string {
  return saveSession(session);
}

/**
 * Parse a BlockSession from JSON string.
 */
export function parseSessionJson(json: string): BlockSession {
  return loadSession(json);
}

interface VaultFile {
  path: string;
  content: string;
}

/**
 * List all session files from a directory scan result.
 * Returns block IDs extracted from filenames.
 */
export function listSession(files: VaultFile[]): string[] {
  const blockIds: string[] = [];
  for (const f of files) {
    if (f.path.startsWith(SESSIONS_DIR + '/') && f.path.endsWith('.json')) {
      const parts = f.path.split('/');
      const filename = parts[parts.length - 1];
      blockIds.push(filename.slice(0, -5)); // remove '.json'
    }
  }
  return blockIds;
}
