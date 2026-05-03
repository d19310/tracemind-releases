/**
 * AI Analysis Panel View
 * Modern, native, minimalist chat UI
 * Adapted for TraceMind Context Card model (v2.1.4)
 */

import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import type TraceMindPlugin from '../main';
import { AnalysisResult, BlockSession, ChatMessage, EntityPreview, PanelMode, ParsedBlock } from '../entities/types';
import { BlockEditorView, VIEW_TYPE_BLOCK_EDITOR } from './block-editor';
import { CardType, MaturityLevel } from '../core/context-card';
import type { AnalyzedEntity } from '../ai/analysis-service';

export const VIEW_TYPE_AI_ANALYSIS = 'tracemind-ai-analysis';

export class AIAnalysisPanelView extends ItemView {
	private plugin: TraceMindPlugin;
	private activeBlockId: string | null = null;
	private activeParentId: string | null = null; // Parent ID when in child block context
	private mode: PanelMode = 'analysis';
	private chatMessagesEl: HTMLElement | null = null;
	private inputAreaEl: HTMLElement | null = null;
	private inputTextarea: HTMLTextAreaElement | null = null;
	private sendBtnEl: HTMLElement | null = null;
	private chatModeClearBtnEl: HTMLElement | null = null;
	private modeToggleBtnEl: HTMLElement | null = null;
	private headerTitleEl: HTMLElement | null = null;
	private modeSelectEl: HTMLSelectElement | null = null;
	private isLoading: boolean = false;
	private emptyStateEl: HTMLElement | null = null;
	private analysisTabsEl: HTMLElement | null = null;
	private blockInsightsEl: HTMLElement | null = null;
	private entityIndexEl: HTMLElement | null = null;
	private analysisTab: 'block' | 'index' = 'block';
	private thinkingEl: HTMLElement | null = null;
	private hasTodayInsightAttention: boolean = false;

	constructor(leaf: WorkspaceLeaf, plugin: TraceMindPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_AI_ANALYSIS;
	}

	getDisplayText(): string {
		return this.mode === 'chat' ? 'AI聊天' : 'AI洞察';
	}

	async onOpen() {
		this.plugin.aiAnalysisView = this;

		const container = this.containerEl;
		container.empty();

		this.addStyles();

		const mainContainer = container.createEl('div', {
			cls: 'lifewiki-ai-panel'
		});

		// Header
		const header = mainContainer.createEl('div', {
			cls: 'lifewiki-ai-header'
		});

		const headerTitle = header.createEl('div', {
			cls: 'lifewiki-ai-header-title'
		});
		this.headerTitleEl = headerTitle.createEl('span', { text: 'AI 洞察' });
		this.analysisTabsEl = headerTitle.createEl('div', {
			cls: 'lifewiki-analysis-tabs'
		});

		const headerActions = header.createEl('div', {
			cls: 'lifewiki-ai-header-actions'
		});

		this.modeToggleBtnEl = headerActions.createEl('button', {
			cls: 'lifewiki-mode-toggle-btn analysis',
			attr: { type: 'button', title: '切换为聊天模式' }
		});
		this.renderModeToggleButton();
		this.modeToggleBtnEl.addEventListener('click', () => {
			if (this.mode === 'analysis') {
				this.switchToChatMode();
			} else {
				this.switchToAnalysisMode();
			}
		});

		this.chatModeClearBtnEl = headerActions.createEl('button', {
			cls: 'lifewiki-ai-clear-btn',
			attr: { title: '清空聊天' }
		});
		setIcon(this.chatModeClearBtnEl, 'trash-2');
		const clearSvg = this.chatModeClearBtnEl.querySelector('svg');
		if (clearSvg) {
			clearSvg.setAttribute('width', '20');
			clearSvg.setAttribute('height', '20');
		}
		this.chatModeClearBtnEl.addClass('hidden');
		this.chatModeClearBtnEl.addEventListener('click', () => {
			this.clearChatSession();
		});

		// Scrollable chat area
		const scrollContent = mainContainer.createEl('div', {
			cls: 'lifewiki-ai-scroll'
		});

		this.emptyStateEl = scrollContent.createEl('div', {
			cls: 'lifewiki-empty-state'
		});
		this.emptyStateEl.createEl('span', {
			cls: 'lifewiki-empty-state-title',
			text: '选择或输入一条日记'
		});

		this.entityIndexEl = scrollContent.createEl('div', {
			cls: 'lifewiki-entity-index'
		});

		this.chatMessagesEl = scrollContent.createEl('div', {
			cls: 'lifewiki-chat-messages'
		});

		this.blockInsightsEl = scrollContent.createEl('div', {
			cls: 'lifewiki-block-insights'
		});

		// Bottom input area — visible in BOTH analysis and chat mode
		const inputArea = mainContainer.createEl('div', {
			cls: 'lifewiki-ai-input-area'
		});
		this.inputAreaEl = inputArea;

		const inputWrapper = inputArea.createEl('div', {
			cls: 'lifewiki-chat-input-wrapper'
		});

		const inputRow = inputWrapper.createEl('div', {
			cls: 'lifewiki-input-row'
		});

		this.inputTextarea = inputRow.createEl('textarea', {
			cls: 'lifewiki-input-textarea',
			attr: {
				placeholder: '回答澄清问题或补充背景...',
				rows: '1'
			}
		}) as HTMLTextAreaElement;

		this.inputTextarea.addEventListener('input', () => {
			this.autoResizeTextarea();
			this.updateSendBtnState();
		});

		this.inputTextarea.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		const modeRow = inputWrapper.createEl('div', {
			cls: 'lifewiki-mode-row'
		});

		this.modeSelectEl = modeRow.createEl('select', {
			cls: 'lifewiki-mode-select'
		}) as HTMLSelectElement;
		this.modeSelectEl.createEl('option', { value: 'analysis', text: '当前日记' });
		this.modeSelectEl.createEl('option', { value: 'chat', text: '全局聊天' });

		this.modeSelectEl.addEventListener('change', () => {
			const selectedMode = this.modeSelectEl?.value as PanelMode;
			if (selectedMode === 'chat') {
				this.switchToChatMode();
			} else {
				this.switchToAnalysisMode();
			}
		});

		this.sendBtnEl = modeRow.createEl('button', {
			cls: 'lifewiki-send-btn',
			attr: { title: '发送' }
		});
		setIcon(this.sendBtnEl, 'arrow-up');

		this.sendBtnEl.addEventListener('click', () => {
			const content = this.inputTextarea?.value.trim();
			if (content && !this.isLoading) {
				this.sendMessage();
			}
		});

		this.showEmptyState();
		this.renderAnalysisTabs();
		this.updateSendBtnState();
	}

	private autoResizeTextarea() {
		if (!this.inputTextarea) return;
		const minHeight = 66;
		const maxHeight = 120;
		const scrollHeight = this.inputTextarea.scrollHeight;
		this.inputTextarea.style.height = Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px';
	}

	private updateSendBtnState() {
		if (!this.sendBtnEl || !this.inputTextarea) return;
		const hasContent = this.inputTextarea.value.trim().length > 0 && !this.isLoading;
		this.sendBtnEl.classList.toggle('active', hasContent);
	}

