/**
 * TraceMind View - Main diary editor view
 */

import { ItemView, WorkspaceLeaf, setIcon, Notice, TFile } from 'obsidian';
import type TraceMindPlugin from '../main';
import { parseDiaryContent, formatDiaryContent, Block } from '../core/diary-parser';
import { extractEntities } from '../ai/entity-extractor';
import { ensureFolder, writeFile } from '../vault';
import { ContextCard } from '../core/context-card';
import { cardToMarkdown } from '../storage/markdown-card';

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
    await ensureFolder(this.plugin.app, DIARY_FOLDER);

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
   * Analyze a single block for entities
   */
  private async analyzeBlock(block: Block, file: TFile) {
    const provider = this.plugin.settings.providers.find((p: { id: string }) => p.id === this.plugin.settings.defaultProviderId);
    if (!provider) {
      new Notice('请先配置 AI Provider');
      return;
    }

    const entities = extractEntities(block.content, new Map());
    if (entities.length === 0) {
      new Notice('未检测到实体');
      return;
    }

    // Create context cards
    for (const entity of entities) {
      const card = ContextCard.create({
        name: entity.name,
        cardType: entity.type,
        attributes: entity.subtype ? { subtype: entity.subtype } : {},
      });
      const md = cardToMarkdown(card);
      const cardPath = `${this.getCardFolder(entity.type)}${entity.name}.md`;
      const existing = this.plugin.app.vault.getFileByPath(cardPath);
      if (!existing) {
        await this.plugin.app.vault.create(cardPath, md);
      }
    }

    new Notice(`检测到 ${entities.length} 个实体并创建卡片`);
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
