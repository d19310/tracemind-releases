/**
 * Analysis Service
 * Orchestrates the flow from diary block analysis to entity extraction
 * and context card creation with priority-ordered clarification.
 */

import { extractEntities, ExtractedEntity } from './entity-extractor';
import { ContextCard, calculateMaturity, calculatePriorityScore, CardType } from '../core/context-card';
import { KnowledgeGap, detectKnowledgeGaps } from '../core/knowledge-gap';

export interface AnalyzedEntity extends ExtractedEntity {
  isNew: boolean;
  existingCardId?: string;
  maturity: string;
  priorityScore: number;
  clarificationQuestions: string[];
  knowledgeGaps?: KnowledgeGap[];
}

export interface AnalysisResult {
  entities: AnalyzedEntity[];
  newEntities: AnalyzedEntity[];
  existingEntities: AnalyzedEntity[];
  hasClarifications: boolean;
  gapCount: number;
  firstQuestion?: string;
}

/**
 * Generate clarification questions from a knowledge gap
 */
function gapToQuestion(gap: KnowledgeGap): string {
  if (gap.type === 'new_entity') {
    const questions: Record<CardType, string> = {
      person: `${gap.entityName} 是谁？请简要描述一下。`,
      object: `${gap.entityName} 是什么？请描述一下。`,
      theme: `${gap.entityName} 是什么主题？涉及哪些方面？`,
    };
    return questions[gap.entityType] || `${gap.entityName} 是什么？`;
  }
  if (gap.type === 'missing_attribute' && gap.missingAttribute) {
    const questions: Record<string, string> = {
      company: `${gap.entityName} 在哪个公司或组织工作？`,
      role: `${gap.entityName} 的职位是什么？`,
      relationship_to_user: `你和${gap.entityName}是什么关系？`,
      subtype: `${gap.entityName} 属于什么类型？`,
      status: `${gap.entityName} 当前状态如何？`,
    };
    return questions[gap.missingAttribute] || `关于${gap.entityName}的${gap.missingAttribute}信息是什么？`;
  }
  if (gap.type === 'missing_relation') {
    return `${gap.entityName} 和什么其他实体有关联？`;
  }
  if (gap.type === 'recurring_pattern') {
    return `${gap.entityName} 已经多次出现，它代表什么？`;
  }
  return `请提供更多关于 ${gap.entityName} 的信息。`;
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
      const attributes = entity.subtype ? { subtype: entity.subtype } : {};
      const maturity = existing?.maturity ?? calculateMaturity(entity.type, attributes);
      const priorityScore = calculatePriorityScore(entity.type, attributes, 0);

      // Detect knowledge gaps
      const gaps: KnowledgeGap[] = [];
      if (existing) {
        // Existing entity - detect missing attributes
        const cardGaps = detectKnowledgeGaps(entity.type, maturity as 'L0' | 'L1' | 'L2' | 'L3', attributes, []);
        gaps.push(...cardGaps);
      } else {
        // New entity
        gaps.push({
          type: 'new_entity',
          entityName: entity.name,
          entityType: entity.type,
          maturityLevel: 'L0',
          attributePriority: 'P0',
          score: 40,
          description: `New entity: ${entity.name}`,
        });
        // Also detect missing attributes
        const cardGaps = detectKnowledgeGaps(entity.type, 'L0', attributes, []);
        gaps.push(...cardGaps);
      }

      const questions = gaps.slice(0, 2).map(gapToQuestion);

      const analyzedEntity: AnalyzedEntity = {
        ...entity,
        isNew: !existing,
        existingCardId: existing?.cardId,
        maturity,
        priorityScore,
        clarificationQuestions: questions,
        knowledgeGaps: gaps,
      };
      analyzed.push(analyzedEntity);
    }

    // Sort by priority: new first, then by priority score descending
    analyzed.sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return b.priorityScore - a.priorityScore;
    });

    const allGaps = analyzed.flatMap(e => e.knowledgeGaps ?? []);
    const firstGap = allGaps.sort((a, b) => b.score - a.score)[0];

    return {
      entities: analyzed,
      newEntities: analyzed.filter(e => e.isNew),
      existingEntities: analyzed.filter(e => !e.isNew),
      hasClarifications: analyzed.some(e => e.isNew),
      gapCount: allGaps.length,
      firstQuestion: firstGap ? gapToQuestion(firstGap) : undefined,
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