	private addStyles() {
		const styleEl = document.createElement('style');
		styleEl.textContent = `
/* AI Analysis Panel - "The Intellectual Atelier" Design System */

:root {
	--surface: #f9f9f9;
	--surface-container-low: #f3f3f3;
	--surface-container-lowest: #ffffff;
	--surface-container-high: #e8e8e8;
	--surface-variant: #e2e2e2;
	--on-surface: #1a1c1c;
	--on-surface-variant: #4a4453;
	--outline-variant: rgba(204, 195, 214, 0.4);
	--outline: #7b7485;
	--primary: #5c28b8;
	--primary-container: #7546d2;
	--on-primary: #ffffff;
	--on-primary-container: #eadcff;
	--secondary: #67558e;
	--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.lifewiki-ai-panel {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: var(--surface-container-low);
	overflow: hidden;
	position: relative;
}

.lifewiki-ai-header {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 18px 20px 0;
	flex-shrink: 0;
	background: var(--surface-container-low);
	backdrop-filter: blur(16px);
	border-bottom: 1px solid var(--outline-variant);
}

.lifewiki-ai-header-title {
	display: flex;
	align-items: center;
	gap: 8px;
}

.lifewiki-ai-header-title span {
	font-family: var(--font-body);
	font-size: 14px;
	font-weight: 600;
	color: var(--primary);
	letter-spacing: 0.02em;
}

.lifewiki-ai-header-actions {
	display: flex;
	align-items: center;
	gap: 4px;
	padding-bottom: 14px;
}

.lifewiki-ai-clear-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	border: none;
	background: transparent;
	color: var(--on-surface-variant);
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.lifewiki-ai-clear-btn:hover {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.lifewiki-mode-toggle-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-height: 30px;
	border-radius: 8px;
	border: 1px solid var(--outline-variant);
	padding: 5px 9px;
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 650;
	line-height: 1;
	cursor: pointer;
	transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s;
}

.lifewiki-mode-toggle-btn:hover {
	transform: translateY(-1px);
}

.lifewiki-mode-toggle-btn.analysis {
	background: var(--surface-container-lowest);
	color: var(--primary);
	border-color: rgba(92, 40, 184, 0.24);
}

.lifewiki-mode-toggle-btn.chat {
	background: rgba(26, 28, 28, 0.04);
	color: var(--on-surface);
	border-color: rgba(26, 28, 28, 0.16);
}

.lifewiki-mode-toggle-btn svg {
	width: 15px;
	height: 15px;
}

.lifewiki-ai-clear-btn svg {
	width: 20px !important;
	height: 20px !important;
	transform: scale(1.2);
	transform-origin: center;
}

.lifewiki-ai-scroll {
	flex: 1 1 0;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 18px 16px 16px;
	padding-bottom: 24px;
	display: flex;
	flex-direction: column;
	background: var(--surface-container-low);
	min-height: 0;
}

.lifewiki-ai-scroll::-webkit-scrollbar {
	width: 6px;
}

.lifewiki-ai-scroll::-webkit-scrollbar-track {
	background: transparent;
}

.lifewiki-ai-scroll::-webkit-scrollbar-thumb {
	background: rgba(204, 195, 214, 0.4);
	border-radius: 3px;
}

.lifewiki-ai-scroll::-webkit-scrollbar-thumb:hover {
	background: rgba(204, 195, 214, 0.6);
}

.lifewiki-empty-state {
	display: none !important;
	height: 100% !important;
	text-align: center !important;
	padding: 0 !important;
	background: transparent !important;
	box-shadow: none !important;
	border: none !important;
	border-radius: 0 !important;
	outline: none !important;
}

.lifewiki-empty-state.visible {
	display: block !important;
}

.lifewiki-empty-state-title {
	font-family: var(--font-body) !important;
	font-size: 13px !important;
	color: var(--on-surface-variant) !important;
	opacity: 0.5 !important;
	background: transparent !important;
	padding: 0 !important;
	border: none !important;
	box-shadow: none !important;
}

.lifewiki-chat-messages {
	display: none;
	flex-direction: column;
	gap: 16px;
	padding-bottom: 16px;
	margin-bottom: 150px;
	background: transparent;
}

.lifewiki-chat-messages.visible {
	display: flex;
	background: transparent;
}

.lifewiki-entity-index {
	display: none;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 16px;
}

.lifewiki-entity-index.visible {
	display: flex;
}

.lifewiki-entity-index-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-entity-index-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-family: var(--font-body);
	font-size: 11px;
	font-weight: 600;
	color: var(--on-surface-variant);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.lifewiki-entity-index-count {
	font-size: 11px;
	font-weight: 500;
	color: var(--outline);
}

.lifewiki-entity-index-item {
	background: var(--surface-container-lowest);
	border: 1px solid rgba(204, 195, 214, 0.18);
	border-radius: 8px;
	padding: 10px 12px;
	box-shadow: 0 4px 16px -8px rgba(26, 28, 28, 0.08);
}

.lifewiki-entity-index-item-title {
	font-family: var(--font-body);
	font-size: 13px;
	font-weight: 600;
	line-height: 1.4;
	color: var(--on-surface);
	margin-bottom: 4px;
}

.lifewiki-entity-index-item-body {
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface-variant);
}

.lifewiki-entity-index-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
}

.lifewiki-entity-index-chip {
	font-family: var(--font-body);
	font-size: 10px;
	line-height: 1;
	color: var(--primary);
	background: rgba(92, 40, 184, 0.08);
	border-radius: 999px;
	padding: 4px 7px;
}

.lifewiki-entity-index-chip.maturity {
	color: var(--secondary);
	background: rgba(103, 85, 142, 0.08);
}

.lifewiki-entity-index-empty {
	border: 1px dashed rgba(204, 195, 214, 0.24);
	border-radius: 8px;
	padding: 9px 11px;
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.45;
	color: var(--outline);
	background: rgba(255, 251, 255, 0.42);
}

.lifewiki-chat-msg {
	padding: 12px 16px;
	border-radius: 12px;
	font-family: var(--font-body);
	font-size: 14px;
	line-height: 1.6;
	word-wrap: break-word;
	overflow-wrap: break-word;
	animation: messageFadeIn 0.2s ease-out;
	user-select: text;
	position: relative;
	max-width: 80%;
}

@keyframes messageFadeIn {
	from { opacity: 0; transform: translateY(4px); }
	to { opacity: 1; transform: translateY(0); }
}

.lifewiki-chat-msg.assistant {
	align-self: flex-start;
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	border-radius: 12px;
	border: 1px solid rgba(204, 195, 214, 0.15);
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
}

.lifewiki-chat-msg.user {
	align-self: flex-end;
	background: var(--surface-container-high);
	color: var(--on-surface);
	border-radius: 12px;
	border: 1px solid rgba(204, 195, 214, 0.15);
}

.lifewiki-chat-msg strong {
	color: var(--primary);
	font-weight: 600;
}

.lifewiki-chat-msg-copy-hint {
	position: absolute;
	top: 8px;
	right: 10px;
	font-size: 10px;
	color: var(--on-surface-variant);
	opacity: 0;
	transition: opacity 0.15s;
}

.lifewiki-chat-msg.assistant:hover .lifewiki-chat-msg-copy-hint {
	opacity: 1;
}

.lifewiki-thinking {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	background: var(--surface-container-lowest);
	border-radius: 12px;
	border-top-left-radius: 4px;
	border: 1px solid rgba(204, 195, 214, 0.15);
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
	animation: messageFadeIn 0.2s ease-out;
}

.lifewiki-thinking-dots {
	display: flex;
	gap: 6px;
}

.lifewiki-thinking-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--on-surface-variant);
	animation: thinkingPulse 1.2s ease-in-out infinite;
}

.lifewiki-thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.lifewiki-thinking-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes thinkingPulse {
	0%, 100% { transform: scale(0.8); opacity: 0.5; }
	50% { transform: scale(1); opacity: 1; }
}

.lifewiki-ai-input-area {
	position: absolute;
	bottom: 32px;
	left: 16px;
	right: 16px;
	z-index: 20;
	padding: 0;
}

.lifewiki-chat-input-wrapper {
	background: var(--surface-container-lowest);
	border-radius: 16px;
	padding: 12px;
	box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
	border: 1px solid rgba(204, 195, 214, 0.15);
	display: flex;
	flex-direction: column;
	min-height: 100px;
}

.lifewiki-chat-input-wrapper:focus-within {
	border-color: rgba(204, 195, 214, 0.15);
	box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
}

.lifewiki-input-row {
	display: flex;
	align-items: stretch;
	flex: 1;
}

.lifewiki-input-textarea {
	flex: 1;
	min-height: 60px;
	max-height: 180px;
	resize: none;
	border: none !important;
	padding: 0;
	font-family: var(--font-body);
	font-size: 14px;
	line-height: 1.6;
	background: transparent;
	color: var(--on-surface);
	outline: none !important;
	box-shadow: none !important;
	overflow-y: auto;
}

.lifewiki-input-textarea:focus {
	border: none !important;
	outline: none !important;
	box-shadow: none !important;
}

.lifewiki-input-textarea::placeholder {
	color: var(--on-surface-variant);
	opacity: 0.6;
}

.lifewiki-send-btn {
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	width: 36px !important;
	height: 36px !important;
	border: 1px solid var(--surface-container-high) !important;
	border-radius: 50% !important;
	background: var(--surface-container-high) !important;
	color: var(--on-surface-variant) !important;
	cursor: pointer;
	transition: background-color 0.2s, transform 0.2s;
	flex-shrink: 0;
}

.lifewiki-send-btn svg {
	width: 24px !important;
	height: 24px !important;
}

.lifewiki-send-btn:hover {
	transform: translateY(-1px);
}

.lifewiki-send-btn.active {
	background: #5c28b8 !important;
	color: #ffffff !important;
}

.lifewiki-chat-input-wrapper:focus-within .lifewiki-send-btn {
	background: #5c28b8 !important;
	color: #ffffff !important;
}

.lifewiki-model-select {
	background: transparent;
	border: none;
	color: var(--on-surface-variant);
	font-family: var(--font-body);
	font-size: 10px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	cursor: pointer;
	outline: none;
	padding: 0;
}

.lifewiki-model-select:hover {
	color: var(--primary);
}

.lifewiki-entity-confirm {
	background: var(--surface-container-lowest);
	border: 1px solid rgba(204, 195, 214, 0.15);
	border-radius: 12px;
	padding: 16px;
	margin: 8px 0;
	animation: messageFadeIn 0.2s ease-out;
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
}

.lifewiki-entity-confirm-title {
	font-family: var(--font-body);
	font-size: 14px;
	font-weight: 500;
	color: var(--on-surface);
	margin-bottom: 6px;
}

.lifewiki-entity-confirm-reason {
	font-family: var(--font-body);
	font-size: 12px;
	color: var(--on-surface-variant);
	margin-bottom: 12px;
	line-height: 1.5;
}

.lifewiki-entity-confirm-buttons {
	display: flex;
	gap: 8px;
}

.lifewiki-entity-confirm-btn {
	flex: 1;
	padding: 8px 14px;
	border-radius: 8px;
	border: none;
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;
}

.lifewiki-entity-confirm-btn.archive {
	background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
	color: var(--on-primary);
}

.lifewiki-entity-confirm-btn.archive:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px -2px rgba(92, 40, 184, 0.25);
}

.lifewiki-entity-confirm-btn.skip {
	background: transparent;
	border: 1px solid rgba(204, 195, 214, 0.3);
	color: var(--on-surface-variant);
}

.lifewiki-entity-confirm-btn.skip:hover {
	border-color: var(--primary);
	color: var(--primary);
}

.lifewiki-entity-confirm-btn.interact {
	background: var(--surface-container-low);
	color: var(--on-surface);
	border: 1px solid var(--outline-variant);
}

.lifewiki-entity-confirm-btn.interact:hover {
	border-color: var(--primary);
	color: var(--primary);
}

/* Mode row - left aligned, with send button on right */
.lifewiki-mode-row {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 8px;
	margin-top: 8px;
}

/* Mode switch select */
.lifewiki-mode-select {
	display: none;
	padding: 4px 8px;
	border-radius: 6px;
	border: 1px solid var(--surface-container-high);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;
	outline: none;
}

.lifewiki-mode-select:focus {
	border-color: var(--surface-container-high);
}

.lifewiki-mode-select:hover {
	border-color: var(--primary);
	color: var(--primary);
}

.lifewiki-mode-select option {
	background: var(--surface-container-high);
	color: var(--on-surface);
}

.lifewiki-analysis-tabs {
	display: none;
	gap: 0;
	flex-shrink: 0;
	align-items: flex-end;
	border-bottom: none;
	padding: 0;
	margin-bottom: -1px;
}

.lifewiki-analysis-tabs.visible {
	display: flex;
}

.lifewiki-analysis-tab {
	border: 1px solid var(--outline-variant);
	border-bottom-color: var(--outline-variant);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
	border-radius: 9px 9px 0 0;
	padding: 8px 14px 9px;
	margin-right: 3px;
	font-size: 12px;
	font-weight: 600;
	line-height: 1.2;
	cursor: pointer;
	position: relative;
	min-width: 72px;
	box-shadow: inset 0 -1px 0 rgba(26, 28, 28, 0.04);
	transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.lifewiki-analysis-tab:hover {
	background: var(--surface-container-lowest);
	color: var(--on-surface);
}

.lifewiki-analysis-tab.active {
	border-color: var(--outline-variant);
	border-bottom-color: var(--surface-container-low);
	color: var(--primary);
	background: var(--surface-container-low);
	box-shadow: none;
	z-index: 1;
}

.lifewiki-analysis-tab.has-attention::after {
	content: '';
	position: absolute;
	top: 3px;
	right: 4px;
	width: 7px;
	height: 7px;
	border-radius: 999px;
	background: #ef4444;
	box-shadow: 0 0 0 2px var(--surface-container-lowest);
}

.lifewiki-block-insights {
	display: none;
	padding: 0 0 16px;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 0;
}

.lifewiki-block-insights.visible {
	display: flex;
}

.lifewiki-insight-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-insight-section-title {
	font-size: 12px;
	font-weight: 600;
	color: var(--on-surface-variant);
}

.lifewiki-confirm-card {
	border: 1px solid var(--outline-variant);
	background: var(--surface-container-lowest);
	border-radius: 8px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-confirm-card-title {
	font-size: 13px;
	font-weight: 600;
	color: var(--on-surface);
}

.lifewiki-confirm-card-body {
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface-variant);
	white-space: pre-wrap;
	word-break: break-word;
}

.lifewiki-confirm-card-supplement {
	border-left: 2px solid rgba(92, 40, 184, 0.2);
	padding-left: 8px;
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface);
	white-space: pre-wrap;
}

.lifewiki-confirm-card-supplement-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--primary);
	margin-bottom: 2px;
}

.lifewiki-confirm-card-editor {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.lifewiki-confirm-card-textarea {
	min-height: 64px;
	resize: vertical;
	border: 1px solid var(--outline-variant);
	border-radius: 7px;
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.5;
	padding: 8px;
	outline: none;
}

.lifewiki-confirm-card-textarea:focus {
	border-color: var(--primary);
	box-shadow: 0 0 0 2px rgba(92, 40, 184, 0.08);
}

.lifewiki-confirm-card-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.lifewiki-confirm-chip {
	font-size: 11px;
	line-height: 1;
	padding: 4px 7px;
	border-radius: 999px;
	color: var(--on-surface-variant);
	background: var(--surface-container-low);
	border: 1px solid var(--outline-variant);
}

.lifewiki-confirm-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.lifewiki-confirm-action {
	border: 1px solid var(--outline-variant);
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	border-radius: 6px;
	padding: 5px 8px;
	font-size: 12px;
	cursor: pointer;
}

.lifewiki-confirm-action.primary {
	background: var(--primary);
	border-color: var(--primary);
	color: var(--on-primary);
}

.lifewiki-confirm-action:hover {
	border-color: var(--primary);
}

/* Hidden class for header elements */
.lifewiki-ai-header-actions .hidden {
	display: none;
}

/* Chat mode active state */
.chat-mode .lifewiki-ai-panel {
}

@media (max-width: 400px) {
	.lifewiki-chat-msg {
		max-width: 92%;
	}
}
		`;
		this.containerEl.appendChild(styleEl);
	}

