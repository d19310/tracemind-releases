/**
 * AI Analysis Panel View
 * Shows AI analysis results and chat interface
 */

import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import { AnalysisService } from '../ai/analysis-service';

export const VIEW_TYPE_AI_ANALYSIS = 'tracemind-ai-analysis';

export class AIAnalysisPanelView extends ItemView {
  private messagesContainer: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_AI_ANALYSIS;
  }

  getDisplayText(): string {
    return 'AI 分析';
  }

  getIcon(): string {
    return 'bot';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    // Header
    container.createEl('h3', { text: 'AI 分析面板' });

    // Messages area
    this.messagesContainer = container.createEl('div', {
      cls: 'tracemind-messages',
    });

    // Welcome message
    const welcome = this.messagesContainer.createEl('div', {
      cls: 'tracemind-message tracemind-message-assistant',
    });
    welcome.createEl('p', {
      text: '欢迎使用 TraceMind AI 分析。选择日记块后点击分析按钮开始。',
    });

    // Input area
    const inputContainer = container.createEl('div', {
      cls: 'tracemind-input-area',
    });

    this.inputEl = inputContainer.createEl('textarea', {
      cls: 'tracemind-input',
      attr: { placeholder: '输入问题或指令...' },
    });

    const sendBtn = inputContainer.createEl('button', {
      cls: 'tracemind-send-btn',
      text: '发送',
    });

    setIcon(sendBtn, 'send');

    sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  async onClose() {
    // Nothing to clean up
  }

  /**
   * Update the panel with new analysis results
   */
  updateAnalysis(result: ReturnType<typeof AnalysisService.analyzeBlock>) {
    if (!this.messagesContainer) return;

    // Clear welcome message
    this.messagesContainer.empty();

    // Add analysis result message
    const summary = AnalysisService.summarizeResult(result);
    this.addMessage('assistant', summary);

    // Show new entities
    if (result.newEntities.length > 0) {
      this.addMessage('assistant', '新实体：\n' + result.newEntities.map(e => `• ${e.name} (${e.type})`).join('\n'));
    }

    // Show clarification questions for new entities
    for (const entity of result.newEntities) {
      if (entity.clarificationQuestions.length > 0) {
        const questions = entity.clarificationQuestions.join('\n');
        this.addMessage('assistant', `关于"${entity.name}"的问题：\n${questions}`);
      }
    }
  }

  /**
   * Send a message to the AI
   */
  private async sendMessage() {
    if (!this.inputEl) return;
    const content = this.inputEl.value.trim();
    if (!content) return;

    // Add user message
    this.addMessage('user', content);
    this.inputEl.value = '';

    // TODO: Actually call AI provider
    this.addMessage('assistant', 'AI 分析功能正在开发中...');
  }

  /**
   * Add a message to the chat
   */
  private addMessage(role: 'user' | 'assistant', content: string) {
    if (!this.messagesContainer) return;
    const msgEl = this.messagesContainer.createEl('div', {
      cls: `tracemind-message tracemind-message-${role}`,
    });
    msgEl.createEl('p', { text: content });
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
