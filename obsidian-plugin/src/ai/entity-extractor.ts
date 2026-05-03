/**
 * Entity Extractor - Extract Person/Object/Theme entities from diary text
 */

import { CardType } from '../core/context-card';

export interface ExtractedEntity {
  name: string;
  type: CardType;
  subtype?: string;
  confidence?: number;
}

/**
 * Extract entities from diary text using regex patterns.
 * Used as fallback when LLM extraction is not available.
 */
export function extractEntities(
  _diaryText: string,
  _existingEntities: Map<string, { name: string }>,
): ExtractedEntity[] {
  // Rule-based extraction is deprecated. Use LLM extraction instead.
  return [];
}
