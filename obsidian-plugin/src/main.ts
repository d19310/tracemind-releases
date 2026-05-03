/**
 * TraceMind Obsidian Plugin
 * Entity-centric AI knowledge extraction from daily journals with Context Cards
 * Uses LifeWiki 2.0 UI (BlockEditor, AI Analysis Panel, Calendar) with TraceMind AI layer
 */

import { App, Notice, Plugin } from 'obsidian';
import { TraceMindSettingTab } from './settings';
import { TraceMindSettings, DEFAULT_SETTINGS, ProviderConfig } from './settings';
import { BlockEditorView, VIEW_TYPE_BLOCK_EDITOR } from './views/block-editor';
import { AIAnalysisPanelView, VIEW_TYPE_AI_ANALYSIS } from './views/ai-analysis-panel';
import { CalendarView, VIEW_TYPE_CALENDAR } from './views/calendar-view';
import { ensureFolder } from './vault/vault';
import { UserProfile, DEFAULT_PROFILE } from './core/user-profile';
import { loadProfile } from './core/profile-loader';
import { ContextCard, calculateMaturity, CardType } from './core/context-card';
import { cardToMarkdown, parseCardMarkdown } from './storage/markdown-card';
import { AnalysisService } from './ai/analysis-service';
import type { AnalyzedEntity } from './ai/analysis-service';
import { buildIndexFromFiles, cardToIndexEntry } from './storage/entity-index-io';
import { EntityIndex, searchByName, searchByType, upsertEntry, IndexEntry } from './storage/entity-index';
import { sessionFilePath, formatSessionJson, parseSessionJson } from './storage/session-store-io';
import { saveSession, loadSession, ChatMessage } from './storage/session-store';
import type { BlockSession, ChatSession } from './entities/types';
import { AnalysisPhase } from './entities/types';
import { isFirstStart, showFirstStartWizard } from './core/first-start';

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

export class TraceMindPlugin extends Plugin {
  settings!: TraceMindSettings;
  userProfile: UserProfile = { ...DEFAULT_PROFILE };

  // TraceMind services
  analysisService: typeof AnalysisService = AnalysisService;

  // Entity index (loaded from vault on startup)
  entityIndex: EntityIndex = { entries: [], lastRebuild: '' };

  // Adapters (instance-level, not module singletons)
  private entityManager!: EntityManagerAdapter;
  private sessionManager!: SessionManagerAdapter;
  private aiProvider!: AIProviderAdapter;

  // View references (set by view registration)
  aiAnalysisView: AIAnalysisPanelView | undefined;
  blockEditorView: BlockEditorView | undefined;
  calendarView: CalendarView | undefined;

