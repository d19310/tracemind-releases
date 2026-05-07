/**
 * Entity Writer — pure helper for building entity file paths and creating cards.
 * Separated from EntityManagerAdapter to enable testing without Obsidian runtime.
 */

import type { CardType } from '../core/context-card';
import { cardToVaultPath } from './card-writer';

export interface CreateEntityInput {
  title: string;
  type: string; // raw entity type from analyzer
}

export interface CreateEntityResult {
  path: string;
  cardType: CardType;
  sanitizedName: string;
}

/**
 * Resolve the vault file path and card type for a new entity.
 * Handles type mapping and filename sanitization (e.g. "项目/A" → "项目_A").
 */
export function resolveEntityPath(input: CreateEntityInput): CreateEntityResult {
  const cardType = mapEntityTypeToCardType(input.type);
  const path = cardToVaultPath(input.title, cardType);
  return { path, cardType, sanitizedName: input.title };
}

function mapEntityTypeToCardType(type: string): CardType {
  if (type === 'person') return 'person';
  if (type === 'object') return 'object';
  if (type === 'theme') return 'theme';
  if (type === 'project' || type === 'thing') return 'object';
  if (type === 'idea' || type === 'knowledge') return 'theme';
  return 'object';
}
