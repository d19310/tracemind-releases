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
