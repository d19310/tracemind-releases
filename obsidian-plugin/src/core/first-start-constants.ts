/**
 * First-Start Constants
 * Pure module with no Obsidian dependency - testable in Node.js.
 */

export const REQUIRED_DIRS = ['Daily', 'Person', 'Object', 'Theme', 'TraceMind'];
export const PROFILE_PATH = 'TraceMind/PROFILE.md';

/**
 * Minimal interface for checking file existence.
 * Compatible with Obsidian's DataAdapter.stat() which returns Stat | null.
 */
export interface VaultAdapter {
  stat(path: string): Promise<{ type: string } | null>;
}

/**
 * Check if this is a first-time start (no PROFILE.md exists).
 */
export async function isFirstStart(vault: VaultAdapter): Promise<boolean> {
  try {
    const stat = await vault.stat(PROFILE_PATH);
    return stat === null;
  } catch {
    return true;
  }
}