	private showEmptyState() {
		this.emptyStateEl?.addClass('visible');
		this.chatMessagesEl?.removeClass('visible');
		this.blockInsightsEl?.removeClass('visible');
		this.entityIndexEl?.removeClass('visible');
		this.updateInputVisibility();
	}

	private showChatState() {
		this.emptyStateEl?.removeClass('visible');
		this.applyAnalysisTabVisibility();
		this.updateInputVisibility();
	}

	private updateInputVisibility() {
		// Input is visible in BOTH analysis and chat modes
		if (this.inputAreaEl) {
			this.inputAreaEl.style.removeProperty('display');
		}
	}

	private renderModeToggleButton() {
		if (!this.modeToggleBtnEl) return;
		this.modeToggleBtnEl.empty();
		this.modeToggleBtnEl.removeClass('analysis');
		this.modeToggleBtnEl.removeClass('chat');
		const isChat = this.mode === 'chat';
		this.modeToggleBtnEl.addClass(isChat ? 'chat' : 'analysis');
		this.modeToggleBtnEl.setAttr('title', isChat ? '切换为分析模式' : '切换为聊天模式');
		setIcon(this.modeToggleBtnEl, isChat ? 'sparkles' : 'messages-square');
		this.modeToggleBtnEl.createEl('span', {
			text: isChat ? '切换为分析模式' : '切换为聊天模式'
		});
	}

