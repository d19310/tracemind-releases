/**
 * Analysis Service
 * Orchestrates the flow from diary block analysis to entity extraction
 * and context card creation with priority-ordered clarification.
 */

import { extractEntitiesWithLLM } from './llm-entity-extractor';
import { ContextCard, calculateMaturity, calculatePriorityScore, CardType } from '../core/context-card';
import { KnowledgeGap, detectKnowledgeGaps } from '../core/knowledge-gap';
import { scanDiaryForKnownEntities } from './ac-entity-scanner';
import type { IndexEntry } from '../storage/entity-index';

export interface ExtractedEntity {
  name: string;
  type: CardType;
  subtype?: string;
  confidence?: number;
}

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
  domainCategory?: string;
}

/**
 * Maximum number of entities per block analysis.
 * Prevents noise and keeps the confirmation UI manageable.
 */
export const MAX_ENTITIES_PER_BLOCK = 5;

export interface LLMConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  profileContext?: string;
}

/**
 * Generate clarification questions from a knowledge gap
 */
/** Subtype-specific question templates for object entities — subtype mapped to natural phrasing */
const OBJECT_SUBTYPE_QUESTIONS: Record<string, string> = {
  company:    '\u8FD9\u4E2A**\u516C\u53F8/\u7EC4\u7EC7**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u4E1A\u52A1\u9886\u57DF\u3001\u5408\u4F5C\u5173\u7CFB\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  project:    '\u8FD9\u4E2A**\u9879\u76EE**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  task:       '\u8FD9\u4E2A**\u4EFB\u52A1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  product:    '\u8FD9\u4E2A**\u4EA7\u54C1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u5173\u952E\u7279\u6027\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  technology: '\u8FD9\u4E2A**\u6280\u672F**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  document:   '\u8FD9\u4E2A**\u6587\u6863**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002',
  location:   '\u8FD9\u4E2A**\u5730\u70B9**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u91CC\u3001\u6709\u4EC0\u4E48\u7279\u522B\u4E4B\u5904\u7B49\u3002',
};

/** Subtype-specific question templates for theme entities */
const THEME_SUBTYPE_QUESTIONS: Record<string, string> = {
  friction: '\u8FD9\u4E2A**\u6469\u64E6**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u662F\u4EC0\u4E48\u5BFC\u81F4\u7684\u3001\u6301\u7EED\u591A\u4E45\u4E86\u3001\u5F71\u54CD\u6709\u591A\u5927\uFF1F',
  goal:     '\u8FD9\u4E2A**\u76EE\u6807**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u76EE\u524D\u8FDB\u5C55\u3001\u4E0B\u4E00\u6B65\u8BA1\u5212\u3001\u6709\u4EC0\u4E48\u963B\u7887\uFF1F',
  judgment: '\u8FD9\u4E2A**\u5224\u65AD**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u57FA\u4E8E\u4EC0\u4E48\u5F62\u6210\u7684\u3001\u6709\u591A\u5927\u628A\u63E1\uFF1F',
  idea:     '\u8FD9\u4E2A**\u60F3\u6CD5**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u600E\u4E48\u4EA7\u751F\u7684\u3001\u6709\u6CA1\u6709\u66F4\u5177\u4F53\u7684\u601D\u8003\uFF1F',
};

/**
 * Generate a clarification question from a knowledge gap.
 * For object and theme entities, includes the LLM-inferred subtype in the question
 * so users can see and correct it if needed.
 */