  async onload() {
    console.log('TraceMind: loading...');

    try {
      await this.loadSettings();
      await this.ensureVaultStructure();
      await this.rebuildEntityIndex();
      this.userProfile = await loadProfile(this.app);

      // Initialize adapters with real I/O
      this.entityManager = new EntityManagerAdapter(this.app, this);
      this.sessionManager = new SessionManagerAdapter(this.app);
      this.aiProvider = new AIProviderAdapter(this);
      await this.sessionManager.initialize();

      // Register views
      this.registerView(VIEW_TYPE_BLOCK_EDITOR, (leaf) => {
        this.blockEditorView = new BlockEditorView(leaf, this);
        return this.blockEditorView;
      });
      this.registerView(VIEW_TYPE_AI_ANALYSIS, (leaf) => {
        this.aiAnalysisView = new AIAnalysisPanelView(leaf, this);
        return this.aiAnalysisView;
      });
      this.registerView(VIEW_TYPE_CALENDAR, (leaf) => {
        this.calendarView = new CalendarView(leaf, this);
        this.calendarView.setOnDateClick((date: Date) => this.navigateToDate(date));
        return this.calendarView;
      });

      // Register settings tab
      this.addSettingTab(new TraceMindSettingTab(this.app, this));

      // Ribbon icons
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

      this.addCommand({
        id: 'rebuild-index',
        name: '重建实体索引',
        callback: () => this.rebuildEntityIndexCommand(),
      });

      // Register vault file modification handler for auto-analysis
      this.registerEvent(
        this.app.workspace.on('editor-change', () => {
          this.onEditorChange();
        }),
      );

      new Notice('TraceMind 已加载');
      console.log('TraceMind: loaded successfully');

      // Check if this is first start and show wizard
      if (await isFirstStart(this.app.vault.adapter)) {
        showFirstStartWizard(this.app, async () => {
          await this.ensureVaultStructure();
        });
      } else {
        await this.ensureVaultStructure();
      }
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

  private async ensureVaultStructure(): Promise<void> {
    for (const dir of TRACEMIND_DIRS) {
      await ensureFolder(this.app, dir);
    }
    console.log('TraceMind: vault structure ensured');
  }

  /**
   * Called when the editor content changes.
   * Debounced auto-analysis: checks if text meets minimum length threshold.
   */
  private autoAnalysisTimer: ReturnType<typeof setTimeout> | null = null;

  onEditorChange() {
    // Clear previous timer
    if (this.autoAnalysisTimer) {
      clearTimeout(this.autoAnalysisTimer);
    }

    // Debounce: wait 2 seconds after last edit before analyzing
    this.autoAnalysisTimer = setTimeout(() => {
      this.autoAnalysisTimer = null;
      // Auto-analysis is disabled by default in v1; users trigger manually
      // via the "分析当前日记块" command or the AI analysis panel.
      // Future: enable auto-analysis based on settings preference.
    }, 2000);
  }

  /**
   * Rebuild entity index command (user-triggered).
   */
  async rebuildEntityIndexCommand() {
    await this.rebuildEntityIndex();
    new Notice(`实体索引已重建: ${this.entityIndex.entries.length} 个实体`);
  }

  /**
   * Rebuild entity index from all Context Card markdown files in vault.
   * Called on startup and after entity creation/updates.
   */
  private async rebuildEntityIndex(): Promise<void> {
    const cardDirs = ['Person', 'Object', 'Theme'];
    const files: { path: string; content: string }[] = [];

    for (const dir of cardDirs) {
      try {
        const dirFiles = await this.app.vault.adapter.list(dir + '/');
        for (const filePath of dirFiles.files) {
          if (filePath.endsWith('.md')) {
            const content = await this.app.vault.adapter.read(filePath);
            files.push({ path: filePath, content });
          }
        }
      } catch {
        // Directory may not exist yet or is empty
      }
    }

    this.entityIndex = buildIndexFromFiles(files);
    console.log(`TraceMind: entity index rebuilt with ${this.entityIndex.entries.length} entries`);
  }

  /**
   * Navigate to a specific date's diary entry
   */
  async navigateToDate(date: Date) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOCK_EDITOR);
    if (leaves.length === 0) {
      await this.openTracemindView();
    }
    const blockLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOCK_EDITOR);
    for (const leaf of blockLeaves) {
      const view = leaf.view as { currentDate?: Date; loadCurrentDay?: () => Promise<void> };
      if (view.currentDate !== undefined && typeof view.loadCurrentDay === 'function') {
        view.currentDate = date;
        await view.loadCurrentDay();
      }
    }
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
    const existing = workspace.getLeavesOfType(VIEW_TYPE_BLOCK_EDITOR);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
    } else {
      const leaf = workspace.getLeftLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_BLOCK_EDITOR, active: true });
        workspace.revealLeaf(leaf);
      }
    }

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
   * Open BlockEditor view (alias used by views)
   */
  async openBlockEditor() {
    return this.openTracemindView();
  }

  /**
   * Analyze current block and create/update context cards
   */
  async analyzeCurrentBlock() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('请先打开一个日记文件');
      return;
    }

    const content = await this.app.vault.read(activeFile);
    const blockId = activeFile.basename;

    try {
      const existingCards = new Map<string, { name: string; cardType: CardType; maturity: string }>();
      const tmResult = AnalysisService.analyzeBlock(content, existingCards);
      new Notice(`分析完成: 检测到 ${tmResult.entities.length} 个实体`);

      const lifeWikiResult = this.buildAnalysisResult(tmResult.entities, blockId, content);
      this.updateAIAnalysis(lifeWikiResult);
    } catch (e) {
      new Notice('分析失败: ' + (e as Error).message);
      console.error('TraceMind: analysis error', e);
    }
  }

  // ===== Plugin interface methods expected by LifeWiki views =====

  getAIAnalysisView(): AIAnalysisPanelView | undefined {
    return this.aiAnalysisView;
  }

  getBlockEditorView(): BlockEditorView | undefined {
    return this.blockEditorView;
  }

  getCalendarView(): CalendarView | undefined {
    return this.calendarView;
  }

  getEntityManager(): EntityManagerAdapter {
    return this.entityManager;
  }

  getSessionManager(): SessionManagerAdapter {
    return this.sessionManager;
  }

  getAIProvider(): AIProviderAdapter {
    return this.aiProvider;
  }

  /**
   * Build AnalysisResult from analyzed entities for the AI panel.
   */
  private buildAnalysisResult(entities: AnalyzedEntity[], blockId: string, content: string): any {
    const people: any[] = [];
    const objects: any[] = [];
    const dimensions: any[] = [];

    const groups: Record<string, any[]> = { people, objects, dimensions };
    const typeMap: Record<string, 'people' | 'objects' | 'dimensions'> = {
      person: 'people',
      object: 'objects',
      theme: 'dimensions',
    };

    const needsConfirmation: string[] = [];

    for (const entity of entities) {
      const group = typeMap[entity.type];
      const idx = content.indexOf(entity.name);
      let context = entity.name;
      if (idx >= 0) {
        const start = Math.max(0, idx - 20);
        const end = Math.min(content.length, idx + entity.name.length + 30);
        let snippet = content.slice(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet += '...';
        context = snippet;
      }

      groups[group].push({
        type: entity.type,
        name: entity.name,
        confidence: entity.confidence ?? 0.5,
        context,
        isArchived: !!entity.existingCardId,
        newEntity: entity.isNew,
        maturity: entity.maturity as any,
        priorityScore: entity.priorityScore,
        clarificationQuestions: entity.clarificationQuestions,
      });

      if (entity.isNew) {
        needsConfirmation.push(entity.name);
      }
    }

    return {
      blockId,
      timestamp: new Date().toISOString(),
      category: needsConfirmation.length > 0 ? '待确认' : '工作',
      areas: [],
      entities: { people, objects, dimensions },
      needsConfirmation,
      aiResponse: this.buildAiResponse(entities),
    };
  }

  private buildAiResponse(entities: AnalyzedEntity[]): string {
    const questions: string[] = [];
    for (const entity of entities) {
      if (entity.clarificationQuestions.length > 0) {
        questions.push(`关于 ${entity.name}：${entity.clarificationQuestions[0]}`);
      }
    }
    if (questions.length === 0) {
      const names = entities.map(e => e.name).join('、');
      return `检测到以下实体：${names}。`;
    }
    return questions.join('\n');
  }

  updateAIAnalysis(result: any) {
    if (this.aiAnalysisView) {
      this.aiAnalysisView.updateAnalysis(result);
    }
  }
}

