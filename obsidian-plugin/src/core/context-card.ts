/**
 * Context Card domain model
 * Represents an entity (person, object, or theme) extracted from diary entries.
 */

export type CardType = 'person' | 'object' | 'theme';
export type MaturityLevel = 'L0' | 'L1' | 'L2' | 'L3';
export type CardStatus = 'needs_confirmation' | 'observing' | 'active' | 'archived';

export interface ContextCardInput {
  name: string;
  cardType: CardType;
  attributes?: Record<string, unknown>;
  aliases?: string[];
  userId?: string;
}

export interface ContextCard {
  id: string;
  userId: string;
  cardType: CardType;
  name: string;
  aliases: string[];
  attributes: Record<string, unknown>;
  relatedPeople: string[];
  relatedObjects: string[];
  relatedThemes: string[];
  evidenceEntryIds: string[];
  confidence: number;
  maturity: MaturityLevel;
  status: CardStatus;
  lifecycle: 'candidate' | 'observing' | 'confirmed' | 'archived' | 'rejected';
  importance: number;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Generate a deterministic 8-char hex ID from entity name
 */
export function generateEntityId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Priority weight values for scoring
 */
export const PRIORITY_WEIGHTS = { P0: 1.5, P1: 1.0, P2: 0.5 };

// ---------------------------------------------------------------------------
// Subtype lists, priorities, and attribute priority — derived from schema
// ---------------------------------------------------------------------------

import {
  getAttributesByPriority,
  hasAttribute,
  normalizeEntityAttributes,
} from './entity-schema';

export {
  VALID_OBJECT_SUBTYPES,
  VALID_THEME_SUBTYPES,
  OBJECT_SUBTYPE_PRIORITY,
  ATTRIBUTE_PRIORITY,
  validateObjectSubtype,
  validateThemeSubtype,
  getDefaultSubtype,
} from './entity-schema';

/**
 * Calculate maturity level based on which attributes are filled.
 * Now subtype-aware: reads attributes.subtype to pick subtype-specific P0/P1/P2.
 *
 * L0: No P0 attributes filled
 * L1: All P0 attributes filled
 * L2: All P0 filled + at least one P1 attribute filled
 * L3: All P0 filled + at least one P1 + at least one P2 attribute filled
 */
export function calculateMaturity(cardType: CardType, attributes: Record<string, unknown>): MaturityLevel {
  const subtype = typeof attributes.subtype === 'string' ? attributes.subtype : undefined;
  const normalized = normalizeEntityAttributes(cardType, subtype, attributes);
  const priority = getAttributesByPriority(cardType, subtype);

  const p0Filled = priority.p0.length === 0 || priority.p0.every(attr => hasAttribute(normalized, attr));
  const anyP1Filled = priority.p1.some(attr => hasAttribute(normalized, attr));
  const anyP2Filled = priority.p2.some(attr => hasAttribute(normalized, attr));

  if (p0Filled && anyP1Filled && anyP2Filled) return 'L3';
  if (p0Filled && anyP1Filled) return 'L2';
  if (p0Filled) return 'L1';
  return 'L0';
}

/**
 * Calculate priority score for a card.
 * Now subtype-aware: uses getAttributesByPriority(cardType, subtype) +
 * normalizeEntityAttributes + hasAttribute for alias support.
 *
 * Formula: score = priority_weight × frequency × (1 + log(relation_count))
 *
 * priority_weight accumulates by tier completion:
 *   All P0 filled → +PRIORITY_WEIGHTS.P0
 *   All P1 filled → +PRIORITY_WEIGHTS.P1
 *   All P2 filled → +PRIORITY_WEIGHTS.P2
 *   Partial tiers → (filled/total) × tier weight
 *
 * Returns 0 when no attributes are filled (no seed score).
 */
export function calculatePriorityScore(
  cardType: CardType,
  attributes: Record<string, unknown>,
  relationCount: number,
  frequency: number = 1,
): number {
  const subtype = typeof attributes.subtype === 'string' ? attributes.subtype : undefined;
  const normalized = normalizeEntityAttributes(cardType, subtype, attributes);
  const priority = getAttributesByPriority(cardType, subtype);

  // Check if anything at all is filled
  const anyFilled = [...priority.p0, ...priority.p1, ...priority.p2]
    .some(attr => hasAttribute(normalized, attr));
  if (!anyFilled) return 0;

  let priorityWeight = 0;

  if (priority.p0.length > 0) {
    const p0Filled = priority.p0.filter(attr => hasAttribute(normalized, attr)).length;
    priorityWeight += (p0Filled / priority.p0.length) * PRIORITY_WEIGHTS.P0;
  }

  if (priority.p1.length > 0) {
    const p1Filled = priority.p1.filter(attr => hasAttribute(normalized, attr)).length;
    priorityWeight += (p1Filled / priority.p1.length) * PRIORITY_WEIGHTS.P1;
  }

  if (priority.p2.length > 0) {
    const p2Filled = priority.p2.filter(attr => hasAttribute(normalized, attr)).length;
    priorityWeight += (p2Filled / priority.p2.length) * PRIORITY_WEIGHTS.P2;
  }

  return priorityWeight * frequency * (1 + Math.log1p(relationCount));
}

export const ContextCard = {
  create(input: ContextCardInput): ContextCard {
    const now = new Date().toISOString();
    return {
      id: generateEntityId(input.name),
      userId: input.userId || '',
      cardType: input.cardType,
      name: input.name,
      aliases: input.aliases || [],
      attributes: input.attributes || {},
      relatedPeople: [],
      relatedObjects: [],
      relatedThemes: [],
      evidenceEntryIds: [],
      confidence: 0.5,
      maturity: calculateMaturity(input.cardType, input.attributes || {}),
      status: 'needs_confirmation',
      lifecycle: 'candidate',
      importance: 0,
      createdAt: now,
      lastUpdated: now,
    };
  },
};

