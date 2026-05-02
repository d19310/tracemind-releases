/**
 * Analysis Service
 * Orchestrates the flow from diary block analysis to entity extraction
 * and context card creation with priority-ordered clarification.
 */

import { extractEntities, ExtractedEntity } from './entity-extractor';
import { ContextCard, calculateMaturity, CardType } from '../core/context-card';

export interface AnalyzedEntity extends ExtractedEntity {
  isNew: boolean;
  existingCardId?: string;
  maturity?: string;
  clarificationQuestions: string[];
}

export interface AnalysisResult {
  entities: AnalyzedEntity[];
  newEntities: AnalyzedEntity[];
  existingEntities: AnalyzedEntity[];
  hasClarifications: boolean;
}

/**
 * Default clarification questions by entity type
 */
const CLARIFICATION_QUESTIONS: Record<CardType, string[]> = {
  person: [
    '这个人是做什么工作的？',
    '你们是什么关系？',
    '在哪个公司或组织？',
  ],
  object: [
    '这个的具体内容是什么？',
    '当前进展如何？',
    '有明确的截止时间吗？',
  ],
  theme: [
    '这个主题涉及哪些方面？',
    '发生频率如何？',
    '对你的影响程度如何？',
  ],
};

/**
 * Type priority for ordering clarification
 * P0 = person (highest), P1 = object, P2 = theme
 */
const TYPE_PRIORITY: Record<CardType, number> = {
  person: 0,
  object: 1,
  theme: 2,
};

/**
 * Generate clarification questions for a new entity
 */
function generateQuestions(entity: ExtractedEntity): string[] {
  const questions = CLARIFICATION_QUESTIONS[entity.type] || [];
  // Return first 2 questions as default
  return questions.slice(0, 2);
}

/**
 * Check if an entity exists in the card store
 */
function findExistingEntity(
  entity: ExtractedEntity,
  existingCards: Map<string, { name: string; cardType: CardType; maturity: string }>,
): { cardId: string; maturity: string } | null {
  for (const [id, card] of existingCards) {
    if (card.name === entity.name) {
      return { cardId: id, maturity: card.maturity };
    }
  }
  return null;
}

/**
 * Main analysis entry point
 *
 * Analyzes diary text, extracts entities, checks against existing cards,
 * and returns prioritized results with clarification questions.
 */
export class AnalysisService {
  static analyzeBlock(
    diaryText: string,
    existingCards: Map<string, { name: string; cardType: CardType; maturity: string }>,
  ): AnalysisResult {
    const extracted = extractEntities(diaryText, new Map());
    const analyzed: AnalyzedEntity[] = [];

    for (const entity of extracted) {
      const existing = findExistingEntity(entity, existingCards);
      const analyzedEntity: AnalyzedEntity = {
        ...entity,
        isNew: !existing,
        existingCardId: existing?.cardId,
        maturity: existing?.maturity,
        clarificationQuestions: existing ? [] : generateQuestions(entity),
      };
      analyzed.push(analyzedEntity);
    }

    // Sort by priority: new first, then by type priority
    analyzed.sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
    });

    return {
      entities: analyzed,
      newEntities: analyzed.filter(e => e.isNew),
      existingEntities: analyzed.filter(e => !e.isNew),
      hasClarifications: analyzed.some(e => e.isNew),
    };
  }

  /**
   * Generate a natural language summary of analysis results
   */
  static summarizeResult(result: AnalysisResult): string {
    if (result.entities.length === 0) {
      return '未检测到需要关注的实体。';
    }

    const parts: string[] = [];

    if (result.newEntities.length > 0) {
      const names = result.newEntities.map(e => e.name).join('、');
      parts.push(`发现 ${result.newEntities.length} 个新实体：${names}`);
    }

    if (result.existingEntities.length > 0) {
      const names = result.existingEntities.map(e => e.name).join('、');
      parts.push(`提及 ${result.existingEntities.length} 个已有实体：${names}`);
    }

    if (result.hasClarifications) {
      parts.push('需要进一步澄清信息。');
    }

    return parts.join('\n');
  }
}
