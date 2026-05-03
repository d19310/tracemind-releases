import { App } from 'obsidian';

/**
 * Ensure a folder exists in the vault
 */
export async function ensureFolder(app: App, path: string): Promise<void> {
  const folder = app.vault.getAbstractFileByPath(path);
  if (!folder) {
    await app.vault.createFolder(path);
  }
}