// ===== Adapters for LifeWiki view compatibility =====

/**
 * EntityManager adapter backed by TraceMind EntityIndex + vault Context Cards.
 * Maps LifeWiki entity operations to TraceMind Context Card I/O.
 */
class EntityManagerAdapter {
  constructor(
    private app: App,
    private plugin: TraceMindPlugin,
  ) {}

  /**
   * Search entity index by name. Returns IndexEntry if found, null otherwise.
   * Used by views to check if an entity already exists ("archived" status).
   */
  findEntity(name: string): IndexEntry | null {
    const matches = searchByName(this.plugin.entityIndex, name);
    // Return the best match (exact name match first, then first partial match)
    const exact = matches.find(m => m.name.toLowerCase() === name.toLowerCase());
    return exact || matches[0] || null;
  }

  /**
   * Get entity by ID from the index.
   */
  getEntity(entityId: string): IndexEntry | null {
    return this.plugin.entityIndex.entries.find(e => e.id === entityId) || null;
  }

  /**
   * Create a Context Card from a LifeWiki entity and write to vault.
   * Also updates the in-memory index.
   */
  async createEntity(entity: any): Promise<any> {
    const cardType = mapEntityType(entity.type);
    const aliases = entity.aliases || [];
    const card = ContextCard.create({
      name: entity.title,
      cardType,
      attributes: entity.metadata || {},
      aliases,
    });
    const md = cardToMarkdown(card);
    const folder = getCardFolder(cardType);
    const path = `${folder}${entity.title}.md`;

    const existing = this.app.vault.getFileByPath(path);
    if (!existing) {
      await this.app.vault.create(path, md);
    }

    // Update in-memory index
    const entry = cardToIndexEntry(md, path);
    this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, entry);

