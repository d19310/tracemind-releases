/**
 * Card Writer - Writes confirmed context cards to Obsidian vault
 * Handles frontmatter updates, body content, and wikilink relations.
 */

import { App } from 'obsidian';
import { ContextCard, CardType } from '../core/context-card';
import { cardToMarkdown, parseCardMarkdown } from './markdown-card';
import { ensureParentFolder } from '../vault/vault';

/**
 * Build full markdown for a new context card
 */
export function buildCardUpdate(card: ContextCard): string {
  return cardToMarkdown(card);
}

/**
 * Build wikilink section for related entities
 */
export function buildWikilinkSection(entityNames: string[]): string {
  if (entityNames.length === 0) return '';
  return entityNames.map(name => `[[${name}]]`).join(', ');
}

/**
 * Parse wikilinks from text content
 */
export function parseWikilinks(text: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return links;
}

/**
 * Get the vault folder for a card type.
 */
export function getCardFolder(cardType: CardType): string {
  switch (cardType) {
    case 'person': return 'Person/';
    case 'object': return 'Object/';
    case 'theme': return 'Theme/';
    default: return '';
  }
}

/**
 * Sanitize a file name for vault storage.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/<>:"|?*]/g, '_').trim();
}

/**
 * Convert a card name to a vault file path.
 */
export function cardToVaultPath(name: string, cardType: CardType): string {
  return `${getCardFolder(cardType)}${sanitizeFileName(name) || 'unnamed'}.md`;
}

/**
 * Check if a card already exists in the vault.
 */
export function cardExists(filePaths: Set<string>, name: string, cardType: CardType): boolean {
  const path = cardToVaultPath(name, cardType);
  return filePaths.has(path);
}

/**
 * Read a Context Card from the vault.
 */
export async function readCardFromVault(
  app: App,
  name: string,
  cardType: CardType,
): Promise<ContextCard | null> {
  const path = cardToVaultPath(name, cardType);
  const file = app.vault.getFileByPath(path);
  if (!file) return null;

  try {
    const content = await app.vault.read(file);
    return parseCardMarkdown(content);
  } catch {
    return null;
  }
}

/**
 * Upsert a Context Card in the vault.
 * Creates if doesn't exist, updates if it does.
 * Handles file rename if the card name changed.
 */
export async function upsertCard(
  app: App,
  card: ContextCard,
  oldName?: string,
): Promise<void> {
  const path = cardToVaultPath(card.name, card.cardType);
  const isRename = oldName != null && oldName !== card.name;
  const oldPath = isRename ? cardToVaultPath(oldName!, card.cardType) : null;
  const pathsSame = oldPath === path;

  // Ensure parent folder exists before writing
  await ensureParentFolder(app, path);

  const md = cardToMarkdown(card);
  const existing = app.vault.getFileByPath(path);

  // Write new file first
  if (existing) {
    await app.vault.modify(existing, md);
  } else {
    await app.vault.create(path, md);
  }

  // Only after successful write, delete old file (safe rename)
  if (isRename && !pathsSame) {
    const oldFile = app.vault.getFileByPath(oldPath!);
    if (oldFile) {
      await app.vault.delete(oldFile);
    }
  }
}