	private setEmptyStateText(text: string) {
		const title = this.emptyStateEl?.querySelector('.lifewiki-empty-state-title') as HTMLElement | null;
		if (title) title.textContent = text;
	}

	private renderAnalysisTabs() {
		if (!this.analysisTabsEl) return;
		this.analysisTabsEl.empty();
		if (this.mode !== 'analysis') {
			this.analysisTabsEl.removeClass('visible');
			if (this.headerTitleEl) this.headerTitleEl.style.display = '';
			return;
		}

		this.analysisTabsEl.addClass('visible');
		if (this.headerTitleEl) this.headerTitleEl.style.display = 'none';
		const tabs: Array<{ id: 'block' | 'index'; label: string }> = [
			{ id: 'block', label: '当前日记' },
			{ id: 'index', label: '实体索引' }
		];

		for (const tab of tabs) {
			const hasAttention = tab.id === 'index' && this.hasTodayInsightAttention;
			const tabEl = this.analysisTabsEl.createEl('button', {
				cls: `lifewiki-analysis-tab ${this.analysisTab === tab.id ? 'active' : ''} ${hasAttention ? 'has-attention' : ''}`,
				text: tab.label,
				attr: { type: 'button' }
			});
			tabEl.addEventListener('click', () => {
				this.analysisTab = tab.id;
				this.renderAnalysisTabs();
				this.applyAnalysisTabVisibility();
				if (tab.id === 'index') {
					void this.renderEntityIndex();
				}
			});
		}
	}

	private applyAnalysisTabVisibility() {
		if (this.mode !== 'analysis') {
			this.analysisTabsEl?.removeClass('visible');
			if (this.headerTitleEl) this.headerTitleEl.style.display = '';
			this.entityIndexEl?.removeClass('visible');
			this.blockInsightsEl?.removeClass('visible');
			this.chatMessagesEl?.addClass('visible');
			this.updateInputVisibility();
			return;
		}

		this.renderAnalysisTabs();
		if (this.analysisTab === 'index') {
			this.emptyStateEl?.removeClass('visible');
			this.chatMessagesEl?.removeClass('visible');
			this.blockInsightsEl?.removeClass('visible');
			this.entityIndexEl?.addClass('visible');
		} else {
			this.entityIndexEl?.removeClass('visible');
			if (!this.activeBlockId) {
				this.emptyStateEl?.addClass('visible');
				this.chatMessagesEl?.removeClass('visible');
				this.blockInsightsEl?.removeClass('visible');
				return;
			}
			this.emptyStateEl?.removeClass('visible');
			this.chatMessagesEl?.removeClass('visible');
			this.blockInsightsEl?.addClass('visible');
		}
		this.updateInputVisibility();
	}

	public clearConversation() {
		this.chatMessagesEl?.empty();
		this.activeBlockId = null;
		this.showEmptyState();
	}

	public switchToChatMode() {
		this.mode = 'chat';
		this.activeBlockId = null;
		this.entityIndexEl?.removeClass('visible');
		this.analysisTabsEl?.removeClass('visible');
		this.blockInsightsEl?.removeClass('visible');
		this.renderModeToggleButton();
		this.setEmptyStateText('可以检索、总结或更新你的 vault');

		if (this.headerTitleEl) {
			this.headerTitleEl.textContent = 'AI 聊天';
			this.headerTitleEl.style.display = '';
		}

		if (this.modeSelectEl) {
			this.modeSelectEl.value = 'chat';
		}

		if (this.chatModeClearBtnEl) {
			this.chatModeClearBtnEl.removeClass('hidden');
		}

		if (this.inputTextarea) {
			this.inputTextarea.placeholder = '问问你的 vault，例如：总结本周日记、查找某个项目、更新某个人的背景...';
		}

		this.containerEl.querySelector('.lifewiki-ai-panel')?.addClass('chat-mode');
		this.updateInputVisibility();

		const sessionManager = this.plugin.getSessionManager();
		const chatSession = sessionManager.getChatSession();
		if (chatSession && chatSession.messages.length > 0) {
			this.showChatState();
			this.chatMessagesEl?.empty();
			for (const message of chatSession.messages) {
				if (message.role !== 'system') {
					this.addChatMessage(message.role, message.content);
				}
			}
		} else {
			this.showEmptyState();
		}
	}

	public switchToAnalysisMode() {
		this.mode = 'analysis';
		this.analysisTab = this.analysisTab || 'block';
		this.renderModeToggleButton();
		this.setEmptyStateText('选择或输入一条日记');

		if (this.headerTitleEl) {
			this.headerTitleEl.textContent = 'AI洞察';
			this.headerTitleEl.style.display = 'none';
		}

		if (this.modeSelectEl) {
			this.modeSelectEl.value = 'analysis';
		}

		if (this.chatModeClearBtnEl) {
			this.chatModeClearBtnEl.addClass('hidden');
		}

		if (this.inputTextarea) {
			this.inputTextarea.placeholder = '回答澄清问题或补充背景...';
		}

		this.containerEl.querySelector('.lifewiki-ai-panel')?.removeClass('chat-mode');
		this.updateInputVisibility();
		this.applyAnalysisTabVisibility();
	}

	public clearChatSession() {
		const sessionManager = this.plugin.getSessionManager();
		sessionManager.clearChatSession();
		this.chatMessagesEl?.empty();
		this.showEmptyState();
	}

	public setMode(mode: PanelMode) {
		if (mode === 'chat') {
			this.switchToChatMode();
		} else {
			this.switchToAnalysisMode();
		}
	}

	public getMode(): PanelMode {
		return this.mode;
	}

	private showThinkingIndicator() {
		if (!this.chatMessagesEl || !this.isLoading) return;

		this.thinkingEl = this.chatMessagesEl.createEl('div', {
			cls: 'lifewiki-thinking'
		});

		const dotsEl = this.thinkingEl.createEl('div', {
			cls: 'lifewiki-thinking-dots'
		});

		dotsEl.createEl('span', { cls: 'lifewiki-thinking-dot' });
		dotsEl.createEl('span', { cls: 'lifewiki-thinking-dot' });
		dotsEl.createEl('span', { cls: 'lifewiki-thinking-dot' });

		this.scrollToBottom();
	}

	private hideThinkingIndicator() {
		if (this.thinkingEl) {
			this.thinkingEl.remove();
			this.thinkingEl = null;
		}
	}

	private scrollToBottom() {
		const scrollEl = this.containerEl.querySelector('.lifewiki-ai-scroll');
		if (scrollEl) {
			scrollEl.scrollTop = scrollEl.scrollHeight;
		}
	}

	setActiveBlock(blockId: string, blockContent: string, parentId?: string | null) {
		this.switchToAnalysisMode();
		this.activeBlockId = blockId;
		this.activeParentId = parentId || null;
		const sessionManager = this.plugin.getSessionManager();
		const session = sessionManager.getOrCreateSession(blockId, parentId || null);
		this.showChatState();
		this.renderSession(session);
	}

	startNewSession(blockId: string, blockContent: string, initialResponse: string, parentId: string | null = null) {
		this.switchToAnalysisMode();
		this.activeBlockId = blockId;
		this.activeParentId = parentId;
		this.showChatState();

		this.chatMessagesEl?.empty();

		const sessionManager = this.plugin.getSessionManager();
		const session = sessionManager.getOrCreateSession(blockId, parentId);
		sessionManager.setContent(blockId, blockContent, parentId);
		this.renderBlockInsightCards(session);
	}

