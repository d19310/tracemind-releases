/**
 * TraceMind Obsidian Plugin
 * Entity-centric AI knowledge extraction from daily journals with Context Cards
 * Uses LifeWiki 2.0 UI (BlockEditor, AI Analysis Panel, Calendar) with TraceMind AI layer
 */

import { App, Notice, Plugin } from 'obsidian';
import { TraceMindSettingTab } from './settings';
import { TraceMindSettings, DEFAULT_SETTINGS, ProviderConfig } from './settings-types';
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
import { loadEntityTypeConfig } from './ai/entity-type-config';
import { insightFilePath, parseInsightMarkdown, formatInsightMarkdown } from './storage/insight-store';
import type { InsightReport } from './storage/insight-store';
import { buildDailyInsightPrompt, computeContentHash, buildEntityIndexSummary } from './ai/daily-insight';
import type { InsightStreamCallbacks } from './ai/daily-insight';
import { streamChat } from './ai/provider-config';
import { parseDiaryContent } from './core/diary-parser';

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
  'TraceMind/insights',
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
      await this.rebuildEntityIndex();
      this.userProfile = await loadProfile(this.app);

      // Load entity type config
      loadEntityTypeConfig();

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

      // First start: show wizard (which creates and validates dirs on completion)
      if (await isFirstStart(this.app.vault.adapter)) {
        showFirstStartWizard(this.app, async () => {
          await this.ensureVaultStructure();
        });
      } else {
        // Non-first-start: ensure structure silently (repair missing dirs)
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
      const view = leaf.view as BlockEditorView;
      if (typeof view.setCurrentDate === 'function') {
        await view.setCurrentDate(date);
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
      const leaf = workspace.getLeaf(false);
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
    console.log('[TraceMind] analyzeCurrentBlock file:', activeFile.path, 'content length:', content.length);
    console.log('[TraceMind] analyzeCurrentBlock content preview:', content.substring(0, 300));

    try {
      const tmResult = await this.aiProvider.analyzeBlock(content, blockId);
      new Notice(`分析完成: 检测到 ${tmResult.entities.length} 个实体`);
      console.log('[TraceMind] analyzeCurrentBlock: tmResult:', tmResult);
      this.updateAIAnalysis(tmResult);
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

  getUserProfile(): UserProfile {
    return this.userProfile;
  }

  /**
   * Format user profile as a text string for injection into AI prompts.
   */
  getUserProfileContext(): string {
    const p = this.userProfile;
    const parts: string[] = [];
    if (p.name) parts.push('姓名：' + p.name);
    if (p.occupation) parts.push('职业：' + p.occupation);
    if (p.company) parts.push('公司/组织：' + p.company);
    if (p.city) parts.push('城市：' + p.city);
    if (p.skills.length > 0) parts.push('技能：' + p.skills.join('、'));
    if (p.relationships.length > 0) parts.push('关系：' + p.relationships.join('、'));
    if (p.goals.length > 0) parts.push('目标：' + p.goals.join('、'));
    if (p.focusAreas.length > 0) parts.push('关注领域：' + p.focusAreas.join('、'));
    if (parts.length === 0) return '';
    return '\u7528\u6237\u6863\u6848\uFF1A\n' + parts.map(function(x) { return '- ' + x; }).join('\n');
  }

  private buildAnalysisResult(entities: AnalyzedEntity[], blockId: string, content: string): any {
    return buildAnalysisResultImpl(entities, blockId, content);
  }

  updateAIAnalysis(result: any) {
    if (this.aiAnalysisView) {
      this.aiAnalysisView.updateAnalysis(result);
    }
  }

  // ===== Daily Insight methods =====

  /**
   * Get the block editor's current date as YYYY-MM-DD string.
   * Used by AI panel to sync the insight date with the diary view.
   */
  getBlockEditorDate(): string | null {
    if (this.blockEditorView && (this.blockEditorView as any).currentDate) {
      const raw = (this.blockEditorView as any).currentDate;
      // currentDate can be a Date (from navigateToDate) or a string "YYYY-MM-DD" (from constructor)
      if (raw instanceof Date && !isNaN(raw.getTime())) {
        const y = raw.getFullYear();
        const m = String(raw.getMonth() + 1).padStart(2, '0');
        const d = String(raw.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      if (typeof raw === 'string' && raw.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return raw;
      }
    }
    return null;
  }

  /**
   * Get cached insight report for a date, or null if not found.
   */
  async getCachedInsight(dateStr: string): Promise<InsightReport | null> {
    try {
      const path = insightFilePath(dateStr);
      const file = this.app.vault.getFileByPath(path);
      if (!file) return null;
      const content = await this.app.vault.read(file);
      return parseInsightMarkdown(content);
    } catch {
      return null;
    }
  }

  /**
   * Read a daily diary file as raw markdown string.
   * Returns null if the file doesn't exist.
   */
  async readDailyDiary(dateStr: string): Promise<string | null> {
    try {
      const dailyPath = `Daily/${dateStr}.md`;
      const file = this.app.vault.getFileByPath(dailyPath);
      if (!file) {
        // Fallback: check root level
        const rootFile = this.app.vault.getFileByPath(`${dateStr}.md`);
        if (rootFile) return await this.app.vault.read(rootFile);
        return null;
      }
      return await this.app.vault.read(file);
    } catch {
      return null;
    }
  }

  /**
   * Read yesterday's diary (or the nearest previous day with a diary file).
   * Searches back up to 7 days. Returns empty string if none found.
   */
  async readYesterdayDiary(todayStr: string): Promise<string> {
    const today = new Date(todayStr);
    for (let i = 1; i <= 7; i++) {
      const prev = new Date(today);
      prev.setDate(prev.getDate() - i);
      const y = prev.getFullYear();
      const m = String(prev.getMonth() + 1).padStart(2, '0');
      const d = String(prev.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const content = await this.readDailyDiary(dateStr);
      if (content) return content;
    }
    return '';
  }

  /**
   * Check if a date's diary has at least 5 blocks.
   */
  async hasMinimumBlocks(dateStr: string): Promise<boolean> {
    const content = await this.readDailyDiary(dateStr);
    if (!content) return false;
    const blocks = parseDiaryContent(content);
    return blocks.length >= 5;
  }

  /**
   * Generate today's insight report with real SSE streaming.
   * Collects data, calls LLM via streamChat, saves to TraceMind/insights/YYYY-MM-DD.md.
   */
  async generateDailyInsight(
    dateStr: string,
    callbacks: InsightStreamCallbacks,
  ): Promise<InsightReport> {
    // Collect data
    const todayContent = await this.readDailyDiary(dateStr);
    if (!todayContent) throw new Error('找不到今天的日记文件');

    const yesterdayContent = await this.readYesterdayDiary(dateStr);
    const profileContext = this.getUserProfileContext();
    const entitySummary = buildEntityIndexSummary(this.entityIndex.entries);

    // Build prompt
    const messages = buildDailyInsightPrompt({
      todayBlocks: todayContent,
      yesterdayBlocks: yesterdayContent,
      profileContext,
      entityIndexSummary: entitySummary,
    });

    // Get analysis provider
    const provider = this.getAIProvider().getProviderForContext('analysis') as ProviderConfig;
    if (!provider || !provider.apiKey) {
      throw new Error('请先在设置中配置 AI Provider');
    }

    // Build provider config for streamChat
    const aiConfig = {
      provider: 'openai' as const,
      apiKey: provider.apiKey,
      model: provider.model,
      baseUrl: provider.baseUrl,
    };

    // Accumulate full text from deltas
    let fullText = '';
    let streamError: Error | null = null;

    await streamChat(messages, aiConfig, {
      onDelta: (text: string) => {
        fullText += text;
        callbacks.onDelta(text);
      },
      onDone: (_text: string) => {
        // fullText already accumulated from onDelta
      },
      onError: (error: Error) => {
        streamError = error;
        callbacks.onError(error);
      },
    });

    if (streamError) throw streamError;
    if (!fullText) throw new Error('LLM 返回了空内容');

    // Compute hash and build report
    const contentHash = await computeContentHash(todayContent, yesterdayContent);
    const blocks = parseDiaryContent(todayContent);
    const report: InsightReport = {
      date: dateStr,
      content: fullText,
      contentHash,
      generatedAt: new Date().toISOString(),
      blockCount: blocks.length,
    };

    // Save to vault
    const path = insightFilePath(dateStr);
    const markdown = formatInsightMarkdown(report);
    const existingFile = this.app.vault.getFileByPath(path);
    if (existingFile) {
      await this.app.vault.modify(existingFile, markdown);
    } else {
      await this.app.vault.create(path, markdown);
    }

    callbacks.onDone(fullText);
    return report;
  }
}

// ===== Adapters for LifeWiki view compatibility =====

/**
 * Build AnalysisResult from analyzed entities for the AI panel.
 * Standalone function so both TraceMindPlugin and AIProviderAdapter can use it.
 */
function buildAnalysisResultImpl(entities: AnalyzedEntity[], blockId: string, content: string, domainCategory?: string): any {
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
    category: needsConfirmation.length > 0 ? '待确认' : (domainCategory || '工作'),
    areas: domainCategory ? [domainCategory] : [],
    entities: { people, objects, dimensions },
    needsConfirmation,
    aiResponse: buildAiResponseImpl(entities),
  };
}

function buildAiResponseImpl(entities: AnalyzedEntity[]): string {
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

    // Store interactions in card attributes (so they appear in markdown)
    if (entity.interactions && Array.isArray(entity.interactions)) {
      card.attributes.interactions = entity.interactions;
    }

    const md = cardToMarkdown(card);
    const folder = getCardFolder(cardType);
    const path = `${folder}${entity.title}.md`;

    const existing = this.app.vault.getFileByPath(path);
    if (!existing) {
      await this.app.vault.create(path, md);
    }
    // If already exists, skip silently — caller should use update_entity

    // Update in-memory index
    const entry = cardToIndexEntry(md, path);
    this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, entry);

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
      } else if (key === 'aliases' && Array.isArray(value)) {
        card.aliases = value as string[];
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
   * Wrap known entity names in text with Obsidian [[wikilinks]].
   * Scans the entity index for names that appear in the text.
   */
  private wikifyContent(text: string): string {
    let result = text;

    // First pass: fix already-broken nested wikilinks
    result = result.replace(/\[\[(Person|Object|Theme)\/(?:\[\[(?:Person|Object|Theme)\/[^\]]+\]\])\|([^\]]+)\]\]/g, '[[$1/$2|$2]]');

    const entries = this.plugin.entityIndex.entries;
    const sorted = [...entries].sort((a, b) => b.name.length - a.name.length);

    // Build a list of all search terms: names + aliases
    const searchTerms: Array<{ term: string; name: string; folder: string }> = [];
    for (const entry of sorted) {
      const folder = entry.cardType === 'person' ? 'Person' : entry.cardType === 'object' ? 'Object' : 'Theme';
      // Add primary name
      if (entry.name.length >= 2) {
        searchTerms.push({ term: entry.name, name: entry.name, folder });
      }
      // Add aliases
      for (const alias of entry.aliases || []) {
        if (alias.length >= 2) {
          searchTerms.push({ term: alias, name: entry.name, folder });
        }
      }
    }
    // Sort by term length descending for longest match first
    searchTerms.sort((a, b) => b.term.length - a.term.length);

    for (const st of searchTerms) {
      // Skip if already inside wikilink
      const escapedTerm = st.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp('(?<!\\[\\[)' + escapedTerm + '(?!\\]\\|)').test(result)) continue;

      const link = '[[' + st.folder + '/' + st.name + '|' + st.term + ']]';
      const regex = new RegExp('(?<!\\[\\[)' + escapedTerm + '(?!\\]\\|)', 'g');
      result = result.replace(regex, link);
    }
    return result;
  }

  /**
   * Re-wikify all interaction records for an entity.
   * Called after all session entities are in the index so bidirectional links work.
   */
  async refreshWikilinks(entityId: string): Promise<void> {
    const entry = this.getEntity(entityId);
    if (!entry) return;

    const file = this.app.vault.getFileByPath(entry.filePath);
    if (!file) return;

    const content = await this.app.vault.read(file);
    const card = parseCardMarkdown(content);
    const interactions = (card.attributes.interactions as any[]) || [];

    let changed = false;
    for (const ix of interactions) {
      if (ix.content && typeof ix.content === 'string') {
        const wikified = this.wikifyContent(ix.content);
        if (wikified !== ix.content) {
          ix.content = wikified;
          changed = true;
        }
      }
    }

    if (changed) {
      card.attributes.interactions = interactions;
      const md = cardToMarkdown(card);
      await this.app.vault.modify(file, md);
      const updatedEntry = cardToIndexEntry(md, entry.filePath);
      this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, updatedEntry);
    }
  }

  /**
   * Record an interaction with an entity (e.g., diary mention).
   * Stored in the card's attributes.interactions array.
   * Known entity names in the content are automatically converted to [[wikilinks]].
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

  /**
   * Establish bidirectional wikilink relations between co-occurring entities
   * from the same diary block. Updates both markdown files and in-memory index.
   */
  async linkRelatedEntities(coOccurring: Array<{ name: string; type: string }>): Promise<void> {
    if (coOccurring.length < 2) return;

    for (const entity of coOccurring) {
      const entry = this.findEntity(entity.name);
      if (!entry) continue;

      const file = this.app.vault.getFileByPath(entry.filePath);
      if (!file) continue;

      const content = await this.app.vault.read(file);
      const card = parseCardMarkdown(content);

      // Add all OTHER entities as relations based on type
      for (const other of coOccurring) {
        if (other.name === entity.name) continue;

        if (other.type === 'person') {
          if (!card.relatedPeople.includes(other.name)) card.relatedPeople.push(other.name);
        } else if (other.type === 'object') {
          if (!card.relatedObjects.includes(other.name)) card.relatedObjects.push(other.name);
        } else if (other.type === 'theme') {
          if (!card.relatedThemes.includes(other.name)) card.relatedThemes.push(other.name);
        }
      }

      const md = cardToMarkdown(card);
      await this.app.vault.modify(file, md);

      // Update in-memory index
      const updatedEntry = cardToIndexEntry(md, entry.filePath);
      this.plugin.entityIndex = upsertEntry(this.plugin.entityIndex, updatedEntry);
    }
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
   * Check if any provider is configured.
   */
  isReady(): boolean {
    const { settings } = this.plugin;
    if (!settings.defaultProviderId) return false;
    const provider = settings.providers.find(p => p.id === settings.defaultProviderId);
    return !!provider && !!provider.apiKey && !!provider.baseUrl;
  }

  /**
   * Send chat messages to the provider configured for the given context.
   * context: 'analysis' for diary analysis, 'chat' for free-form chat
   */
  async chat(messages: ChatMessage[], context?: 'analysis' | 'chat'): Promise<{ content: string; usage: any }> {
    const provider = this.getProviderForContext(context ?? 'chat');
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    const { chat: sendChat } = await import('./ai/provider-config');
    const result = await sendChat(
      messages.map(m => ({ role: m.role, content: m.content })),
      {
        provider: 'openai',
        apiKey: provider.apiKey,
        model: provider.model,
        baseUrl: provider.baseUrl,
      }
    );
    return { content: result.content, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }

  /**
   * Stream chat messages with real SSE streaming.
   * Falls back to non-streaming chat if streamChat is unavailable.
   */
  async streamChat(
    messages: ChatMessage[],
    callbacks: { onDelta: (text: string) => void; onDone: (fullText: string) => void; onError: (error: Error) => void },
    context?: 'analysis' | 'chat',
  ): Promise<void> {
    const provider = this.getProviderForContext(context ?? 'chat');
    if (!provider) {
      callbacks.onError(new Error('No AI provider configured'));
      return;
    }

    const { streamChat: sseChat } = await import('./ai/provider-config');
    await sseChat(
      messages.map(m => ({ role: m.role, content: m.content })),
      {
        provider: 'openai' as const,
        apiKey: provider.apiKey,
        model: provider.model,
        baseUrl: provider.baseUrl,
      },
      callbacks,
    );
  }

  /**
   * Analyze a diary block using LLM entity extraction.
   */
  async analyzeBlock(content: string, blockId = ''): Promise<any> {
    // Populate existing cards from entity index
    const existingCards = new Map<string, { name: string; cardType: CardType; maturity: string }>();
    for (const entry of this.plugin.entityIndex.entries) {
      existingCards.set(entry.id, {
        name: entry.name,
        cardType: entry.type as CardType,
        maturity: entry.maturity || 'L0',
      });
    }
    console.log('[TraceMind] analyzeBlock: loaded', existingCards.size, 'existing cards from index');

    const provider = this.getProviderForContext('analysis');
    if (!provider) {
      console.warn('[TraceMind] analyzeBlock: no AI provider configured, cannot extract entities');
      new Notice('请先在设置中配置 AI Provider');
      return { entities: [], newEntities: [], existingEntities: [], hasClarifications: false, gapCount: 0 };
    }
    console.log('[TraceMind] analyzeBlock: using LLM extraction, provider:', provider.name);

    // Call LLM extraction with user profile context and entity index for AC pre-scanning
    const profileContext = this.plugin.getUserProfileContext();
    const tmResult = await AnalysisService.analyzeBlockAsync(content, existingCards, {
      apiKey: provider.apiKey || '',
      model: provider.model || 'gpt-4',
      baseUrl: provider.baseUrl || '',
      profileContext: profileContext || undefined,
    }, this.plugin.entityIndex.entries);
    console.log('[TraceMind] analyzeBlock result entities:', tmResult.entities.length, tmResult);

    // Convert to the format expected by block-editor.ts and AI panel
    const analysisResult = buildAnalysisResultImpl(tmResult.entities, blockId, content, tmResult.domainCategory);
    return {
      ...analysisResult,
      analysisResult, // setSession expects analysisResult as a field
    };
  }

  getProviderForContext(context: 'analysis' | 'chat'): ProviderConfig | null {
    const { settings } = this.plugin;
    const mapping = settings.agentProviderMapping;
    const providerId = context === 'analysis' ? mapping.analysis : mapping.chat;

    // Use mapped provider if set
    if (providerId) {
      const provider = settings.providers.find(p => p.id === providerId);
      if (provider) return provider;
    }

    // Fall back to default provider
    return this.getDefaultProvider();
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