    // Add interaction count to attributes if provided
    if (entity.interactions) {
      card.attributes.interactionCount = (entity.interactions as any[]).length;
    }

    return { ...entity, id: entry.id };
  }

  /**
   * Update an entity in the vault and index.
   */
  async updateEntity(entityId: string, data: any): Promise<void> {
    const entry = this.getEntity(entityId);
    if (!entry) return;

    // Read the card, update attributes, write back
    const file = this.app.vault.getFileByPath(entry.filePath);
    if (!file) return;

    const content = await this.app.vault.read(file);
    const card = parseCardMarkdown(content);
    // Apply updates to card attributes
    for (const [key, value] of Object.entries(data)) {
      if (key === 'lastUpdated') {
        card.lastUpdated = value as string;
      } else if (key === 'interactions') {
        card.attributes.interactions = value;
      } else {
        card.attributes[key] = value;
      }
    }
    card.lastUpdated = data.lastUpdated || new Date().toISOString();

    const md = cardToMarkdown(card);
    await this.app.vault.modify(file, md);

    // Update index
    const updatedEntry = cardToIndexEntry(md, entry.filePath);
    this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, updatedEntry);
  }

  /**
   * Record an interaction with an entity (e.g., diary mention).
   * Stored in the card's attributes.interactions array.
   */
  async addInteraction(entityId: string, interaction: { timestamp: string; type: string; content: string; sourceBlockId?: string }): Promise<void> {
    const entry = this.getEntity(entityId);
    if (!entry) return;

    const file = this.app.vault.getFileByPath(entry.filePath);
    if (!file) return;

    const content = await this.app.vault.read(file);
    const card = parseCardMarkdown(content);
    const interactions = (card.attributes.interactions as any[]) || [];
    interactions.push(interaction);
    card.attributes.interactions = interactions;
    card.lastUpdated = new Date().toISOString();

    const md = cardToMarkdown(card);
    await this.app.vault.modify(file, md);

    // Update index
    const updatedEntry = cardToIndexEntry(md, entry.filePath);
    this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, updatedEntry);
  }

  async enrichEntity(id: string, updates: any): Promise<any> {
    return updates;
  }

  buildEntityIndex(): Map<string, Set<string>> {
    const result = new Map<string, Set<string>>();
    for (const entry of this.plugin.entityIndex.entries) {
      result.set(entry.id, new Set([entry.name, ...entry.aliases]));
    }
    return result;
  }
}

/**
 * SessionManager adapter backed by TraceMind SessionStore vault I/O.
 * Maps LifeWiki session operations to TraceMind BlockSession I/O.
 */
class SessionManagerAdapter {
  constructor(private app: App) {}

