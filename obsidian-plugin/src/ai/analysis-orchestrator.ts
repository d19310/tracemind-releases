/**
 * Analysis Orchestrator
 * Coordinates diary analysis, Context Card creation/updates, and entity indexing.
 * Handles both interactive analysis (user-triggered) and auto-analysis (on save).
 */

import { App } from 'obsidian';
import { ContextCard, CardType, MaturityLevel, calculateMaturity } from '../core/context-card';
import { EntityIndex, searchByName, upsertEntry, IndexEntry } from '../storage/entity-index';
import { cardToIndexEntry } from '../storage/entity-index-io';
import { upsertCard, readCardFromVault, cardToVaultPath } from '../storage/card-writer';
import { cardToMarkdown } from '../storage/markdown-card';
import { AnalysisService, AnalysisResult, AnalyzedEntity, LLMConfig } from './analysis-service';

/**
 * Minimum character count to trigger auto-analysis.
 * Prevents analysis on single-word notes or whitespace.
 */
export const AUTO_ANALYSIS_MIN_CHARS = 5;

/**
 * Determine if an entity should be silently updated (no user confirmation needed).
 * L2+ entities and confirmed/archived status can be updated silently.
 */
export function shouldSilentUpdate(maturity: MaturityLevel): boolean {
  return maturity === 'L2' || maturity === 'L3';
}

/**
 * Determine if text should trigger auto-analysis.
 */
export function shouldAutoAnalyze(text: string): boolean {
  return text.trim().length >= AUTO_ANALYSIS_MIN_CHARS;
}

/**
 * Result of processing an analyzed entity.
 */
export interface EntityProcessingResult {
  entity: AnalyzedEntity;
  action: 'created' | 'updated' | 'skipped' | 'confirmed';
  cardPath?: string;
  error?: string;
}

/**
 * Orchestrator that processes analysis results and writes Context Cards.
 */
export class AnalysisOrchestrator {
  constructor(
    private app: App,
    private entityIndex: EntityIndex,
    private llmConfig?: LLMConfig | null,
  ) {}

  /**
   * Analyze diary text and process all resulting Context Cards.
   *
   * Flow:
   * 1. Run analysis (rule-based + LLM if configured)
   * 2. For each entity:
   *    - If existing (matched index): check if silent update allowed
   *    - If new: create candidate card (L0, needs confirmation)
   *    - If L2+: silently update card with new information
   * 3. Update entity index
   * 4. Return results with action taken per entity
   */
  async analyzeAndProcess(
    diaryText: string,
    _options?: { interactive: boolean },
  ): Promise<{ result: AnalysisResult; processed: EntityProcessingResult[] }> { void _options;
    // Step 1: Run analysis
    const analysisResult = await AnalysisService.analyzeBlockAsync(
      diaryText,
      this.buildExistingCardsMap(),
      this.llmConfig,
    );

    // Step 2: Process each entity
    const processed: EntityProcessingResult[] = [];

    for (const entity of analysisResult.entities) {
      const result = await this.processEntity(entity);
      processed.push(result);
    }

    return { result: analysisResult, processed };
  }

  /**
   * Process a single analyzed entity.
   */
  private async processEntity(entity: AnalyzedEntity): Promise<EntityProcessingResult> {
    try {
      // Check if entity already exists
      const existing = searchByName(this.entityIndex, entity.name);
      const existingEntry = existing.find(e => e.name.toLowerCase() === entity.name.toLowerCase()) || existing[0];

      if (existingEntry) {
        return await this.updateExistingEntity(entity, existingEntry);
      }

      // New entity - create candidate card
      return await this.createNewCard(entity);
    } catch (e) {
      return {
        entity,
        action: 'skipped',
        error: (e as Error).message,
      };
    }
  }

  /**
   * Create a new Context Card for a newly detected entity.
   */
  private async createNewCard(entity: AnalyzedEntity): Promise<EntityProcessingResult> {
    const attributes = entity.subtype ? { subtype: entity.subtype } : {};
    const card = ContextCard.create({
      name: entity.name,
      cardType: entity.type,
      attributes,
      aliases: [],
    });

    // Set confidence from extraction
    card.confidence = entity.confidence ?? 0.5;
    card.lastUpdated = new Date().toISOString();

    // Write to vault
    await upsertCard(this.app, card);

    // Update index
    const path = cardToVaultPath(card.name, card.cardType);
    const md = cardToMarkdown(card);
    const entry = cardToIndexEntry(md, path);
    this.entityIndex = upsertEntry(this.entityIndex, entry);

    return {
      entity,
      action: 'created',
      cardPath: path,
    };
  }

  /**
   * Update an existing entity's Context Card.
   * Silent update for L2+ entities, otherwise mark as needing confirmation.
   */
  private async updateExistingEntity(
    entity: AnalyzedEntity,
    _existingEntry: IndexEntry,
  ): Promise<EntityProcessingResult> { void _existingEntry;
    // Read current card from vault
    const card = await readCardFromVault(this.app, entity.name, entity.type);
    if (!card) {
      // Card file doesn't exist but index has it - recreate
      return this.createNewCard(entity);
    }

    // Determine if we should silently update
    if (shouldSilentUpdate(card.maturity)) {
      return this.silentUpdateCard(card, entity);
    }

    // L0/L1 - mark as needs confirmation, don't auto-update
    card.lastUpdated = new Date().toISOString();
    card.confidence = Math.max(card.confidence, entity.confidence ?? 0.5);

    await upsertCard(this.app, card, card.name);

    return {
      entity,
      action: 'confirmed',
      cardPath: cardToVaultPath(card.name, card.cardType),
    };
  }

  /**
   * Silently update an L2+ card with new information.
   */
  private async silentUpdateCard(card: ContextCard, entity: AnalyzedEntity): Promise<EntityProcessingResult> {
    // Update confidence
    card.confidence = Math.max(card.confidence, entity.confidence ?? 0.5);
    card.lastUpdated = new Date().toISOString();

    // Merge attributes (don't overwrite existing values)
    if (entity.subtype && !card.attributes.subtype) {
      card.attributes.subtype = entity.subtype;
    }

    // Re-calculate maturity with updated attributes
    card.maturity = calculateMaturity(card.cardType, card.attributes);

    await upsertCard(this.app, card, card.name);

    // Update index
    const path = cardToVaultPath(card.name, card.cardType);
    const md = cardToMarkdown(card);
    const entry = cardToIndexEntry(md, path);
    this.entityIndex = upsertEntry(this.entityIndex, entry);

    return {
      entity,
      action: 'updated',
      cardPath: path,
    };
  }

  /**
   * Build a Map of existing cards for the analysis service.
   */
  private buildExistingCardsMap(): Map<string, { name: string; cardType: CardType; maturity: string }> {
    const map = new Map<string, { name: string; cardType: CardType; maturity: string }>();
    for (const entry of this.entityIndex.entries) {
      map.set(entry.id, {
        name: entry.name,
        cardType: entry.cardType,
        maturity: entry.maturity,
      });
    }
    return map;
  }
}