	showAgentSession(blockId: string, blockContent: string, session: BlockSession, parentId: string | null = null) {
		this.switchToAnalysisMode();
		this.activeBlockId = blockId;
		this.activeParentId = parentId;
		this.showChatState();

		const sessionManager = this.plugin.getSessionManager();
		const persistedSession = sessionManager.setSession(blockId, {
			...session,
			content: session.content || blockContent
		}, parentId);

		this.renderSession(persistedSession);
	}

	private renderSession(session: BlockSession) {
		if (!this.chatMessagesEl) return;
		this.chatMessagesEl.empty();
		this.renderBlockInsightCards(session);
	}

	updateAnalysis(result: AnalysisResult) {
		if (!this.activeBlockId) return;
		const sessionManager = this.plugin.getSessionManager();
		sessionManager.setAnalysisResult(this.activeBlockId, result, this.activeParentId);
		this.renderBlockInsightCards(sessionManager.getSession(this.activeBlockId, this.activeParentId));
		void this.refreshEntityIndexAttention();
	}

	private renderBlockInsightCards(session?: BlockSession | null) {
		if (!this.blockInsightsEl) return;
		this.blockInsightsEl.empty();

		if (!session || this.mode !== 'analysis') {
			this.blockInsightsEl.removeClass('visible');
			return;
		}

		const entities = this.flattenEntityPreviews(session.analysisResult);
		let cardCount = 0;

		cardCount += this.renderEntityCards(this.blockInsightsEl, entities, session);
		cardCount += this.renderRelationCards(this.blockInsightsEl, entities, session);

		if (cardCount === 0) {
			const section = this.createInsightSection(this.blockInsightsEl, '待确认');
			section.createEl('div', {
				cls: 'lifewiki-memory-empty',
				text: '这条日记暂时没有需要确认归档的内容。'
			});
		}

		this.applyAnalysisTabVisibility();
	}

	private flattenEntityPreviews(result?: AnalysisResult | null): EntityPreview[] {
		if (!result) return [];
		return [
			...result.entities.people,
			...result.entities.objects,
			...result.entities.dimensions
		];
	}

	private renderEntityCards(container: HTMLElement, entities: EntityPreview[], session: BlockSession): number {
		if (entities.length === 0) return 0;
		const visibleEntities = entities.slice(0, 6).filter((entity) => !this.isReviewCardDone(session, this.entityCardId(entity)));
		if (visibleEntities.length === 0) return 0;
		const section = this.createInsightSection(container, '实体与背景');
		let count = 0;

		for (const entity of visibleEntities) {
			const cardId = this.entityCardId(entity);
			count++;
			const archived = entity.isArchived || !!this.plugin.getEntityManager()?.findEntity(entity.name);
			const supplement = this.getReviewSupplement(session, cardId);
			const maturityLabel = entity.maturity ? this.maturityLabel(entity.maturity) : '';
			const chips = [
				this.getEntityTypeLabel(entity.type),
				archived ? '已有档案' : '待归档',
				`置信度 ${Math.round(entity.confidence * 100)}%`,
				...(maturityLabel ? [maturityLabel] : [])
			];
			const card = this.createConfirmCard(section, {
				title: `${archived ? '已识别' : '新'}${this.getEntityTypeLabel(entity.type)}：${entity.name}`,
				body: entity.context || 'AI 从这条日记中识别到这个实体，但还缺少背景说明。',
				chips,
				supplement
			});

			// Also show clarification questions
			if (entity.clarificationQuestions && entity.clarificationQuestions.length > 0) {
				const qEl = card.createEl('div', {
					cls: 'lifewiki-confirm-card-supplement'
				});
				qEl.createEl('div', {
					cls: 'lifewiki-confirm-card-supplement-label',
					text: '待澄清'
				});
				qEl.createEl('div', {
					text: entity.clarificationQuestions[0]
				});
			}

			const isLowMaturity = !entity.maturity || entity.maturity === 'L0' || entity.maturity === 'L1';

			if (archived && !isLowMaturity) {
				// L2+ existing entity: "记录互动"
				this.addConfirmAction(card, '记录互动', 'primary', async () => {
					await this.recordEntityInteraction(entity.name, this.mergeSupplement(`日记提到：${this.currentSessionContent()}`, supplement));
					this.markReviewCard(cardId, 'confirmed', supplement);
					this.replaceCardWithStatus(card, `已把这次互动记录到「${entity.name}」档案。`);
				});
			} else if (!archived) {
				// New entity: "确认并补充" or "跳过"
				this.addConfirmAction(card, isLowMaturity ? '确认并补充' : '确认', 'primary', async () => {
					await this.archiveEntityPreview(entity, supplement);
					this.markReviewCard(cardId, 'confirmed', supplement);
					this.replaceCardWithStatus(card, `已归档「${entity.name}」。`);
				});
			}
			this.addConfirmAction(card, '补充背景', '', () => {
				this.showSupplementEditor(card, cardId, `补充「${entity.name}」的背景`, supplement);
			});
			this.addConfirmAction(card, '跳过', '', () => {
				this.markReviewCard(cardId, 'skipped', supplement);
				card.remove();
			});
		}

		return count;
	}

	private renderRelationCards(container: HTMLElement, entities: EntityPreview[], session: BlockSession): number {
		const archived = entities.filter((entity) => this.plugin.getEntityManager()?.findEntity(entity.name));
		const candidates = archived.length >= 2 ? archived.slice(0, 2) : entities.slice(0, 2);
		if (candidates.length < 2) return 0;

		const [first, second] = candidates;
		const cardId = this.relationCardId(first, second);
		if (this.isReviewCardDone(session, cardId)) return 0;
		const section = this.createInsightSection(container, '关系线索');
		const canRecord = archived.length >= 2;
		const supplement = this.getReviewSupplement(session, cardId);
		const card = this.createConfirmCard(section, {
			title: `${first.name} 和 ${second.name} 的关系`,
			body: '这条日记同时提到了它们。关系类型最好由你确认后再归档。',
			chips: ['关系', canRecord ? '可归档' : '需先归档实体'],
			supplement
		});

		if (canRecord) {
			this.addConfirmAction(card, '记录为相关', 'primary', async () => {
				await this.handleRelations([{ from: first.name, to: second.name, relation: 'related_to', context: supplement }]);
				this.markReviewCard(cardId, 'confirmed', supplement);
				this.replaceCardWithStatus(card, `已记录「${first.name}」和「${second.name}」的相关关系。`);
			});
		}
		this.addConfirmAction(card, '说明关系', canRecord ? '' : 'primary', () => {
			this.showSupplementEditor(card, cardId, `说明「${first.name}」和「${second.name}」的关系`, supplement);
		});
		this.addConfirmAction(card, '跳过', '', () => {
			this.markReviewCard(cardId, 'skipped', supplement);
			card.remove();
		});
		return 1;
	}

	private createInsightSection(container: HTMLElement, title: string): HTMLElement {
		const section = container.createEl('div', {
			cls: 'lifewiki-insight-section'
		});
		section.createEl('div', {
			cls: 'lifewiki-insight-section-title',
			text: title
		});
		return section;
	}

	private createConfirmCard(section: HTMLElement, options: { title: string; body: string; chips: string[]; supplement?: string }): HTMLElement {
		const card = section.createEl('div', {
			cls: 'lifewiki-confirm-card'
		});
		card.createEl('div', {
			cls: 'lifewiki-confirm-card-title',
			text: options.title
		});
		card.createEl('div', {
			cls: 'lifewiki-confirm-card-body',
			text: options.body
		});
		if (options.supplement) {
			const supplement = card.createEl('div', {
				cls: 'lifewiki-confirm-card-supplement'
			});
			supplement.createEl('div', {
				cls: 'lifewiki-confirm-card-supplement-label',
				text: '你的补充'
			});
			supplement.createEl('div', {
				text: options.supplement
			});
		}
		const meta = card.createEl('div', {
			cls: 'lifewiki-confirm-card-meta'
		});
		for (const chip of options.chips.filter(Boolean)) {
			meta.createEl('span', {
				cls: 'lifewiki-confirm-chip',
				text: chip
			});
		}
		card.createEl('div', {
			cls: 'lifewiki-confirm-actions'
		});
		return card;
	}