function gapToQuestion(gap: KnowledgeGap, subtype?: string): string {
  if (gap.type === 'new_entity') {
    // Object entities: use subtype-specific question template
    if (gap.entityType === 'object' && subtype && OBJECT_SUBTYPE_QUESTIONS[subtype]) {
      return `${gap.entityName} ${OBJECT_SUBTYPE_QUESTIONS[subtype]}`;
    }
    if (gap.entityType === 'object') {
      return `${gap.entityName} \u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002`;
    }
    // Theme entities: use subtype-specific question template
    if (gap.entityType === 'theme' && subtype && THEME_SUBTYPE_QUESTIONS[subtype]) {
      return `${gap.entityName} ${THEME_SUBTYPE_QUESTIONS[subtype]}`;
    }
    if (gap.entityType === 'theme') {
      return `${gap.entityName} \u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u8FD9\u4E2A\u60C5\u51B5\u5F71\u54CD\u6709\u591A\u5927\u3001\u6301\u7EED\u591A\u4E45\u4E86\uFF1F`;
    }
    // Person entities: keep existing question template
    if (gap.entityType === 'person') {
      return `${gap.entityName} \u662F\u8C01\uFF1F\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u5BB6\u516C\u53F8\u3001\u4EC0\u4E48\u804C\u4F4D\u3001\u548C\u4F60\u7684\u5173\u7CFB\u7B49\u3002`;
    }
    return `${gap.entityName} \u662F\u4EC0\u4E48\uFF1F`;
  }
  if (gap.type === 'missing_attribute' && gap.missingAttribute) {
    const questions: Record<string, string> = {
      // Person P0 attributes
      company: gap.entityName + ' \u5728\u54EA\u4E2A\u516C\u53F8\u6216\u7EC4\u7EC7\u5DE5\u4F5C\uFF1F',
      role: gap.entityName + ' \u7684\u804C\u4F4D\u6216\u89D2\u8272\u662F\u4EC0\u4E48\uFF1F',
      relationship_to_user: '\u4F60\u548C ' + gap.entityName + ' \u662F\u4EC0\u4E48\u5173\u7CFB\uFF1F',
      // Person P1 attributes
      responsibility: gap.entityName + ' \u8D1F\u8D23\u4EC0\u4E48\u5DE5\u4F5C\uFF1F',
      // Object P0/P1 attributes
      subtype: gap.entityName + ' \u662F\u4EC0\u4E48\u7C7B\u578B\uFF1F\u6BD4\u5982\u9879\u76EE\u3001\u4EFB\u52A1\u3001\u4EA7\u54C1\u7B49\uFF1F',
      status: gap.entityName + ' \u5F53\u524D\u7684\u72B6\u6001\u662F\u4EC0\u4E48\uFF1F',
      deadline: gap.entityName + ' \u6709\u622A\u6B62\u65E5\u671F\u6216\u65F6\u95F4\u8282\u70B9\u5417\uFF1F',
    };
    return questions[gap.missingAttribute] || `\u5173\u4E8E ${gap.entityName} \u7684 ${gap.missingAttribute} \u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F`;
  }
  if (gap.type === 'missing_relation') {
    return `${gap.entityName} \u548C\u4EC0\u4E48\u5176\u4ED6\u5B9E\u4F53\u6709\u5173\u8054\uFF1F`;
  }
  if (gap.type === 'recurring_pattern') {
    return `${gap.entityName} \u5DF2\u7ECF\u591A\u6B21\u51FA\u73B0\uFF0C\u5B83\u4EE3\u8868\u4EC0\u4E48\uFF1F`;
  }
  return `\u8BF7\u63D0\u4F9B\u66F4\u591A\u5173\u4E8E ${gap.entityName} \u7684\u4FE1\u606F\u3002`;
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
  /**
   * Main analysis entry point.
   * Extracts entities using LLM, checks against existing cards,
   * and returns prioritized results with clarification questions.
   */
  static analyzeBlock(
    diaryText: string,
    existingCards: Map<string, { name: string; cardType: CardType; maturity: string }>,
  ): AnalysisResult {
    // This is a sync method that delegates to the async version.
    // The caller should use analyzeBlockAsync for LLM-based extraction.
    console.warn('[TraceMind] analyzeBlock (sync) is deprecated, use analyzeBlockAsync for LLM extraction');
    return {
      entities: [],
      newEntities: [],
      existingEntities: [],
      hasClarifications: false,
      gapCount: 0,
    };
  }

  /**
   * Async analysis entry point using LLM extraction.
   */
  static async analyzeBlockAsync(
    diaryText: string,
    existingCards: Map<string, { name: string; cardType: CardType; maturity: string }>,
    llmConfig?: LLMConfig | null,
    entityIndexEntries?: IndexEntry[],
  ): Promise<AnalysisResult> {
    // Step 1: AC pre-scan for known entities in diary text
    const acMatches = entityIndexEntries && entityIndexEntries.length > 0
      ? scanDiaryForKnownEntities(diaryText, entityIndexEntries)
      : [];
    const knownNames = [...new Set(acMatches.map(m => m.entityName))];

    // Build candidate list for LLM: AC exact matches + entities with string overlap in diary
    const acKnownSet = new Set(acMatches.map(m => m.entityId));
    const candidates = entityIndexEntries && entityIndexEntries.length > 0
      ? entityIndexEntries.filter(e => {
          if (acKnownSet.has(e.id)) return true; // AC matched
          // Simple fuzzy: any 2+ char substring of entity name appears in diary
          for (let i = 0; i <= e.name.length - 2; i++) {
            if (diaryText.includes(e.name.slice(i, i + 2))) return true;
          }
          // Also check aliases
          for (const alias of e.aliases || []) {
            for (let i = 0; i <= alias.length - 2; i++) {
              if (diaryText.includes(alias.slice(i, i + 2))) return true;
            }
          }
          return false;
        }).slice(0, 10) // cap at 10 candidates to keep prompt lean
      : [];

    const candidateInfo = candidates.length > 0
      ? candidates.map(e => {
          const aliasesStr = e.aliases && e.aliases.length > 0
            ? '\uFF08\u522B\u540D\uFF1A' + e.aliases.join('\u3001') + '\uFF09'
            : '';
          return e.name + aliasesStr + ' [' + e.cardType + ']';
        }).join('\u3001')
      : '';

    console.log('[TraceMind] AC scan found', acMatches.length, 'matches,', candidates.length, 'candidates for LLM:', candidateInfo);

    let entities: ExtractedEntity[] = [];
    let domainCategory: string | undefined;

    if (llmConfig && llmConfig.apiKey && llmConfig.baseUrl && llmConfig.model) {
      console.log('[TraceMind] LLM config:', { baseUrl: llmConfig.baseUrl, model: llmConfig.model, hasApiKey: !!llmConfig.apiKey });
      try {
        // Pass known entity names to LLM so it can skip them
        const enhancedConfig = {
          ...llmConfig,
          profileContext: llmConfig.profileContext
            ? llmConfig.profileContext + (candidateInfo ? '\n\n已知实体（已建档，不要重复提取，注意相似名称）：' + candidateInfo : '')
            : (candidateInfo ? '\n\n已知实体（已建档，不要重复提取，注意相似名称）：' + candidateInfo : ''),
        };
        const output = await extractEntitiesWithLLM(diaryText, enhancedConfig);
        console.log('[TraceMind] LLM extracted:', output.entities.length, output.entities, 'domain:', output.domain);
        entities = output.entities.map(e => ({ ...e }));
        domainCategory = output.domain;
      } catch (e) {
        console.warn('[TraceMind] LLM extraction failed:', (e as Error).message);
      }
    } else {
      console.log('[TraceMind] No LLM config provided, skipping extraction');
    }

    // Add AC-matched known entities to the entity list so they appear in results
    // (LLM correctly skips them, but we still want to show them in the UI)
    // Deduplicate by entity name to avoid duplicates from multiple match types
    const acEntitySet = new Set(entities.map(e => e.name));
    const acSeen = new Set<string>();
    for (const match of acMatches) {
      if (acSeen.has(match.entityName)) continue; // skip duplicate AC matches
      acSeen.add(match.entityName);
      if (!acEntitySet.has(match.entityName)) {
        const entry = entityIndexEntries?.find(e => e.name === match.entityName);
        if (entry) {
          entities.push({
            name: match.entityName,
            type: entry.cardType,
            confidence: 0.9,
          });
        }
      }
    }

    // Analyze entities through the pipeline
    const result = analyzeEntities(entities, existingCards);
    result.domainCategory = domainCategory;
    return result;
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

/**
 * Merge entities from multiple sources, deduplicating by name.
 */
function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Map<string, ExtractedEntity>();
  for (const entity of entities) {
    const key = entity.name.toLowerCase();
    const existing = seen.get(key);
    if (!existing || (entity.confidence ?? 0) > (existing.confidence ?? 0)) {
      seen.set(key, entity);
    }
  }
  return Array.from(seen.values());
}

/**
 * Run the analysis pipeline on a set of extracted entities.
 * Shared between sync analyzeBlock and async analyzeBlockAsync.
 */
function analyzeEntities(
  entities: ExtractedEntity[],
  existingCards: Map<string, { name: string; cardType: CardType; maturity: string }>,
): AnalysisResult {
  const analyzed: AnalyzedEntity[] = [];

  for (const entity of entities) {
    const existing = findExistingEntity(entity, existingCards);
    const attributes = entity.subtype ? { subtype: entity.subtype } : {};
    const maturity = existing?.maturity ?? calculateMaturity(entity.type, attributes);
    const priorityScore = calculatePriorityScore(entity.type, attributes, 0);

    // Detect knowledge gaps
    const gaps: KnowledgeGap[] = [];
    if (existing) {
      const cardGaps = detectKnowledgeGaps(entity.type, maturity as 'L0' | 'L1' | 'L2' | 'L3', attributes, []);
      gaps.push(...cardGaps);
    } else {
      gaps.push({
        type: 'new_entity',
        entityName: entity.name,
        entityType: entity.type,
        maturityLevel: 'L0',
        attributePriority: 'P0',
        score: 40,
        description: `New entity: ${entity.name}`,
      });
      const cardGaps = detectKnowledgeGaps(entity.type, 'L0', attributes, []);
      gaps.push(...cardGaps);
    }

    // Generate questions, passing subtype so gapToQuestion can use subtype-specific phrasing
    const questions = gaps.slice(0, 2).map(g => gapToQuestion(g, entity.subtype));

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

  // Sort: new first, then by priority score descending
  // (priorityScore seeds via P0 count: person 0.5 > object 0.33 > theme 0.17)
  analyzed.sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.priorityScore - a.priorityScore;
  });

  // Cap entities to MAX_ENTITIES_PER_BLOCK
  const capped = analyzed.slice(0, MAX_ENTITIES_PER_BLOCK);
  const allGaps = capped.flatMap(e => e.knowledgeGaps ?? []);
  const firstGap = allGaps.sort((a, b) => b.score - a.score)[0];

  return {
    entities: capped,
    newEntities: capped.filter(e => e.isNew),
    existingEntities: capped.filter(e => !e.isNew),
    hasClarifications: capped.some(e => e.isNew),
    gapCount: allGaps.length,
    firstQuestion: firstGap ? gapToQuestion(firstGap) : undefined,
  };
}
