/**
 * Context Card markdown serialization for Obsidian vault storage
 * Handles frontmatter parsing/generation and card body rendering.
 */

import yaml from 'js-yaml';
const stringify = yaml.dump;
const load = yaml.load;
import { ContextCard, ContextCardInput, CardType, MaturityLevel, CardStatus, generateEntityId } from '../core/context-card';

export { ContextCard } from '../core/context-card';

const FRONTMATTER_SEPARATOR = '---';

interface FrontmatterData {
  id: string;
  name: string;
  type: CardType;
  maturity: MaturityLevel;
  confidence: number;
  status: CardStatus;
  aliases: string[];
  createdAt: string;
  lastUpdated: string;
  [key: string]: unknown;
}

/**
 * Serialize a Context Card to Obsidian markdown format
 */
export function cardToMarkdown(card: ContextCard): string {
  // Build frontmatter
  const frontmatter: FrontmatterData = {
    id: card.id,
    name: card.name,
    type: card.cardType,
    maturity: card.maturity,
    confidence: card.confidence,
    status: card.status,
    aliases: card.aliases,
    createdAt: card.createdAt,
    lastUpdated: card.lastUpdated,
  };

  // Flatten attributes into frontmatter (except reserved keys)
  for (const [key, value] of Object.entries(card.attributes)) {
    if (value != null) {
      frontmatter[key] = value;
    }
  }

  // Build body
  const bodyLines: string[] = [`# ${card.name}`, ''];

  // Attribute summary section
  const attrLines = formatAttributeSummary(card);
  if (attrLines.length > 0) {
    bodyLines.push('## 基本信息');
    bodyLines.push(...attrLines);
    bodyLines.push('');
  }

  // Relations section removed — wikilinks are now inline in interaction records

  // Key facts section - include interactions as facts
  const interactions = (card.attributes.interactions as Array<{ content: string; timestamp: string }>) || [];
  if (interactions.length > 0) {
    bodyLines.push('## 互动记录');
    for (const ix of interactions.slice(-5)) {
      const date = ix.timestamp ? new Date(ix.timestamp).toISOString().split('T')[0] : '';
      bodyLines.push('- ' + date + ' ' + ix.content);
    }
    bodyLines.push('');
  } else if (!card.attributes.interactions) {
    // No interactions yet — skip the empty section
  }

  const yaml = stringify(frontmatter).trim();

  return `${FRONTMATTER_SEPARATOR}\n${yaml}\n${FRONTMATTER_SEPARATOR}\n\n${bodyLines.join('\n')}`;
}

/**
 * Parse a Context Card from Obsidian markdown format
 */
export function parseCardMarkdown(markdown: string): ContextCard {
  const parts = parseMarkdownStructure(markdown);
  const frontmatter = parts.frontmatter as Record<string, unknown>;
  const body = parts.body;

  // Extract typed fields from frontmatter
  const cardType = frontmatter.type as CardType;
  const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [];

  // Extract attribute fields (everything not in the reserved set)
  const reservedKeys = new Set([
    'id', 'name', 'type', 'maturity', 'confidence', 'status',
    'aliases', 'createdAt', 'lastUpdated', 'lifecycle', 'importance',
    'userId', 'relatedPeople', 'relatedObjects', 'relatedThemes',
    'evidenceEntryIds',
  ]);

  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!reservedKeys.has(key) && value != null) {
      attributes[key] = value;
    }
  }

  return {
    id: frontmatter.id as string || generateEntityId(frontmatter.name as string),
    userId: '',
    cardType,
    name: frontmatter.name as string,
    aliases,
    attributes,
    relatedPeople: [],
    relatedObjects: [],
    relatedThemes: [],
    evidenceEntryIds: [],
    confidence: (frontmatter.confidence as number) ?? 0.5,
    maturity: (frontmatter.maturity as MaturityLevel) ?? 'L0',
    status: (frontmatter.status as CardStatus) ?? 'needs_confirmation',
    lifecycle: 'candidate',
    importance: 0,
    createdAt: frontmatter.createdAt as string || new Date().toISOString(),
    lastUpdated: frontmatter.lastUpdated as string || new Date().toISOString(),
  };
}

/**
 * Parse markdown into frontmatter and body sections
 */
function parseMarkdownStructure(markdown: string): { frontmatter: unknown; body: string } {
  const trimmed = markdown.trim();

  if (!trimmed.startsWith(FRONTMATTER_SEPARATOR)) {
    return { frontmatter: {}, body: trimmed };
  }

  const secondSep = trimmed.indexOf(FRONTMATTER_SEPARATOR, 3);
  if (secondSep === -1) {
    return { frontmatter: {}, body: trimmed };
  }

  const yamlContent = trimmed.slice(3, secondSep).trim();
  const body = trimmed.slice(secondSep + 3).trim();

  const frontmatter = load(yamlContent) || {};

  return { frontmatter, body };
}

/**
 * Format card attributes into a human-readable summary
 */
function formatAttributeSummary(card: ContextCard): string[] {
  const lines: string[] = [];

  if (card.cardType === 'person') {
    if (card.attributes.company) lines.push('- \u516C\u53F8\uFF1A' + card.attributes.company);
    if (card.attributes.role) lines.push('- \u804C\u4F4D\uFF1A' + card.attributes.role);
    if (card.attributes.relationship_to_user) lines.push('- \u5173\u7CFB\uFF1A' + card.attributes.relationship_to_user);
    if (card.attributes.responsibility) lines.push('- \u804C\u8D23\uFF1A' + card.attributes.responsibility);
  }

  if (card.cardType === 'object') {
    if (card.attributes.subtype) lines.push('- \u7C7B\u578B\uFF1A' + card.attributes.subtype);
    if (card.attributes.status) lines.push('- \u72B6\u6001\uFF1A' + card.attributes.status);
    if (card.attributes.deadline) lines.push('- \u622A\u6B62\u65E5\u671F\uFF1A' + card.attributes.deadline);
  }

  if (card.cardType === 'theme') {
    if (card.attributes.subtype) lines.push('- \u7C7B\u578B\uFF1A' + card.attributes.subtype);
    if (card.attributes.occurrenceCount) lines.push('- \u51FA\u73B0\u6B21\u6570\uFF1A' + card.attributes.occurrenceCount);
  }

  return lines;
}