	private addConfirmAction(card: HTMLElement, label: string, variant: string, onClick: () => void | Promise<void>) {
		const actions = card.querySelector('.lifewiki-confirm-actions') as HTMLElement | null;
		if (!actions) return;
		const button = actions.createEl('button', {
			cls: `lifewiki-confirm-action ${variant}`,
			text: label,
			attr: { type: 'button' }
		});
		button.addEventListener('click', async (event) => {
			event.stopPropagation();
			button.setAttribute('disabled', 'true');
			try {
				await onClick();
			} catch (error) {
				console.error('[AIAnalysisPanel] confirm action failed:', error);
				this.replaceCardWithStatus(card, `操作失败：${(error as Error).message}`);
			} finally {
				button.removeAttribute('disabled');
			}
		});
	}

	private replaceCardWithStatus(card: HTMLElement, message: string) {
		card.empty();
		card.createEl('div', {
			cls: 'lifewiki-confirm-card-body',
			text: message
		});
	}

	private entityCardId(entity: EntityPreview): string {
		return `entity:${entity.type}:${entity.name}`;
	}

	private relationCardId(first: EntityPreview, second: EntityPreview): string {
		return `relation:${first.name}:${second.name}`;
	}

	private isReviewCardDone(session: BlockSession, cardId: string): boolean {
		const status = session.reviewCards?.[cardId]?.status;
		return status === 'confirmed' || status === 'skipped';
	}

	private getReviewSupplement(session: BlockSession, cardId: string): string {
		return session.reviewCards?.[cardId]?.supplement || '';
	}

	private markReviewCard(cardId: string, status: 'pending' | 'confirmed' | 'skipped', supplement?: string) {
		if (!this.activeBlockId) return;
		this.plugin.getSessionManager().updateReviewCard(this.activeBlockId, cardId, { status, supplement }, this.activeParentId);
	}

	private showSupplementEditor(card: HTMLElement, cardId: string, label: string, initialValue = '') {
		card.querySelector('.lifewiki-confirm-card-editor')?.remove();
		const actions = card.querySelector('.lifewiki-confirm-actions') as HTMLElement | null;
		const editor = card.createEl('div', {
			cls: 'lifewiki-confirm-card-editor'
		});
		if (actions) card.insertBefore(editor, actions);

		editor.createEl('div', {
			cls: 'lifewiki-confirm-card-supplement-label',
			text: label
		});
		const textarea = editor.createEl('textarea', {
			cls: 'lifewiki-confirm-card-textarea',
			attr: { rows: '3' }
		}) as HTMLTextAreaElement;
		textarea.value = initialValue;
		const save = editor.createEl('button', {
			cls: 'lifewiki-confirm-action primary',
			text: '保存补充',
			attr: { type: 'button' }
		});
		save.addEventListener('click', () => {
			const supplement = textarea.value.trim();
			this.markReviewCard(cardId, 'pending', supplement);
			this.renderBlockInsightCards(this.activeBlockId ? this.plugin.getSessionManager().getSession(this.activeBlockId, this.activeParentId) : null);
		});
		textarea.focus();
	}

	private mergeSupplement(base: string, supplement?: string): string {
		const trimmed = supplement?.trim();
		return trimmed ? `${base}\n补充：${trimmed}` : base;
	}

	private currentSessionContent(): string {
		if (!this.activeBlockId) return '';
		const session = this.plugin.getSessionManager().getSession(this.activeBlockId, this.activeParentId);
		return session?.content || '';
	}

	private prefillInput(text: string) {
		if (!this.inputTextarea) return;
		this.analysisTab = 'block';
		this.applyAnalysisTabVisibility();
		this.inputTextarea.value = text;
		this.inputTextarea.focus();
		this.autoResizeTextarea();
		this.updateSendBtnState();
	}

	private async archiveEntityPreview(entity: EntityPreview, supplement = '') {
		const entityManager = this.plugin.getEntityManager();
		if (!entityManager) return;

		const existing = entityManager.findEntity(entity.name);
		if (existing) {
			await this.recordEntityInteraction(entity.name, this.mergeSupplement(entity.context || `日记提到：${this.currentSessionContent()}`, supplement));
			return;
		}
		const summary = entity.context || '从日记中归档';
		const archiveContent = this.mergeSupplement(`归档：${summary || '从日记中发现'}`, supplement);

		try {
			await entityManager.createEntity({
				type: entity.type,
				title: entity.name,
				titleRaw: entity.name,
				aliases: [],
				tags: [],
				summary,
				confidence: entity.confidence || 0.8,
				verificationStatus: 'verified',
				createdAt: new Date().toISOString(),
				createdBy: 'ai',
				lastUpdated: new Date().toISOString(),
				relatedEntities: [],
				interactions: [{
					timestamp: new Date().toISOString(),
					type: 'ai_analysis',
					content: archiveContent,
					sourceBlockId: this.activeBlockId || undefined
				}],
				metadata: {
					status: 'active',
					source: 'diary',
					...(entity.type === 'person' ? { person_kind: this.inferPersonKind(entity) } : {})
				}
			});
		} catch (error) {
			const recovered = entityManager.findEntity(entity.name);
			if (!recovered) throw error;
			await this.recordEntityInteraction(entity.name, this.mergeSupplement(entity.context || `日记提到：${this.currentSessionContent()}`, supplement));
		}
	}

	private async recordEntityInteraction(entityName: string, content: string) {
		const entityManager = this.plugin.getEntityManager();
		const entity = entityManager?.findEntity(entityName);
		if (!entity) return;
		await entityManager.addInteraction(entity.id, {
			timestamp: new Date().toISOString(),
			type: 'diary_mention',
			content,
			sourceBlockId: this.activeBlockId || undefined
		});
	}

	private inferPersonKind(entity: EntityPreview): string {
		const text = `${entity.name} ${entity.context || ''}`;
		if (/公司|智能|科技|集团|有限|实验室|研究院|研究所|管委会|委员会|部门|团队|机构|中心|银行|移动|电信|联通|大学|学院|医院|政府|协会|基金|资本|投资|园区/i.test(text)) return '组织';
		return '个人';
	}

	// ===== Entity Index Tab =====

	private async renderEntityIndex() {
		if (!this.entityIndexEl || this.mode !== 'analysis') return;
		if (this.analysisTab !== 'index') {
			this.entityIndexEl.removeClass('visible');
			return;
		}

		this.entityIndexEl.empty();
		this.entityIndexEl.addClass('visible');

		const index = this.plugin.entityIndex;
		if (!index || index.entries.length === 0) {
			this.entityIndexEl.createEl('div', {
				cls: 'lifewiki-entity-index-empty',
				text: '还没有实体档案。分析日记后会逐步建立。'
			});
			return;
		}

		const byType = new Map<CardType, typeof index.entries>();
		for (const entry of index.entries) {
			const type = entry.cardType as CardType;
			if (!byType.has(type)) byType.set(type, []);
			byType.get(type)!.push(entry);
		}

		for (const [type, entries] of this.sortedTypeGroups(byType)) {
			const label = this.getEntityTypeLabel(type);
			this.renderEntityIndexSection(label, entries);
		}
	}

	private sortedTypeGroups(byType: Map<CardType, any[]>): Array<[CardType, any[]]> {
		const order: CardType[] = ['person', 'object', 'theme'];
		const result: Array<[CardType, any[]]> = [];
		for (const type of order) {
			const entries = byType.get(type);
			if (entries && entries.length > 0) {
				result.push([type, entries]);
			}
		}
		return result;
	}

