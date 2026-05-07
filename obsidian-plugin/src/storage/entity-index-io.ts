/**
 * Entity Index File I/O
 * Reads/writes entity index from/to Obsidian vault files.
 * Complements the pure data operations in entity-index.ts.
 */

import yaml from 'js-yaml';
import { IndexEntry, EntityIndex } from './entity-index';
import { generateEntityId } from '../core/context-card';
import type { CardType } from '../core/context-card';
import { normalizeEntityAttributes, copyReservedAliases } from '../core/entity-schema';

const load = yaml.load;

const VALID_MATURITIES = new Set(['L0', 'L1', 'L2', 'L3']);

/** Keys excluded from metadata to avoid duplicating top-level IndexEntry fields */
const METADATA_RESERVED_KEYS = new Set([
  'id', 'name', 'type', 'subtype', 'maturity', 'confidence',
  'aliases', 'createdAt', 'lastUpdated', 'lifecycle', 'importance',
  'userId', 'relatedPeople', 'relatedObjects', 'relatedThemes',
  'evidenceEntryIds', 'interactions', 'filePath', 'relationCount',
  'summary',
]);
// Note: 'status' intentionally NOT in reserved — legacy business status flows to metadata.

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

  const cardType = (frontmatter?.type as CardType) || 'person';
  const rawMaturity = frontmatter?.maturity as string | undefined;
  const maturity = (rawMaturity && VALID_MATURITIES.has(rawMaturity)) ? rawMaturity : 'L0';
  const confidence = typeof frontmatter?.confidence === 'number' ? frontmatter.confidence : 0.5;
  const aliases = Array.isArray(frontmatter?.aliases) ? frontmatter.aliases : [];
  const summaryFromFM = frontmatter?.summary as string | undefined;
  const subtype = frontmatter?.subtype as string | undefined;

  // Extract raw business attributes from frontmatter
  const rawAttributes: Record<string, unknown> = {};
  if (frontmatter) {
    for (const [key, value] of Object.entries(frontmatter)) {
      if (!METADATA_RESERVED_KEYS.has(key) && value != null) {
        rawAttributes[key] = value;
      }
    }
  }

  // Subtype-aware reserved alias copy: let maturity/confidence
  // flow through as aliases where the schema supports it
  copyReservedAliases(cardType, subtype, frontmatter || {}, rawAttributes);

  // Normalize: alias → canonical key
  const normalizedAttrs = normalizeEntityAttributes(cardType, subtype, rawAttributes);

  // summary: prefer explicit summary, fall back to context alias
  const summary = summaryFromFM
    || (normalizedAttrs.summary as string | undefined)
    || (rawAttributes.context as string | undefined)
    || undefined;

  // Build metadata from normalized attributes
  const metadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(normalizedAttrs)) {
    if (!METADATA_RESERVED_KEYS.has(key) && value != null) {
      metadata[key] = value;
    }
  }
  // Preserve old alias fields in metadata too
  for (const [key, value] of Object.entries(rawAttributes)) {
    if (!METADATA_RESERVED_KEYS.has(key) && value != null) {
      if (!(key in normalizedAttrs) || normalizedAttrs[key] == null) {
        metadata[key] = value;
      }
    }
  }

  return {
    id: (frontmatter?.id as string) || generateEntityId(name),
    name,
    cardType,
    type: cardTypeToWikiType(cardType),
    subtype,
    summary,
    maturity,
    confidence,
    filePath,
    aliases,
    relationCount: 0,
    lastUpdated: (frontmatter?.lastUpdated as string) || new Date().toISOString(),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
