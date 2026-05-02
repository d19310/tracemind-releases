/**
 * Knowledge Gap domain model
 * Represents gaps in entity knowledge that need clarification.
 */

import { CardType, MaturityLevel, ATTRIBUTE_PRIORITY } from './context-card';

export type GapType =
  | 'new_entity'
  | 'missing_attribute'
  | 'missing_relation'
  | 'conflicting_info'
  | 'recurring_pattern';

/**
 * Maturity-to-weight mapping for gap scoring
 */
const MATURITY_WEIGHTS: Record<MaturityLevel, number> = {
  L0: 30,
  L1: 20,
  L2: 10,
  L3: 10,
};

/**
 * Attribute priority-to-weight mapping for gap scoring
 */
const ATTRIBUTE_WEIGHTS: Record<string, number> = {
  P0: 10,
  P1: 5,
  P2: 2,
};

export interface KnowledgeGap {
  type: GapType;
  entityName: string;
  entityType: CardType;
  maturityLevel: MaturityLevel;
  attributePriority?: string;
  /** The specific attribute that's missing (for missing_attribute gaps) */
  missingAttribute?: string;
  /** Score used for prioritization */
  score: number;
  description: string;
}

/**
 * Calculate a gap's priority score
 */
export function calculateGapScore(gap: KnowledgeGap): number {
  let score = MATURITY_WEIGHTS[gap.maturityLevel] ?? 10;
  if (gap.attributePriority) {
    score += ATTRIBUTE_WEIGHTS[gap.attributePriority] ?? 2;
  }
  if (gap.type === 'new_entity') {
    score += 10; // L0 + P0 reward for new entities
  }
  return score;
}

/**
 * Detect knowledge gaps for an entity based on its maturity and attributes
 */
export function detectKnowledgeGaps(
  cardType: CardType,
  maturity: MaturityLevel,
  attributes: Record<string, unknown>,
  relationIds: string[],
): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];
  const priority = ATTRIBUTE_PRIORITY[cardType];

  // Detect missing attributes at each priority level
  for (const attr of priority.p0) {
    if (attributes[attr] == null) {
      gaps.push({
        type: 'missing_attribute',
        entityName: '',
        entityType: cardType,
        maturityLevel: maturity,
        attributePriority: 'P0',
        missingAttribute: attr,
        score: 0,
        description: `Missing P0 attribute: ${attr}`,
      });
    }
  }

  for (const attr of priority.p1) {
    if (attributes[attr] == null) {
      gaps.push({
        type: 'missing_attribute',
        entityName: '',
        entityType: cardType,
        maturityLevel: maturity,
        attributePriority: 'P1',
        missingAttribute: attr,
        score: 0,
        description: `Missing P1 attribute: ${attr}`,
      });
    }
  }

  for (const attr of priority.p2) {
    if (attributes[attr] == null) {
      gaps.push({
        type: 'missing_attribute',
        entityName: '',
        entityType: cardType,
        maturityLevel: maturity,
        attributePriority: 'P2',
        missingAttribute: attr,
        score: 0,
        description: `Missing P2 attribute: ${attr}`,
      });
    }
  }

  // Detect missing relations for non-L0 entities
  if (maturity !== 'L0' && relationIds.length === 0) {
    gaps.push({
      type: 'missing_relation',
      entityName: '',
      entityType: cardType,
      maturityLevel: maturity,
      attributePriority: 'P1',
      score: 0,
      description: 'No relations established',
    });
  }

  // Calculate scores for all gaps
  for (const gap of gaps) {
    gap.score = calculateGapScore(gap);
  }

  return gaps.sort((a, b) => b.score - a.score);
}

/**
 * Detect recurring pattern gaps
 * Triggered when a theme appears 3+ times
 */
export function detectRecurringPatternGap(
  themeName: string,
  occurrenceCount: number,
): KnowledgeGap | null {
  if (occurrenceCount >= 3) {
    return {
      type: 'recurring_pattern',
      entityName: themeName,
      entityType: 'theme',
      maturityLevel: 'L1',
      attributePriority: 'P1',
      score: calculateGapScore({
        type: 'recurring_pattern',
        entityName: themeName,
        entityType: 'theme',
        maturityLevel: 'L1',
        attributePriority: 'P1',
        description: '',
      } as KnowledgeGap),
      description: `${themeName} appeared ${occurrenceCount} times - pattern worth understanding`,
    };
  }
  return null;
}
