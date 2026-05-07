/**
 * Context Card markdown serialization for Obsidian vault storage
 * Handles frontmatter parsing/generation and card body rendering.
 */

import yaml from 'js-yaml';
const stringify = yaml.dump;
const load = yaml.load;
import { ContextCard, CardType, MaturityLevel, CardStatus, generateEntityId } from '../core/context-card';
import { getSubtypeLabel } from '../ai/entity-type-config';
import { getAttributesByPriority, getEntitySchema, normalizeEntityAttributes, copyReservedAliases } from '../core/entity-schema';
import type { AttributeSchema } from '../core/entity-schema';

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
const VALID_MATURITIES = new Set(['L0', 'L1', 'L2', 'L3']);
function isValidMaturity(value: unknown): value is MaturityLevel {
  return typeof value === 'string' && VALID_MATURITIES.has(value);
}

export function parseCardMarkdown(markdown: string): ContextCard {
  const parts = parseMarkdownStructure(markdown);
  const frontmatter = parts.frontmatter as Record<string, unknown>;

  // Extract typed fields from frontmatter
  const cardType = frontmatter.type as CardType;
  const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [];

  const VALID_CARD_STATUSES = new Set(['needs_confirmation', 'observing', 'active', 'archived']);

  // Build attribute fields (everything not in the reserved set).
  // 'status' is conditionally reserved: only treated as card.status if
  // it's a valid CardStatus; otherwise kept in attributes for legacy compat.
  const baseReservedKeys = new Set([
    'id', 'name', 'type', 'maturity', 'confidence',
    'aliases', 'createdAt', 'lastUpdated', 'lifecycle', 'importance',
    'userId', 'relatedPeople', 'relatedObjects', 'relatedThemes',
    'evidenceEntryIds',
  ]);

  // Conditionally treat status as a reserved key:
  // valid CardStatus → top-level; otherwise → keep in attributes
  const frontmatterStatus = frontmatter.status as string | undefined;
  const isStatusReserved = frontmatterStatus != null && VALID_CARD_STATUSES.has(frontmatterStatus);

  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value == null) continue;
    if (baseReservedKeys.has(key)) continue;
    if (key === 'status' && isStatusReserved) continue;
    attributes[key] = value;
  }

  // Subtype-aware reserved alias: copy frontmatter maturity/confidence
  // into attributes when they serve as schema aliases (e.g. confidence
  // → judgmentConfidence on judgment theme cards)
  const subtype = typeof attributes.subtype === 'string' ? attributes.subtype : undefined;
  copyReservedAliases(cardType, subtype, frontmatter, attributes);

  // Normalize: ensure canonical keys for legacy alias fields
  const normalizedAttributes = normalizeEntityAttributes(cardType, subtype, attributes);

  return {
    id: frontmatter.id as string || generateEntityId(frontmatter.name as string),
    userId: '',
    cardType,
    name: frontmatter.name as string,
    aliases,
    attributes: normalizedAttributes,
    relatedPeople: [],
    relatedObjects: [],
    relatedThemes: [],
    evidenceEntryIds: [],
    confidence: typeof frontmatter.confidence === 'number' ? frontmatter.confidence : 0.5,
    maturity: isValidMaturity(frontmatter.maturity) ? frontmatter.maturity as MaturityLevel : 'L0',
    status: isStatusReserved ? (frontmatterStatus as CardStatus) : 'needs_confirmation',
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
 * Build label lookup from schema commonAttributes + subtype attributes.
 */
function buildDisplayLabelMap(cardType: CardType, subtype?: string): Map<string, string> {
  const map = new Map<string, string>();
  const schema = getEntitySchema(cardType);
  for (const attr of schema.commonAttributes) {
    map.set(attr.key, attr.label);
  }
  if (subtype && schema.subtypes?.[subtype]) {
    for (const attr of schema.subtypes[subtype].attributes) {
      if (!map.has(attr.key)) map.set(attr.key, attr.label);
    }
  }
  return map;
}

/**
 * Read attribute value, preferring canonical key then legacy aliases.
 */
function getAttributeDisplayValue(
  attributes: Record<string, unknown>,
  attr: AttributeSchema,
): unknown {
  // Try canonical key
  if (attributes[attr.key] != null && attributes[attr.key] !== '') {
    return attributes[attr.key];
  }
  // Try legacy aliases
  if (attr.aliases) {
    for (const alias of attr.aliases) {
      if (attributes[alias] != null && attributes[alias] !== '') {
        return attributes[alias];
      }
    }
  }
  return undefined;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'object' && value !== null) {
    try { return JSON.stringify(value); } catch { return ''; }
  }
  return String(value);
}

