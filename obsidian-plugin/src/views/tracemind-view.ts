/**
 * TraceMind View - Main diary editor view
 */

import { ItemView, WorkspaceLeaf, setIcon, Notice, TFile } from 'obsidian';
import type TraceMindPlugin from '../main';
import { parseDiaryContent, formatDiaryContent, Block } from '../core/diary-parser';
import { ContextCard, calculateMaturity, CardType } from '../core/context-card';
import { cardToMarkdown, parseCardMarkdown } from '../storage/markdown-card';
import { AnalysisService } from '../ai/analysis-service';
import { listMarkdownFiles } from '../vault';
import { ConfirmationFlow, PendingEntity } from '../core/confirmation-flow';
import { buildCardUpdate, parseWikilinks, buildWikilinkSection } from '../storage/card-writer';

export const VIEW_TYPE_TRACEMIND = 'tracemind-view';

const DIARY_FOLDER = 'Daily';

export class TraceMindView extends ItemView {
  private plugin: TraceMindPlugin;
  private currentDate: Date;
  private editorEl: HTMLTextAreaElement | null = null;
  private blocksContainer: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: TraceMindPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentDate = new Date();
  }

  getViewType(): string {
    return VIEW_TYPE_TRACEMIND;
  }

  getDisplayText(): string {
    return 'TraceMind';
  }

  getIcon(): string {
    return 'brain';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    // Header with date
    const headerEl = container.createEl('div', { cls: 'tracemind-header' });
    headerEl.createEl('h2', { text: this.formatDateTitle(this.currentDate) });

    // New block button
    const btnContainer = headerEl.createEl('div', { cls: 'tracemind-actions' });
    const addBtn = btnContainer.createEl('button', { text: '+ 添加记录' });
    addBtn.addEventListener('click', () => this.addBlock());

    // Blocks container
    this.blocksContainer = container.createEl('div', { cls: 'tracemind-blocks' });

    await this.loadCurrentDay();
  }

  async onClose() {
    // Nothing to clean up
  }

  /**
   * Load today's diary file or create new one
   */
  private async loadCurrentDay() {
    const fileName = this.formatDateFileName(this.currentDate);
    const filePath = `${DIARY_FOLDER}/${fileName}.md`;
    const folder = this.plugin.app.vault.getFolderByPath(DIARY_FOLDER);
    if (!folder) {
      await this.plugin.app.vault.createFolder(DIARY_FOLDER);
    }

    let content = '';
    const file = this.plugin.app.vault.getFileByPath(filePath);
    if (file) {
      content = await this.plugin.app.vault.read(file);
    } else {
      // Create new day file
      content = `# ${this.formatDateTitle(this.currentDate)}\n\n`;
      await this.plugin.app.vault.create(filePath, content);
    }

    this.renderBlocks(content, file);
  }

  /**
   * Render blocks from diary content
   */
  private renderBlocks(content: string, file: TFile | null) {
    if (!this.blocksContainer) return;
    this.blocksContainer.empty();

    const blocks = parseDiaryContent(content);

    if (blocks.length === 0) {
      this.blocksContainer.createEl('p', {
        text: '今天还没有记录，点击"添加记录"开始',
        cls: 'tracemind-empty',
      });
      return;
    }

    for (const block of blocks) {
      const blockEl = this.createBlockElement(block, file, content);
      this.blocksContainer.appendChild(blockEl);
    }
  }

  /**
   * Create a block DOM element
   */
  private createBlockElement(
    block: Block,
    file: TFile | null,
    fullContent: string,
  ): HTMLElement {
    const blockEl = document.createElement('div');
    blockEl.className = 'tracemind-block';

    // Header: timestamp + tags
    const headerEl = blockEl.createEl('div', { cls: 'tracemind-block-header' });
    headerEl.createEl('span', {
      text: block.timestamp,
      cls: 'tracemind-block-time',
    });

    for (const tag of block.tags) {
      headerEl.createEl('span', { text: `#${tag}`, cls: 'tracemind-block-tag' });
    }

    // Content
    if (block.content) {
      blockEl.createEl('p', { text: block.content, cls: 'tracemind-block-content' });
    }

    // Children
    for (const child of block.children) {
      blockEl.createEl('div', { text: `- ${child}`, cls: 'tracemind-block-child' });
    }

    // Analyze button
    const analyzeBtn = blockEl.createEl('button', { cls: 'tracemind-analyze-btn' });
    setIcon(analyzeBtn, 'zap');
    analyzeBtn.addEventListener('click', async () => {
      if (!file) return;
      await this.analyzeBlock(block, file);
    });

    return blockEl;
  }

  /**
   * Add a new block to today's diary
   */
  private async addBlock() {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const fileName = this.formatDateFileName(this.currentDate);
    const filePath = `${DIARY_FOLDER}/${fileName}.md`;

    const existing = this.plugin.app.vault.getFileByPath(filePath);
    if (!existing) {
      new Notice('请先保存当前日记');
      return;
    }

    const content = await this.plugin.app.vault.read(existing);
    const blocks = parseDiaryContent(content);

    // Check if block at this timestamp already exists
    const existingBlock = blocks.find((b: Block) => b.timestamp === timestamp);
    if (existingBlock) {
      new Notice(`${timestamp} 已有记录`);
      return;
    }

    // Open a simple prompt for user to add content
    const userContent = prompt('输入记录内容：');
    if (!userContent) return;

    const newBlock = `### ${timestamp} #日记\n${userContent}\n<!-- TM:${this.generateBlockId()} -->\n`;
    const newContent = content.trim() + '\n\n' + newBlock;

    await this.plugin.app.vault.modify(existing, newContent);
    await this.loadCurrentDay();
    new Notice('已添加记录');
  }

  /**
   * Analyze a single block for entities and create context cards
   */
  private async analyzeBlock(block: Block, file: TFile) {
    // Load existing cards from vault
    const existingCards = await this.loadExistingCards();

    // Run analysis
    const result = AnalysisService.analyzeBlock(block.content, existingCards);

    if (result.entities.length === 0) {
      new Notice('未检测到实体');
      return;
    }

    // Separate entities: L0/L1 need confirmation, L2+ are silent update
    const pendingEntities: PendingEntity[] = [];
    const silentEntities = result.entities.filter(e => {
      const maturity = e.maturity;
      return maturity === 'L2' || maturity === 'L3';
    });

    for (const entity of result.entities) {
      if (entity.maturity === 'L0' || entity.maturity === 'L1' || entity.isNew) {
        pendingEntities.push({
          name: entity.name,
          type: entity.type,
          isNew: entity.isNew,
          maturity: entity.maturity,
          clarificationQuestions: entity.clarificationQuestions,
          priorityScore: entity.priorityScore,
        });
      }
    }

    // Silently update L2+ entities
    for (const entity of silentEntities) {
      await this.updateExistingCard(entity);
    }

    // Create confirmation flow for L0/L1 entities
    if (pendingEntities.length > 0) {
      const flow = ConfirmationFlow.create(pendingEntities);
      new Notice(`识别 ${result.entities.length} 个实体，${pendingEntities.length} 个待处理`);

      // Process each entity in the flow
      await this.processConfirmationFlow(flow, file, block);
    } else {
      new Notice(`检测到 ${result.entities.length} 个实体，${silentEntities.length} 个已更新`);
    }

    // Send results to AI analysis panel
    const summary = AnalysisService.summarizeResult(result);
    this.notifyAIAnalysisPanel(result);
  }

  /**
   * Process a confirmation flow, prompting user for each entity
   */
  private async processConfirmationFlow(
    flow: ConfirmationFlow,
    file: TFile,
    block: Block,
  ): Promise<void> {
    while (flow.hasMore) {
      const entity = flow.currentEntity;
      if (!entity) break;

      // Ask user for confirmation
      const confirmed = confirm(
        `实体: ${entity.name}\n类型: ${entity.type}\n成熟度: ${entity.maturity}\n\n是否确认添加到知识库？\n(点击"取消"跳过)`,
      );

      if (confirmed) {
        // Create card with any available attributes from first question answer
        const card = ContextCard.create({
          name: entity.name,
          cardType: entity.type,
          attributes: entity.type === 'object' && entity.maturity === 'L0'
            ? { subtype: 'other' }
            : {},
        });
        const md = buildCardUpdate(card);
        const cardPath = `${this.getCardFolder(entity.type)}${entity.name}.md`;
        const existing = this.plugin.app.vault.getFileByPath(cardPath);
        if (!existing) {
          await this.plugin.app.vault.create(cardPath, md);
        }
        flow.confirm({ attributes: card.attributes });

        // Inject wikilinks back into the diary block
        await this.injectWikilinks(block, file, [entity.name]);
      } else {
        flow.skip();
      }
    }

    // Show summary
    if (flow.confirmedCount > 0) {
      new Notice(`已确认 ${flow.confirmedCount} 个实体，${flow.confirmedCount - flow.confirmedCount > 0 ? '' : ''}`);
    }
  }

  /**
   * Inject wikilinks into the diary block content
   */
  private async injectWikilinks(block: Block, file: TFile, entityNames: string[]): Promise<void> {
    const content = await this.plugin.app.vault.read(file);
    // Find the block in the content and append wikilinks
    // For now, append wikilinks at the end of the block
    const wikilinkSection = buildWikilinkSection(entityNames);
    if (!wikilinkSection) return;

    const wikilinkComment = `\n<!-- 关联实体: ${wikilinkSection} -->`;
    const blockId = block.blockId;
    if (blockId) {
      const marker = `<!-- TM:${blockId} -->`;
      const updated = content.replace(marker, wikilinkComment + '\n' + marker);
      await this.plugin.app.vault.modify(file, updated);
    }
  }

  /**
   * Update an existing card with new information from this block
   */
  private async updateExistingCard(entity: { name: string; type: CardType; existingCardId?: string }): Promise<void> {
    // For now, just ensure the card exists
    // In future: append evidence entry IDs, update lastUpdated, etc.
    const cardPath = `${this.getCardFolder(entity.type)}${entity.name}.md`;
    const existing = this.plugin.app.vault.getFileByPath(cardPath);
    if (!existing) {
      const card = ContextCard.create({
        name: entity.name,
        cardType: entity.type,
      });
      const md = buildCardUpdate(card);
      await this.plugin.app.vault.create(cardPath, md);
    }
  }

  /**
   * Load existing context cards from vault directories
   */
  private async loadExistingCards(): Promise<Map<string, { name: string; cardType: CardType; maturity: string }>> {
    const cards = new Map<string, { name: string; cardType: CardType; maturity: string }>();
    const types: Array<{ type: CardType; folder: string }> = [
      { type: 'person', folder: 'Person' },
      { type: 'object', folder: 'Object' },
      { type: 'theme', folder: 'Theme' },
    ];

    for (const { type, folder } of types) {
      try {
        const files = await listMarkdownFiles(this.plugin.app, folder);
        for (const file of files) {
          const content = await this.plugin.app.vault.read(file);
          try {
            const card = parseCardMarkdown(content);
            cards.set(card.id, { name: card.name, cardType: card.cardType, maturity: card.maturity });
          } catch {
            // Skip files that fail to parse
          }
        }
      } catch {
        // Folder doesn't exist yet, skip
      }
    }

    return cards;
  }

  /**
   * Notify the AI analysis panel with analysis results
   */
  private notifyAIAnalysisPanel(result: ReturnType<typeof AnalysisService.analyzeBlock>) {
    // Get AI analysis panel view instance
    const leaves = this.plugin.app.workspace.getLeavesOfType('tracemind-ai-analysis');
    for (const leaf of leaves) {
      const view = leaf.view as { updateAnalysis?: (result: ReturnType<typeof AnalysisService.analyzeBlock>) => void };
      if (view.updateAnalysis) {
        view.updateAnalysis(result);
      }
    }
  }

  private getCardFolder(type: string): string {
    return `${type.charAt(0).toUpperCase() + type.slice(1)}/`;
  }

  private generateBlockId(): string {
    return Math.random().toString(16).slice(2, 10).padStart(8, '0');
  }

  private formatDateTitle(date: Date): string {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  private formatDateFileName(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
