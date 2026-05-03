/**
 * Entity Index File I/O
 * Reads/writes entity index from/to Obsidian vault files.
 * Complements the pure data operations in entity-index.ts.
 */

import yaml from 'js-yaml';
import { IndexEntry, EntityIndex } from './entity-index';
import { generateEntityId } from '../core/context-card';

const load = yaml.load;

interface VaultFile {
  path: string;
  content: string;
}

/**
 * Parse a single Context Card markdown file into an IndexEntry.
 * Extracts metadata from YAML frontmatter; filename is fallback.
 */
export function cardToIndexEntry(markdown: string, filePath: string): IndexEntry {
  const frontmatter = extractFrontmatter(markdown);

  // Try to extract name from frontmatter, then filename, then fallback
  let name = frontmatter?.name as string;
  if (!name) {
    const base = filePath.split('/').pop()?.replace('.md', '') || '';
    name = base;
  }

  const cardType = (frontmatter?.type as 'person' | 'object' | 'theme') || 'person';
  const maturity = (frontmatter?.maturity as string) || 'L0';
  const confidence = (frontmatter?.confidence as number) ?? 0.5;
  const aliases = Array.isArray(frontmatter?.aliases) ? frontmatter.aliases : [];

  return {
    id: (frontmatter?.id as string) || generateEntityId(name),
    name,
    cardType,
    type: cardTypeToWikiType(cardType), // LifeWiki type alias
    subtype: frontmatter?.subtype as string | undefined,
    maturity,
    confidence,
    filePath,
    aliases,
    relationCount: 0, // will be updated when relations are built
    lastUpdated: (frontmatter?.lastUpdated as string) || new Date().toISOString(),
  };
}

/**
 * Build an EntityIndex from an array of vault markdown files.
 * This is the "rebuild from vault" operation used on startup.
 */
export function buildIndexFromFiles(files: VaultFile[]): EntityIndex {
  const entries: IndexEntry[] = [];

  for (const file of files) {
    if (!file.content.trim()) continue;
    try {
      const entry = cardToIndexEntry(file.content, file.path);
      entries.push(entry);
    } catch {
      // Skip files that can't be parsed
    }
  }

  return {
    entries,
    lastRebuild: new Date().toISOString(),
  };
}

/**
 * Extract YAML frontmatter from markdown content.
 */
function extractFrontmatter(markdown: string): Record<string, unknown> | null {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith('---')) return null;

  const secondSep = trimmed.indexOf('---', 3);
  if (secondSep === -1) return null;

  const yamlContent = trimmed.slice(3, secondSep).trim();
  return (load(yamlContent) as Record<string, unknown>) || null;
}

/**
 * Map TraceMind cardType to LifeWiki entity type for view compatibility.
 */
function cardTypeToWikiType(cardType: string): string {
  switch (cardType) {
    case 'person': return 'person';
    case 'object': return 'thing';
    case 'theme': return 'idea';
    default: return 'thing';
  }
}
