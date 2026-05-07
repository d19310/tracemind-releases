/**
 * Co-occurrence Relationship Inference
 * Detects entity co-occurrences in diary text to infer relations.
 * Simple but effective: if two entities are mentioned in the same sentence,
 * they likely have a relationship.
 */

import { CardType } from './context-card';

export interface CooccurrenceRelation {
  from: string;
  to: string;
  relationType: 'cooccurrence';
  /** Number of sentences where both entities co-occur */
  mentionCount: number;
  /** Confidence based on mention frequency: 0.3 base + 0.1 per additional mention (max 0.9) */
  confidence: number;
}

export interface CooccurrenceEntity {
  name: string;
  type: CardType;
}

/**
 * Infer co-occurrence relations from diary text.
 * Splits text into sentences, finds entities mentioned together.
 */
export function inferCooccurrenceRelations(
  text: string,
  entities: CooccurrenceEntity[],
): CooccurrenceRelation[] {
  // Filter out entities with empty names
  const validEntities = entities.filter(e => e.name && e.name.trim());
  if (validEntities.length < 2) return [];

  // Split into sentences (Chinese + English punctuation)
  const sentences = text.split(/[。；！？.\n]+/).filter(s => s.trim().length > 0);

  // Count co-occurrences per pair
  const pairCounts = new Map<string, number>();

  for (const sentence of sentences) {
    // Find which entities appear in this sentence
    const found = validEntities.filter(e => sentence.includes(e.name));

    if (found.length < 2) continue;

    // Record all pairs
    for (let i = 0; i < found.length; i++) {
      for (let j = i + 1; j < found.length; j++) {
        const key = makePairKey(found[i].name, found[j].name);
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  // Convert to relations
  const relations: CooccurrenceRelation[] = [];
  for (const [key, count] of pairCounts.entries()) {
    const [from, to] = key.split('|');
    const confidence = Math.min(0.3 + (count - 1) * 0.1, 0.9);

    relations.push({
      from,
      to,
      relationType: 'cooccurrence',
      mentionCount: count,
      confidence,
    });
  }

  return relations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Create a canonical pair key (alphabetically ordered) for deduplication.
 */
function makePairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