  // In-memory session cache (lazy-loaded from vault)
  private cache = new Map<string, BlockSession>();
  private chatSession: ChatSession = {
    blockId: 'chat:global',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  async initialize(): Promise<void> {
    // Preload all sessions from vault
    try {
      const dirFiles = await this.app.vault.adapter.list('TraceMind/sessions/');
      for (const filePath of dirFiles.files) {
        if (filePath.endsWith('.json')) {
          const content = await this.app.vault.adapter.read(filePath);
          const parsed = parseSessionJson(content);
          this.cache.set(parsed.blockId, this.toViewSession(parsed));
        }
      }
    } catch {
      // Directory may not exist yet
    }
  }

  /**
   * Get an existing session (from cache).
   * Sync because views call this frequently; data is preloaded.
   */
  getSession(blockId: string, _parentId: string | null): BlockSession | null {
    return this.cache.get(blockId) || null;
  }

  /**
   * Get existing session or create a new one.
   */
  getOrCreateSession(blockId: string, _parentId: string | null): BlockSession {
    const existing = this.cache.get(blockId);
    if (existing) return existing;

    const fresh: BlockSession = {
      blockId,
      content: '',
      messages: [],
      analysisResult: null,
      reviewCards: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPhase: 'detection' as AnalysisPhase,
    };
    this.cache.set(blockId, fresh);
    return fresh;
  }

  /**
   * Set session content (used when block content changes).
   */
  setContent(blockId: string, content: string, _parentId: string | null): void {
    const session = this.getOrCreateSession(blockId, _parentId);
    session.content = content;
    session.updatedAt = new Date().toISOString();
    this.writeSession(blockId, session);
  }

  /**
   * Persist session to vault.
   */
  setSession(blockId: string, session: Partial<BlockSession>, _parentId: string | null): BlockSession {
    const existing = this.getOrCreateSession(blockId, _parentId);
    const merged: BlockSession = {
      ...existing,
      ...session,
      blockId,
      updatedAt: new Date().toISOString(),
      analysisResult: session.analysisResult ?? existing.analysisResult,
    };
    this.cache.set(blockId, merged);
    this.writeSession(blockId, merged);
    return merged;
  }

  /**
   * Set the analysis result on the current session.
   */
  setAnalysisResult(blockId: string, result: any, _parentId: string | null): void {
    const session = this.getOrCreateSession(blockId, _parentId);
    session.analysisResult = result;
    session.updatedAt = new Date().toISOString();
    session.currentPhase = AnalysisPhase.Complete;
    this.cache.set(blockId, session);
    this.writeSession(blockId, session);
  }

  /**
   * Add a message to the block session.
   */
  addMessage(blockId: string, message: ChatMessage, _parentId: string | null): void {
    const session = this.getOrCreateSession(blockId, _parentId);
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    this.cache.set(blockId, session);
    this.writeSession(blockId, session);
  }

  /**
   * Add a message to the in-memory chat session.
   */
  addChatMessage(message: ChatMessage): void {
    this.chatSession.messages.push(message);
    this.chatSession.updatedAt = new Date().toISOString();
  }

  /**
   * Get the in-memory chat session.
   */
  getChatSession(): ChatSession {
    return this.chatSession;
  }

  /**
   * Clear the in-memory chat session.
   */
  clearChatSession(): void {
    this.chatSession = {
      blockId: 'chat:global',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete the session file from vault.
   */
  async clearSession(blockId: string): Promise<void> {
    this.cache.delete(blockId);
    try {
      const file = this.app.vault.getFileByPath(sessionFilePath(blockId));
      if (file) {
        await this.app.vault.delete(file);
      }
    } catch {
      // File may already be deleted
    }
  }

  /**
   * Update a review card in the session.
   */
  updateReviewCard(blockId: string, cardId: string, data: any, _parentId: string | null): void {
    const session = this.getOrCreateSession(blockId, _parentId);
    if (!session.reviewCards) session.reviewCards = {};
    session.reviewCards[cardId] = {
      status: data.status || 'pending',
      supplement: data.supplement,
      updatedAt: new Date().toISOString(),
    };
    session.updatedAt = new Date().toISOString();
    this.cache.set(blockId, session);
    this.writeSession(blockId, session);
  }

  /**
   * Write session to vault JSON file.
   */
  private writeSession(blockId: string, session: BlockSession): void {
    try {
      const path = sessionFilePath(blockId);
      // Convert view-facing BlockSession to storage format
      const storage: Record<string, unknown> = {
        blockId: session.blockId,
        content: session.content,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        currentPhase: session.currentPhase,
      };
      if (session.analysisResult) {
        storage.analysisResult = session.analysisResult;
      }
      const json = JSON.stringify(storage, null, 2);
      const file = this.app.vault.getFileByPath(path);
      if (file) {
        this.app.vault.modify(file, json);
      } else {
        this.app.vault.create(path, json);
      }
    } catch (e) {
      console.error('TraceMind: failed to write session', e);
    }
  }

  /**
   * Convert storage BlockSession to view-facing BlockSession.
   */
  private toViewSession(parsed: ReturnType<typeof parseSessionJson>): BlockSession {
    return {
      blockId: parsed.blockId,
      content: parsed.content,
      messages: parsed.messages,
      analysisResult: (parsed as any).analysisResult ?? null,
      reviewCards: (parsed as any).reviewCards ?? {},
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      currentPhase: (parsed as any).currentPhase || ('detection' as AnalysisPhase),
    };
  }
}

/**
 * AIProvider adapter backed by TraceMind provider config from settings.
 */
class AIProviderAdapter {
  constructor(private plugin: TraceMindPlugin) {}

  /**
   * Check if a default provider is configured with API key.
   */
  isReady(): boolean {
    const { settings } = this.plugin;
    if (!settings.defaultProviderId) return false;
    const provider = settings.providers.find(p => p.id === settings.defaultProviderId);
    return !!provider && !!provider.apiKey && !!provider.baseUrl;
  }

  /**
   * Send chat messages to the default provider.
   */
  async chat(messages: ChatMessage[]): Promise<{ content: string; usage: any }> {
    const provider = this.getDefaultProvider();
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    const { chat: sendChat } = await import('./ai/provider-config');
    const result = await sendChat(
      messages.map(m => ({ role: m.role, content: m.content })),
      {
        provider: 'openai', // default to OpenAI-compatible format
        apiKey: provider.apiKey,
        model: provider.model,
        baseUrl: provider.baseUrl,
      }
    );
    return { content: result.content, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }

  /**
   * Analyze a diary block using the rules-based AnalysisService.
   * Falls back to the local extractor (no LLM call needed for v1).
   */
  async analyzeBlock(content: string): Promise<any> {
    // Use the rules-based analyzer (no LLM needed for v1 MVP)
    const existingCards = new Map<string, { name: string; cardType: CardType; maturity: string }>();
    return AnalysisService.analyzeBlock(content, existingCards);
  }

  private getDefaultProvider(): ProviderConfig | null {
    const { settings } = this.plugin;
    if (!settings.defaultProviderId) return null;
    return settings.providers.find(p => p.id === settings.defaultProviderId) || null;
  }
}

/**
 * Map LifeWiki entity types to TraceMind card types
 */
function mapEntityType(type: string): CardType {
  if (type === 'person') return 'person';
  if (type === 'object') return 'object';
  if (type === 'theme') return 'theme';
  // Legacy fallback
  if (type === 'project' || type === 'thing') return 'object';
  if (type === 'idea' || type === 'knowledge') return 'theme';
  return 'object';
}

/**
 * Get the vault folder for a card type
 */
function getCardFolder(cardType: CardType): string {
  const folders: Record<string, string> = {
    person: 'Person/',
    object: 'Object/',
    theme: 'Theme/',
  };
  return folders[cardType] || '';
}

export default TraceMindPlugin;