	private renderEntityIndexSection(title: string, entries: any[]) {
		if (!this.entityIndexEl) return;

		const section = this.entityIndexEl.createEl('div', {
			cls: 'lifewiki-entity-index-section'
		});
		const header = section.createEl('div', {
			cls: 'lifewiki-entity-index-header'
		});
		header.createEl('span', { text: title });
		header.createEl('span', {
			cls: 'lifewiki-entity-index-count',
			text: String(entries.length)
		});

		const sorted = [...entries].sort((a, b) => {
			const bTime = new Date(b.lastUpdated).getTime();
			const aTime = new Date(a.lastUpdated).getTime();
			return bTime - aTime;
		}).slice(0, 20);

		for (const entry of sorted) {
			const item = section.createEl('div', {
				cls: 'lifewiki-entity-index-item'
			});
			item.createEl('div', {
				cls: 'lifewiki-entity-index-item-title',
				text: entry.name
			});

			const meta = item.createEl('div', {
				cls: 'lifewiki-entity-index-meta'
			});

			const chips: string[] = [];
			if (entry.maturity) chips.push(this.maturityLabel(entry.maturity as MaturityLevel));
			chips.push(`置信度 ${Math.round((entry.confidence || 0) * 100)}%`);
			if (entry.relationCount > 0) chips.push(`关联 ${entry.relationCount}`);
			if (entry.subtype) chips.push(entry.subtype);

			for (const chip of chips) {
				const isMaturity = chip.startsWith('L');
				meta.createEl('span', {
					cls: `lifewiki-entity-index-chip${isMaturity ? ' maturity' : ''}`,
					text: chip
				});
			}
		}
	}

	private async refreshEntityIndexAttention() {
		this.hasTodayInsightAttention = true;
		if (this.mode === 'analysis' && this.analysisTab === 'index') {
			this.renderAnalysisTabs();
		}
	}

	// ===== Chat =====