/**
 * Format card attributes into a human-readable summary.
 * Now schema-driven: uses getAttributesByPriority(cardType, subtype) +
 * schema labels to decide display order and field names.
 */
function formatAttributeSummary(card: ContextCard): string[] {
  const lines: string[] = [];
  const attrs = card.attributes;
  const subtype = typeof attrs.subtype === 'string' ? attrs.subtype : undefined;
  const priority = getAttributesByPriority(card.cardType, subtype);
  const labelMap = buildDisplayLabelMap(card.cardType, subtype);
  const schema = getEntitySchema(card.cardType);

  // Build a set of all displayable attribute schemas
  const displaySchemas = new Map<string, AttributeSchema>();
  for (const attr of schema.commonAttributes) {
    displaySchemas.set(attr.key, attr);
  }
  if (subtype && schema.subtypes?.[subtype]) {
    for (const attr of schema.subtypes[subtype].attributes) {
      if (!displaySchemas.has(attr.key)) displaySchemas.set(attr.key, attr);
    }
  }

  // Show subtype label first for object/theme
  if ((card.cardType === 'object' || card.cardType === 'theme') && attrs.subtype) {
    const subtypeLabel = getSubtypeLabel(card.cardType, attrs.subtype as string) || attrs.subtype;
    lines.push('- 类型：' + subtypeLabel);
  }

  // Show P0 then P1 attributes that have values (skip 'subtype' as it's shown above)
  const shownKeys = new Set<string>(['subtype']);
  const orderedKeys = [...priority.p0, ...priority.p1];
  for (const key of orderedKeys) {
    if (shownKeys.has(key)) continue;
    const schema = displaySchemas.get(key);
    if (!schema) continue;
    const value = getAttributeDisplayValue(attrs, schema);
    if (value !== undefined) {
      const label = labelMap.get(key) || key;
      lines.push(`- ${label}：${formatValue(value)}`);
      shownKeys.add(key);
    }
  }

  // Fallback: show any P2 that happens to be filled (optional polish)
  for (const key of priority.p2) {
    if (shownKeys.has(key)) continue;
    const schema = displaySchemas.get(key);
    if (!schema) continue;
    const value = getAttributeDisplayValue(attrs, schema);
    if (value !== undefined) {
      const label = labelMap.get(key) || key;
      lines.push(`- ${label}：${formatValue(value)}`);
      shownKeys.add(key);
    }
  }

  // Preserve legacy fields not in schema (backward compat for old cards)
  const schemaKnownKeys = new Set(displaySchemas.keys());
  for (const aliases of displaySchemas.values()) {
    if (aliases.aliases) {
      for (const a of aliases.aliases) schemaKnownKeys.add(a);
    }
  }
  for (const [key, value] of Object.entries(attrs)) {
    if (shownKeys.has(key)) continue;
    if (schemaKnownKeys.has(key)) continue;
    // Skip internal/reserved
    if (key === 'interactions' || key === 'relatedEntities') continue;
    if (value != null && value !== '') {
      lines.push(`- ${key}：${formatValue(value)}`);
      shownKeys.add(key);
    }
  }

  return lines;
}
