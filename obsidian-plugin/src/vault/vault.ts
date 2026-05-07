import { App } from 'obsidian';

/**
 * Ensure a folder exists in the vault
 */
export async function ensureFolder(app: App, path: string): Promise<void> {
  const folder = app.vault.getAbstractFileByPath(path);
  if (!folder) {
    try {
      await app.vault.createFolder(path);
    } catch (e) {
      // createFolder may throw "Folder already exists" in edge cases
      // (e.g., race conditions, Obsidian internal caching lag)
      if (!(e as Error).message?.includes('already exists')) {
        throw e;
      }
    }
  }
}

/**
 * Ensure all parent directories for a file path exist.
 * Example: "TraceMind/insights/2026-05-07.md" → ensures "TraceMind" and "TraceMind/insights".
 */
export async function ensureParentFolder(app: App, filePath: string): Promise<void> {
  const parts = filePath.split('/');
  // Last part is the filename — remove it
  if (parts.length < 2) return; // no parent directory

  const dirs = parts.slice(0, -1);
  let current = '';
  for (const dir of dirs) {
    current = current ? `${current}/${dir}` : dir;
    await ensureFolder(app, current);
  }
}
