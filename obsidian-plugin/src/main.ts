/**
 * TraceMind Obsidian Plugin
 * Entity-centric AI knowledge extraction from daily journals
 */

import { App, Notice, Plugin } from 'obsidian';
import { TraceMindSettingTab } from './settings-tab';
import { TraceMindSettings, DEFAULT_SETTINGS, ProviderConfig } from './settings';
import { TraceMindView, VIEW_TYPE_TRACEMIND } from './views/tracemind-view';
import { AIAnalysisPanelView, VIEW_TYPE_AI_ANALYSIS } from './views/ai-analysis-panel';
import { CalendarView, VIEW_TYPE_CALENDAR } from './views/calendar-view';
import { ensureFolder } from './vault';
import { extractEntities } from './ai/entity-extractor';
import { validateConfig, AiProviderConfig, ChatMessage } from './ai/provider-config';
import { ContextCard, calculateMaturity } from './core/context-card';
import { cardToMarkdown, parseCardMarkdown } from './storage/markdown-card';
import { Block } from './core/diary-parser';

/**
 * Directory structure for TraceMind vault
 */
const TRACEMIND_DIRS = [
  'Daily',
  'Person',
  'Object',
  'Theme',
  'TraceMind/sessions',
  'TraceMind/index',
];

export default class TraceMindPlugin extends Plugin {
  settings!: TraceMindSettings;

  async onload() {
    console.log('TraceMind: loading...');

    try {
      await this.loadSettings();
      await this.ensureVaultStructure();

      // Register views
      this.registerView(VIEW_TYPE_TRACEMIND, (leaf) => new TraceMindView(leaf, this));
      this.registerView(VIEW_TYPE_AI_ANALYSIS, (leaf) => new AIAnalysisPanelView(leaf));
      this.registerView(VIEW_TYPE_CALENDAR, (leaf) => new CalendarView(leaf));

      // Register settings tab
      this.addSettingTab(new TraceMindSettingTab(this.app, this));

      // Ribbon icon
      this.addRibbonIcon('brain', '打开 TraceMind', () => {
        this.openTracemindView();
      });

      this.addRibbonIcon('calendar', '打开日历', () => {
        this.openCalendarView();
      });

      // Commands
      this.addCommand({
        id: 'open-tracemind',
        name: '打开 TraceMind 视图',
        callback: () => this.openTracemindView(),
      });

      this.addCommand({
        id: 'open-calendar',
        name: '打开日历',
        callback: () => this.openCalendarView(),
      });

      this.addCommand({
        id: 'analyze-block',
        name: '分析当前日记块',
        callback: () => this.analyzeCurrentBlock(),
      });

      new Notice('TraceMind 已加载');
      console.log('TraceMind: loaded successfully');
    } catch (e) {
      console.error('TraceMind: Failed to load', e);
      new Notice('TraceMind 加载失败: ' + (e as Error).message);
    }
  }

  onunload() {
    console.log('TraceMind: unloading...');
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...data } as TraceMindSettings;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Create TraceMind directory structure if not exists
   */
  private async ensureVaultStructure(): Promise<void> {
    for (const dir of TRACEMIND_DIRS) {
      await ensureFolder(this.app, dir);
    }
    console.log('TraceMind: vault structure ensured');
  }

  /**
   * Open Calendar View in right sidebar
   */
  async openCalendarView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
    } else {
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({ type: VIEW_TYPE_CALENDAR, active: true });
        workspace.revealLeaf(rightLeaf);
      }
    }
  }

  /**
   * Open TraceMind view in main area
   */
  async openTracemindView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_TRACEMIND);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
    } else {
      const leaf = workspace.getLeftLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_TRACEMIND, active: true });
        workspace.revealLeaf(leaf);
      }
    }

    // Open AI analysis panel in right sidebar
    const existingAI = workspace.getLeavesOfType(VIEW_TYPE_AI_ANALYSIS);
    if (existingAI.length === 0) {
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({ type: VIEW_TYPE_AI_ANALYSIS, active: true });
        workspace.revealLeaf(rightLeaf);
      }
    }
  }

  /**
   * Analyze current block and create/update context cards
   */
  async analyzeCurrentBlock() {
    const provider = this.settings.providers.find((p: ProviderConfig) => p.id === this.settings.defaultProviderId);
    if (!provider) {
      new Notice('请先在设置中配置 AI Provider');
      return;
    }

    const aiConfig: AiProviderConfig = {
      provider: provider.baseUrl?.includes('anthropic.com') ? 'anthropic' : 'openai',
      apiKey: provider.apiKey,
      model: provider.model,
      baseUrl: provider.baseUrl,
    };
    const validation = validateConfig(aiConfig);
    if (!validation.valid) {
      new Notice(`AI 配置无效: ${validation.error}`);
      return;
    }

    // Get current active file content
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('请先打开一个日记文件');
      return;
    }

    const content = await this.app.vault.read(activeFile);
    const entities = extractEntities(content, new Map());

    if (entities.length === 0) {
      new Notice('未检测到实体');
      return;
    }

    // Create context cards for new entities
    new Notice(`检测到 ${entities.length} 个实体，正在创建卡片...`);

    for (const entity of entities) {
      const card = ContextCard.create({
        name: entity.name,
        cardType: entity.type,
        attributes: entity.subtype ? { subtype: entity.subtype } : {},
      });

      const md = cardToMarkdown(card);
      const cardPath = `${this.getCardFolder(entity.type)}${entity.name}.md`;
      const existing = this.app.vault.getFileByPath(cardPath);
      if (!existing) {
        await this.app.vault.create(cardPath, md);
      }
    }

    new Notice(`已创建 ${entities.length} 个 Context Card`);
  }

  private getCardFolder(type: string): string {
    const folders: Record<string, string> = {
      person: 'Person/',
      object: 'Object/',
      theme: 'Theme/',
    };
    return folders[type] || '';
  }
}
