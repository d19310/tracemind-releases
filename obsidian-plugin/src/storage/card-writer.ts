/**
 * Card Writer - Writes confirmed context cards to Obsidian vault
 * Handles frontmatter updates, body content, and wikilink relations.
 */

import { ContextCard } from '../core/context-card';
import { cardToMarkdown } from './markdown-card';

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
