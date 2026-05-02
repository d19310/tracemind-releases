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

export const PERSON_P0_ATTRIBUTES = ['company', 'role', 'relationship_to_user'];
export const PERSON_P1_ATTRIBUTES = ['responsibility', 'communicationStyle'];
export const PERSON_P2_ATTRIBUTES = ['personality', 'preferences', 'skills'];
export const OBJECT_P0_ATTRIBUTES = ['subtype', 'status'];
export const THEME_P0_ATTRIBUTES = ['subtype'];

/**
 * Valid Object subtypes with their priority levels
 */
export const OBJECT_SUBTYPE_PRIORITY: Record<string, 'P0' | 'P1' | 'P2'> = {
  project: 'P0',
  task: 'P0',
  product: 'P1',
  technology: 'P1',
  document: 'P2',
  location: 'P2',
  other: 'P2',
};

export const VALID_OBJECT_SUBTYPES = Object.keys(OBJECT_SUBTYPE_PRIORITY);

/**
 * Valid Theme subtypes
 */
export const VALID_THEME_SUBTYPES = ['domain', 'habit', 'state', 'pending_decision'] as const;

/**
 * Default subtype for each card type
 */
const DEFAULT_SUBTYPES: Record<CardType, string | undefined> = {
  person: undefined,
  object: 'other',
  theme: 'domain',
};

/**
 * Priority weight values for scoring
 */
export const PRIORITY_WEIGHTS = { P0: 1.5, P1: 1.0, P2: 0.5 };

/**
 * Attribute priority definitions by card type
 */
export const ATTRIBUTE_PRIORITY: Record<CardType, { p0: string[]; p1: string[]; p2: string[] }> = {
  person: { p0: PERSON_P0_ATTRIBUTES, p1: PERSON_P1_ATTRIBUTES, p2: PERSON_P2_ATTRIBUTES },
  object: { p0: OBJECT_P0_ATTRIBUTES, p1: [], p2: [] },
  theme: { p0: THEME_P0_ATTRIBUTES, p1: [], p2: [] },
};

/**
 * Calculate maturity level based on which attributes are filled
 */
export function calculateMaturity(cardType: CardType, attributes: Record<string, unknown>): MaturityLevel {
  const priority = ATTRIBUTE_PRIORITY[cardType];

  const hasP1 = priority.p1.length > 0;
  const hasP2 = priority.p2.length > 0;

  const p0Filled = priority.p0.every(attr => attributes[attr] != null);
  const p1Filled = hasP1 && priority.p1.every(attr => attributes[attr] != null);
  const p2Filled = hasP2 && priority.p2.every(attr => attributes[attr] != null);

  // Only reach L3 if P1 and P2 actually exist AND are filled
  if (p0Filled && hasP1 && p1Filled && hasP2 && p2Filled) return 'L3';
  // Only reach L2 if P1 actually exists AND is filled (plus P0)
  if (p0Filled && hasP1 && p1Filled) return 'L2';
  if (p0Filled) return 'L1';
  return 'L0';
}

/**
 * Calculate priority score for a card
 * Formula: score = priority_weight × frequency × (1 + log(relation_count))
 *
 * priority_weight accumulates by tier completion:
 *   All P0 filled → +1.5
 *   All P1 filled → +1.0
 *   All P2 filled → +0.5
 *   Partial P0 → (filled/total) × 1.5
 */
export function calculatePriorityScore(
  cardType: CardType,
  attributes: Record<string, unknown>,
  relationCount: number,
  frequency: number = 1,
): number {
  const priority = ATTRIBUTE_PRIORITY[cardType];
  if (priority.p0.length + priority.p1.length + priority.p2.length === 0) return 0;

  // Calculate tier weights: partial credit per tier
  let priorityWeight = 0;

  const p0Filled = priority.p0.filter(attr => attributes[attr] != null).length;
  priorityWeight += (p0Filled / Math.max(priority.p0.length, 1)) * PRIORITY_WEIGHTS.P0;

  if (priority.p1.length > 0) {
    const p1Filled = priority.p1.filter(attr => attributes[attr] != null).length;
    priorityWeight += (p1Filled / priority.p1.length) * PRIORITY_WEIGHTS.P1;
  }

  if (priority.p2.length > 0) {
    const p2Filled = priority.p2.filter(attr => attributes[attr] != null).length;
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

/**
 * Validate an Object subtype is in the allowed set
 */
export function validateObjectSubtype(subtype: string): boolean {
  return VALID_OBJECT_SUBTYPES.includes(subtype);
}

/**
 * Validate a Theme subtype is in the allowed set
 */
export function validateThemeSubtype(subtype: string): boolean {
  return (VALID_THEME_SUBTYPES as readonly string[]).includes(subtype);
}

/**
 * Get the default subtype for a card type
 */
export function getDefaultSubtype(cardType: CardType): string | undefined {
  return DEFAULT_SUBTYPES[cardType];
}
