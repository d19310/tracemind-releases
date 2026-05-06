/**
 * First-Start Constants
 * Pure module with no Obsidian dependency - testable in Node.js.
 */

export const REQUIRED_DIRS = [
	'Daily',
	'Person',
	'Object',
	'Theme',
	'TraceMind',
	'TraceMind/sessions',
	'TraceMind/index',
	'TraceMind/insights',
];
export const PROFILE_PATH = 'TraceMind/PROFILE.md';

/**
 * Minimal interface for checking file existence.
 * Compatible with Obsidian's DataAdapter.stat() which returns Stat | null.
 */
export interface VaultAdapter {
  stat(path: string): Promise<{ type: string } | null>;
}

/**
 * Minimal interface for checking file/directory existence.
 * Synchronous so tests don't need async mock boilerplate.
 */
export interface VaultAccess {
  exists(path: string): boolean;
}

/**
 * Validate first-start structure. Returns a list of human-readable
 * missing items (e.g. "目录: Daily", "档案: TraceMind/PROFILE.md").
 * Returns an empty array when everything is in place.
 */
export function getMissingFirstStartItems(vault: VaultAccess): string[] {
  const missing: string[] = [];

  for (const dir of REQUIRED_DIRS) {
    if (!vault.exists(dir)) {
      missing.push(`目录: ${dir}`);
    }
  }

  if (!vault.exists(PROFILE_PATH)) {
    missing.push(`档案: ${PROFILE_PATH}`);
  }

  return missing;
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
