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

// ---------------------------------------------------------------------------
// Vault structure validation (used on every startup, not just first-start)
// ---------------------------------------------------------------------------

export type VaultStructureIssueType = 'missing_dir' | 'missing_file' | 'wrong_type';

export interface VaultStructureIssue {
  type: VaultStructureIssueType;
  path: string;
  expected: 'folder' | 'file';
  actual?: 'folder' | 'file' | 'unknown';
  label: string;
  repairable: boolean;
}

export interface VaultStructureAccess {
  getType(path: string): 'folder' | 'file' | null;
}

export function getVaultStructureIssues(vault: VaultStructureAccess): VaultStructureIssue[] {
  const issues: VaultStructureIssue[] = [];

  for (const dir of REQUIRED_DIRS) {
    const t = vault.getType(dir);
    if (t === null) {
      issues.push({ type: 'missing_dir', path: dir, expected: 'folder', actual: 'unknown', label: `目录缺失: ${dir}`, repairable: true });
    } else if (t !== 'folder') {
      issues.push({ type: 'wrong_type', path: dir, expected: 'folder', actual: t, label: `路径类型错误: ${dir}（应为目录，实际为${t === 'file' ? '文件' : '未知'}）`, repairable: false });
    }
  }

  const pt = vault.getType(PROFILE_PATH);
  if (pt === null) {
    issues.push({ type: 'missing_file', path: PROFILE_PATH, expected: 'file', actual: 'unknown', label: `档案缺失: ${PROFILE_PATH}`, repairable: true });
  } else if (pt !== 'file') {
    issues.push({ type: 'wrong_type', path: PROFILE_PATH, expected: 'file', actual: pt, label: `路径类型错误: ${PROFILE_PATH}（应为文件，实际为${pt === 'folder' ? '目录' : '未知'}）`, repairable: false });
  }

  return issues;
}

export type StartupStructureDecision =
  | { kind: 'first_start' }
  | { kind: 'continue' }
  | { kind: 'prompt_repair'; issues: VaultStructureIssue[] };

export function decideStartupAction(
  isFirst: boolean,
  issues: VaultStructureIssue[],
): StartupStructureDecision {
  if (isFirst) return { kind: 'first_start' };
  if (issues.length === 0) return { kind: 'continue' };
  return { kind: 'prompt_repair', issues };
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
