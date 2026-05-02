/**
 * Vault Operations - File and directory management in Obsidian vault
 */

import { App, TFile, TFolder, normalizePath } from 'obsidian';

/**
 * Ensure a directory exists in the vault, create if not
 */
export async function ensureFolder(app: App, path: string): Promise<void> {
  const normalized = normalizePath(path);
  if (!app.vault.getFolderByPath(normalized)) {
    await app.vault.createFolder(normalized);
  }
}

/**
 * Read file content from vault, return empty string if not exists
 */
export async function readFile(app: App, path: string): Promise<string> {
  const normalized = normalizePath(path);
  const file = app.vault.getFileByPath(normalized);
  if (!file) return '';
  return app.vault.read(file);
}

/**
 * Write content to file in vault, create parent dirs if needed
 */
export async function writeFile(app: App, path: string, content: string): Promise<void> {
  const normalized = normalizePath(path);
  const existing = app.vault.getFileByPath(normalized);
  if (existing) {
    await app.vault.modify(existing, content);
  } else {
    await app.vault.create(normalized, content);
  }
}

/**
 * List all markdown files in a folder (recursive)
 */
export async function listMarkdownFiles(app: App, folderPath: string): Promise<TFile[]> {
  const normalized = normalizePath(folderPath);
  const folder = app.vault.getFolderByPath(normalized);
  if (!folder) return [];

  const files: TFile[] = [];
  const children = folder.children;
  for (const child of children) {
    if (child instanceof TFile && child.extension === 'md') {
      files.push(child);
    } else if (child instanceof TFolder) {
      files.push(...await listMarkdownFilesRecursive(app, child));
    }
  }
  return files;
}

async function listMarkdownFilesRecursive(app: App, folder: TFolder): Promise<TFile[]> {
  const files: TFile[] = [];
  for (const child of folder.children) {
    if (child instanceof TFile && child.extension === 'md') {
      files.push(child);
    } else if (child instanceof TFolder) {
      files.push(...await listMarkdownFilesRecursive(app, child));
    }
  }
  return files;
}

/**
 * Delete a file from vault (move to trash)
 */
export async function deleteFile(app: App, path: string): Promise<void> {
  const normalized = normalizePath(path);
  const file = app.vault.getFileByPath(normalized);
  if (file) {
    await app.vault.trash(file, true);
  }
}