	private addChatMessage(role: 'user' | 'assistant', content: string): HTMLElement | null {
		if (!this.chatMessagesEl) return null;
		this.showChatState();

		const msgEl = this.chatMessagesEl.createEl('div', {
			cls: `lifewiki-chat-msg ${role}`
		});

		if (role === 'assistant') {
			msgEl.setAttr('title', '点击复制');
			msgEl.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(msgEl.innerText.replace(/已复制$/, '').trim() || content);
					const confirm = msgEl.createEl('span', {
						cls: 'lifewiki-chat-msg-copy-hint',
						text: '已复制'
					});
					setTimeout(() => confirm.remove(), 1500);
				} catch (e) {
					console.error('Failed to copy:', e);
				}
			});
		}

		this.renderMessageContent(msgEl, content);
		this.scrollToBottom();
		return msgEl;
	}

	private renderMessageContent(container: HTMLElement, content: string) {
		container.empty();
		const parts = content.split(/\*\*(.+?)\*\*/g);
		for (let i = 0; i < parts.length; i++) {
			if (i % 2 === 1) {
				container.createEl('strong', { text: parts[i] });
			} else {
				container.createEl('span', { text: parts[i] });
			}
		}
	}

	private async streamChatMessage(content: string): Promise<HTMLElement | null> {
		const cleanContent = this.stripThinking(content);
		const msgEl = this.addChatMessage('assistant', '');
		if (!msgEl) return null;

		let visible = '';
		const chunkSize = cleanContent.length > 220 ? 3 : 1;
		for (let i = 0; i < cleanContent.length; i += chunkSize) {
			visible += cleanContent.slice(i, i + chunkSize);
			this.renderMessageContent(msgEl, visible);
			this.scrollToBottom();
			await new Promise(resolve => setTimeout(resolve, 8));
		}

		this.renderMessageContent(msgEl, cleanContent);
		return msgEl;
	}

	private async sendMessage() {
		if (!this.inputTextarea || this.isLoading) return;

		const content = this.inputTextarea.value.trim();
		if (!content) return;

		if (this.mode === 'chat') {
			await this.sendChatMessage(content);
			return;
		}

		if (!this.activeBlockId) return;

		this.isLoading = true;
		this.inputTextarea.value = '';
		this.autoResizeTextarea();
		this.updateSendBtnState();

		this.addChatMessage('user', content);
		this.showThinkingIndicator();

		const sessionManager = this.plugin.getSessionManager();
		sessionManager.addMessage(this.activeBlockId, {
			role: 'user',
			content
		}, this.activeParentId);

		try {
			const result = await this.continueBlockConversation(content);

			this.hideThinkingIndicator();

			if (result.entityDiscovery && result.entityDiscovery.length > 0) {
				await this.showEntityConfirmationDialog(result.entityDiscovery);
			}

			if (result.archivedEntities && result.archivedEntities.length > 0) {
				await this.handleEntityArchiving(result.archivedEntities);
			}

			if (result.updateEntities && result.updateEntities.length > 0) {
				await this.handleEntityUpdate(result.updateEntities);
			}

			if (result.relations && result.relations.length > 0) {
				await this.handleRelations(result.relations);
			}

			if (result.areas && result.areas.length > 0 && this.activeBlockId && !this.activeParentId) {
				await this.updateBlockCategory(this.activeBlockId, result.areas[0]);
			}

			const responseText = result.aiResponse || result.response || '';
			if (responseText) {
				this.addChatMessage('assistant', responseText);
			} else if (result.error) {
				this.addChatMessage('assistant', `错误: ${result.error}`);
			}

			const aiContent = responseText || (result.error ? `错误: ${result.error}` : '');
			if (aiContent) {
				sessionManager.addMessage(this.activeBlockId, {
					role: 'assistant',
					content: aiContent
				}, this.activeParentId);
			}
			this.renderBlockInsightCards(sessionManager.getSession(this.activeBlockId, this.activeParentId));
		} catch (error) {
			console.error('AI chat error:', error);
			this.hideThinkingIndicator();
			this.addChatMessage('assistant', '抱歉，AI 响应失败: ' + (error as Error).message);
		}

		this.isLoading = false;
		this.updateSendBtnState();
	}

	private async continueBlockConversation(content: string): Promise<any> {
		if (!this.activeBlockId) {
			throw new Error('No active block');
		}

		const session = this.plugin.getSessionManager().getSession(this.activeBlockId, this.activeParentId);
		const blockContent = session?.content || this.currentSessionContent();

		const provider = this.plugin.getAIProvider();
		const messages = session?.messages || [];
		const response = await provider.chat([
			{
				role: 'system',
				content: '你是 TraceMind 的日记分析助手。围绕当前这条日记，用自然中文帮助用户补充实体背景、事实、关系和互动记录。一次只问一个关键问题，避免输出代码或 JSON。'
			},
			{
				role: 'user',
				content: `当前日记：${blockContent || '无'}`
			},
			...(messages.length > 0 ? messages.slice(-8) : [{ role: 'user' as const, content }])
		]);

		return {
			aiResponse: this.stripThinking(response.content)
		};
	}

	private stripThinking(content: string): string {
		return content
			.replace(/<[Tt]hinking>[\s\S]*?<\/[Tt]hinking>/gi, '')
			.replace(/<[Tt]hink>[\s\S]*?<\/[Tt]hink>/gi, '')
			.replace(/<think>[\s\S]*?<\/think>/gi, '')
			.replace(/<\/?[Tt]hink>/g, '')
			.replace(/<\/?[Tt]hinking>/g, '')
			.trim();
	}

	private async sendChatMessage(content: string) {
		if (!this.inputTextarea) return;
		this.isLoading = true;
		this.inputTextarea.value = '';
		this.autoResizeTextarea();
		this.updateSendBtnState();

		this.addChatMessage('user', content);
		this.showThinkingIndicator();

		const sessionManager = this.plugin.getSessionManager();
		sessionManager.addChatMessage({ role: 'user', content });

		try {
			const aiProvider = this.plugin.getAIProvider();
			const chatSession = sessionManager.getChatSession();
			const messages: ChatMessage[] = chatSession?.messages || [];
			const systemMessage: ChatMessage = {
				role: 'system',
				content: '你是一个友好的AI助手，可以和用户讨论各种话题，包括日记复盘、思考总结等。'
			};
			const response = await aiProvider.chat([systemMessage, ...messages]);

			this.hideThinkingIndicator();

			if (response.content) {
				const cleanContent = this.stripThinking(response.content);
				await this.streamChatMessage(cleanContent);
				sessionManager.addChatMessage({ role: 'assistant', content: cleanContent });
			}
		} catch (error) {
			console.error('AI chat error:', error);
			this.hideThinkingIndicator();
			this.addChatMessage('assistant', '抱歉，AI 响应失败: ' + (error as Error).message);
		}

		this.isLoading = false;
		this.updateSendBtnState();
	}

	private async handleEntityArchiving(entities: Array<{ name: string; type: 'person' | 'object' | 'theme'; smallType: string; context: string }>) {
		const entityManager = this.plugin.getEntityManager();
		if (!entityManager) return;

		for (const entity of entities) {
			try {
				const metadata: Record<string, any> = { status: 'active', source: 'diary' };
				if (entity.type === 'person') {
					metadata.person_kind = /公司|组织|机构|团队/.test(entity.smallType || entity.context) ? '组织' : '个人';
					if (/同事|朋友|客户|供应商|合作伙伴|合作方/.test(entity.smallType)) {
						metadata.relationship_to_user = entity.smallType;
					}
				} else if (entity.type === 'object') {
					metadata.subtype = entity.smallType || 'other';
					if (entity.context) {
						metadata.description = entity.context;
					}
				} else if (entity.type === 'theme') {
					metadata.subtype = entity.smallType || 'domain';
				}

				const summary = entity.context || `从日记中归档的${entity.type}`;

				await entityManager.createEntity({
					type: entity.type,
					title: entity.name,
					titleRaw: entity.name,
					aliases: [],
					tags: [],
					summary,
					confidence: 0.8,
					verificationStatus: 'verified',
					createdAt: new Date().toISOString(),
					createdBy: 'ai',
					lastUpdated: new Date().toISOString(),
					relatedEntities: [],
					interactions: [{
						timestamp: new Date().toISOString(),
						type: 'ai_analysis',
						content: `归档为${entity.smallType}：${entity.context || '无'}`,
						sourceBlockId: this.activeBlockId || undefined
					}],
					metadata
				});
			} catch (error) {
				console.error(`[AIAnalysisPanel] Failed to create entity ${entity.name}:`, error);
			}
		}
	}

	private async handleEntityUpdate(updates: Array<{ entityId: string; name: string; updates: Array<{ field: string; value: string }> }>) {
		const entityManager = this.plugin.getEntityManager();
		if (!entityManager) return;

		for (const update of updates) {
			try {
				const entity = entityManager.getEntity(update.entityId);
				if (!entity) continue;

				const updateData: Record<string, any> = { lastUpdated: new Date().toISOString() };
				const interactions = [...(entity.interactions ?? [])];

				for (const u of update.updates) {
					if (u.field.startsWith('metadata.')) {
						const key = u.field.replace('metadata.', '');
						updateData.metadata = { ...entity.metadata, [key]: u.value };
					} else if (u.field === 'interactions') {
						interactions.push({
							timestamp: new Date().toISOString(),
							type: 'ai_analysis',
							content: u.value,
							sourceBlockId: this.activeBlockId || undefined
						});
						updateData.interactions = interactions;
					} else if (u.field === 'summary') {
						updateData.summary = u.value;
					}
				}

				await entityManager.updateEntity(update.entityId, updateData);
			} catch (error) {
				console.error(`[AIAnalysisPanel] Failed to update entity ${update.name}:`, error);
			}
		}
	}

	private async handleRelations(relations: Array<{ from: string; to: string; relation: string; context?: string }>) {
		const entityManager = this.plugin.getEntityManager();
		if (!entityManager) return;

		for (const rel of relations) {
			try {
				const fromEntity = entityManager.findEntity(rel.from);
				const toEntity = entityManager.findEntity(rel.to);
				if (!fromEntity || !toEntity) continue;

				const existingRelations = fromEntity.relatedEntities || [];
				const newRelation = {
					entityId: toEntity.id,
					relation: rel.relation as 'mentioned_in' | 'part_of' | 'related_to' | 'update_of' | 'about',
					context: rel.context || `通过日记分析建立关系：${rel.from}是${rel.to}的${rel.relation}`
				};

				const alreadyRelated = existingRelations.some(
					r => r.entityId === toEntity.id && r.relation === newRelation.relation
				);

				if (!alreadyRelated) {
					await entityManager.updateEntity(fromEntity.id, {
						relatedEntities: [...existingRelations, newRelation],
						lastUpdated: new Date().toISOString()
					});
				}
			} catch (error) {
				console.error(`[AIAnalysisPanel] Failed to create relation:`, error);
			}
		}
	}

	private async updateBlockCategory(blockId: string, category: string): Promise<void> {
		try {
			const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOCK_EDITOR);
			if (leaves.length === 0) return;

			const blockEditorView = leaves[0].view as BlockEditorView;
			if (!blockEditorView) return;

			const block = blockEditorView.getBlockById(blockId) as ParsedBlock | undefined;
			if (!block) return;

			if ((block as ParsedBlock).category === '待分析' || (block as ParsedBlock).category !== category) {
				(block as ParsedBlock).category = category;
				await blockEditorView.saveBlockToFile(block as ParsedBlock);
				console.log(`[AIAnalysisPanel] Updated block ${blockId} category to ${category}`);
			}
		} catch (error) {
			console.error(`[AIAnalysisPanel] Failed to update block category:`, error);
		}
	}

	private async showEntityConfirmationDialog(entities: Array<{ name: string; inferredType: string; reason: string }>) {
		if (!this.chatMessagesEl) return;

		for (const entity of entities) {
			const entityEl = this.chatMessagesEl.createEl('div', {
				cls: 'lifewiki-entity-confirm'
			});

			entityEl.createEl('div', {
				cls: 'lifewiki-entity-confirm-title',
				text: `识别到新${this.getEntityTypeLabel(entity.inferredType)}: **${entity.name}**`
			});

			entityEl.createEl('div', {
				cls: 'lifewiki-entity-confirm-reason',
				text: entity.reason || '从日记中发现'
			});

			const buttonsEl = entityEl.createEl('div', {
				cls: 'lifewiki-entity-confirm-buttons'
			});

			const archiveBtn = buttonsEl.createEl('button', {
				cls: 'lifewiki-entity-confirm-btn archive',
				text: '归档',
				attr: { type: 'button' }
			});

			const skipBtn = buttonsEl.createEl('button', {
				cls: 'lifewiki-entity-confirm-btn skip',
				text: '跳过',
				attr: { type: 'button' }
			});

			archiveBtn.addEventListener('click', async () => {
				await this.archiveEntity(entity);
				entityEl.remove();
			});

			skipBtn.addEventListener('click', () => {
				entityEl.remove();
			});
		}
	}

	private getEntityTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			person: '人脉',
			object: '客体',
			theme: '主题'
		};
		return labels[type] || '实体';
	}

	private maturityLabel(level: MaturityLevel): string {
		return level; // L0, L1, L2, L3
	}

	private async archiveEntity(entity: { name: string; inferredType: string; reason: string }) {
		const entityManager = this.plugin.getEntityManager();
		if (!entityManager) return;

		const typeMap: Record<string, string> = {
			person: 'person',
			object: 'object',
			theme: 'theme'
		};

		const entityType = typeMap[entity.inferredType] || 'person';

		try {
			await entityManager.createEntity({
				type: entityType,
				title: entity.name,
				titleRaw: entity.name,
				aliases: [],
				tags: [],
				summary: entity.reason || '从日记中归档',
				confidence: 0.8,
				verificationStatus: 'verified',
				createdAt: new Date().toISOString(),
				createdBy: 'ai',
				lastUpdated: new Date().toISOString(),
				relatedEntities: [],
				interactions: [{
					timestamp: new Date().toISOString(),
					type: 'ai_analysis',
					content: `归档：${entity.reason || '从日记中发现'}`,
					sourceBlockId: this.activeBlockId || undefined
				}],
				metadata: {
					status: 'active',
					source: 'diary'
				}
			});
			this.addChatMessage('assistant', `已归档 **${entity.name}**`);
		} catch (error) {
			console.error('[AIAnalysisPanel] Failed to archive entity:', error);
			this.addChatMessage('assistant', `归档失败`);
		}
	}

	async onClose() {}
}
