import { App, Notice, Setting, PluginSettingTab } from 'obsidian';
import type TraceMindPlugin from './main';
import type { ProviderType } from './settings-types';
import { chat } from './ai/provider-config';
import { formatProviderTestError } from './ai/provider-error-message';
import { updateProviderById, deleteProviderById } from './settings-provider-utils';
import type { ProviderConfig } from './settings-types';

export class TraceMindSettingTab extends PluginSettingTab {
	plugin: TraceMindPlugin;

	constructor(app: App, plugin: TraceMindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'TraceMind 设置' });

		// ============================================================
		// AI Provider 管理
		// ============================================================
		containerEl.createEl('h3', { text: 'AI Provider' });

		let providerName = '';
		let providerModel = '';
		let providerBaseUrl = '';
		let providerApiKey = '';
		let providerEnableThinking = false;
		let providerReasoningEffort: '' | 'high' | 'max' = '';
	let providerType: ProviderType = 'openai';

		new Setting(containerEl)
			.setName('Provider 类型')
			.setDesc('选择 API 格式')
			.addDropdown(dropdown => {
				dropdown
					.addOption('openai', 'OpenAI-compatible')
					.addOption('anthropic', 'Anthropic')
					.addOption('ollama', 'Ollama')
					.addOption('custom', 'Custom')
					.setValue('openai')
					.onChange(value => { providerType = value as ProviderType; });
			});

		new Setting(containerEl)
			.setName('名称')
			.setDesc('Provider 显示名称')
			.addText(text => {
				text.setPlaceholder('My GPT-4')
					.onChange(value => { providerName = value; });
			});

		new Setting(containerEl)
			.setName('模型')
			.setDesc('模型名称，如 gpt-4、qwen-plus')
			.addText(text => {
				text.setPlaceholder('gpt-4')
					.onChange(value => { providerModel = value; });
			});

		new Setting(containerEl)
			.setName('Base URL')
			.setDesc('OpenAI 兼容 API 地址')
			.addText(text => {
				text.setPlaceholder('https://api.openai.com/v1')
					.onChange(value => { providerBaseUrl = value; });
			});

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('API 密钥')
			.addText(text => {
				text.setPlaceholder('')
					.onChange(value => { providerApiKey = value; });
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('思考模式')
			.setDesc('开启后会按当前 Provider 类型附加思考/推理参数；仅部分模型支持')
			.addToggle(toggle => {
				toggle.setValue(providerEnableThinking)
					.onChange(value => { providerEnableThinking = value; });
			});

		new Setting(containerEl)
			.setName('Reasoning Effort')
			.setDesc('部分模型支持 high 或 max')
			.addDropdown(dropdown => {
				dropdown
					.addOption('', '默认')
					.addOption('high', 'high')
					.addOption('max', 'max')
					.setValue(providerReasoningEffort)
					.onChange(value => {
						providerReasoningEffort = value as '' | 'high' | 'max';
					});
			});

		new Setting(containerEl)
			.addButton(btn => {
				btn.setButtonText('添加 Provider');
				btn.setCta();
				btn.onClick(async () => {
					if (!providerName || !providerModel || !providerBaseUrl) {
						new Notice('请填写名称、模型和 Base URL');
						return;
					}
					const id = `provider-${Date.now()}`;
					this.plugin.settings.providers.push({
						id,
						name: providerName,
						providerType,
						model: providerModel,
						baseUrl: providerBaseUrl,
						apiKey: providerApiKey,
						enableThinking: providerEnableThinking,
						reasoningEffort: providerReasoningEffort,
					});
					await this.plugin.saveSettings();
					this.display();
					new Notice('Provider 已添加');
				});
			});

		for (let i = 0; i < this.plugin.settings.providers.length; i++) {
			const provider = this.plugin.settings.providers[i];
			const isDefault = this.plugin.settings.defaultProviderId === provider.id;
			this.renderProviderRow(containerEl, provider, isDefault);
		}

		if (this.plugin.settings.providers.length === 0) {
			containerEl.createEl('p', {
				text: '暂无 Provider，请添加一个',
				cls: 'lifewiki-no-providers'
			});
		}

		// ============================================================
		// Agent 配置
		// ============================================================
		containerEl.createEl('h3', { text: 'Agent 配置' });

		const mapping = this.plugin.settings.agentProviderMapping;
		const providerOptions: Record<string, string> = {};
		for (const p of this.plugin.settings.providers) {
			providerOptions[p.id] = p.name;
		}

		new Setting(containerEl)
			.setName('AI 分析')
			.setDesc('日记分析使用的 AI Provider')
			.addDropdown(dropdown => {
				dropdown.addOption('', '使用默认 Provider');
				for (const [id, name] of Object.entries(providerOptions)) {
					dropdown.addOption(id, name);
				}
				dropdown.setValue(mapping.analysis)
					.onChange(async (value) => {
						this.plugin.settings.agentProviderMapping.analysis = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('AI 聊天')
			.setDesc('聊天使用的 AI Provider')
			.addDropdown(dropdown => {
				dropdown.addOption('', '使用默认 Provider');
				for (const [id, name] of Object.entries(providerOptions)) {
					dropdown.addOption(id, name);
				}
				dropdown.setValue(mapping.chat)
					.onChange(async (value) => {
						this.plugin.settings.agentProviderMapping.chat = value;
						await this.plugin.saveSettings();
					});
			});

		// ============================================================
		// 本地 Agent
		// ============================================================
		containerEl.createEl('h3', { text: '本地 Agent' });
		containerEl.createEl('p', {
			text: '启用后，在聊天模式的输入框左侧可选择本地安装的 AI agent CLI（Claude Code、Hermes 等）。',
			cls: 'setting-item-description'
		});

		const statusEl = containerEl.createEl('div', { cls: 'tracemind-agent-status' });

		new Setting(containerEl)
			.setName('启用本地 Agent')
			.setDesc('开启后系统将检测本机安装的 agent CLI，并在聊天输入框左侧提供选择器')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.localAgentEnabled)
					.onChange(async (value) => {
						this.plugin.settings.localAgentEnabled = value;
						await this.plugin.saveSettings();
						if (value) {
							this.detectAndShowAgents(statusEl);
						} else {
							statusEl.empty();
						}
					});
			});

		if (this.plugin.settings.localAgentEnabled) {
			this.detectAndShowAgents(statusEl);
		}

		// CSS
		const agentStyle = document.createElement('style');
		agentStyle.textContent = `
			.tracemind-agent-status { margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 6px; }
			.tracemind-agent-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
			.tracemind-agent-dot { font-size: 12px; }
			.tracemind-agent-label { color: var(--text-muted); }
			.tracemind-agent-dot.available + .tracemind-agent-label { color: var(--text-normal); }
		`;
		containerEl.appendChild(agentStyle);
	}

	private editingProviderId: string | null = null;
	private editDraft: ProviderConfig | null = null;

	private renderProviderRow(containerEl: HTMLElement, provider: ProviderConfig, isDefault: boolean) {
		const isEditing = this.editingProviderId === provider.id;
		const draft = isEditing ? this.editDraft! : provider;

		const providerSetting = new Setting(containerEl)
			.setName(`${draft.name}${isDefault ? ' (默认)' : ''}`)
			.setDesc(`[${draft.providerType || 'openai'}] ${draft.baseUrl} / ${draft.model}${draft.enableThinking ? ' / thinking:on' : ''}${draft.reasoningEffort ? ` / reasoning:${draft.reasoningEffort}` : ''}`);

		providerSetting.addToggle(toggle => {
			toggle.setTooltip('设为默认').setValue(isDefault)
				.onChange(async (value) => {
					if (value) { this.plugin.settings.defaultProviderId = provider.id; }
					await this.plugin.saveSettings(); this.display();
				});
		});

		if (isEditing) {
			new Setting(containerEl).setName('名称').addText(t => t.setValue(draft.name).onChange(v => { this.editDraft!.name = v; }));
			new Setting(containerEl).setName('Provider 类型').addDropdown(d => {
				d.addOption('openai', 'OpenAI-compatible').addOption('anthropic', 'Anthropic').addOption('ollama', 'Ollama').addOption('custom', 'Custom')
					.setValue(draft.providerType).onChange(v => { this.editDraft!.providerType = v as ProviderType; });
			});
			new Setting(containerEl).setName('模型').addText(t => t.setValue(draft.model).onChange(v => { this.editDraft!.model = v; }));
			new Setting(containerEl).setName('Base URL').addText(t => t.setValue(draft.baseUrl).onChange(v => { this.editDraft!.baseUrl = v; }));
			new Setting(containerEl).setName('API Key').addText(t => { t.setValue(draft.apiKey).onChange(v => { this.editDraft!.apiKey = v; }); t.inputEl.type = 'password'; });
			new Setting(containerEl).setName('思考模式').addToggle(t => t.setValue(draft.enableThinking ?? false).onChange(v => { this.editDraft!.enableThinking = v; }));
			new Setting(containerEl).setName('Reasoning Effort').addDropdown(d => {
				d.addOption('', '默认').addOption('high', 'high').addOption('max', 'max')
					.setValue(draft.reasoningEffort || '').onChange(v => { this.editDraft!.reasoningEffort = v as '' | 'high' | 'max'; });
			});

			const btnRow = new Setting(containerEl);
			btnRow.addButton(btn => {
				btn.setButtonText('保存').setCta().onClick(async () => {
					const d = this.editDraft!;
					if (!d.name.trim() || !d.model.trim() || !d.baseUrl.trim()) {
						new Notice('名称、模型和 Base URL 不能为空');
						return;
					}
					this.plugin.settings = updateProviderById(this.plugin.settings, provider.id, d);
					await this.plugin.saveSettings();
					this.editingProviderId = null; this.editDraft = null;
					this.display();
					new Notice('Provider 已更新');
				});
			});
			btnRow.addButton(btn => {
				btn.setButtonText('取消').onClick(() => {
					this.editingProviderId = null; this.editDraft = null;
					this.display();
				});
			});
		} else {
			providerSetting.addButton(btn => {
				btn.setButtonText('编辑').onClick(() => {
					this.editingProviderId = provider.id;
					this.editDraft = { ...provider };
					this.display();
				});
			});
			providerSetting.addButton(btn => {
				btn.setButtonText('测试').onClick(async () => {
					new Notice('正在测试...');
					try {
						const response = await chat([{ role: 'user', content: '你好' }], {
							provider: provider.providerType || 'openai',
							apiKey: provider.apiKey,
							model: provider.model,
							baseUrl: provider.baseUrl,
							enableThinking: provider.enableThinking,
							reasoningEffort: provider.reasoningEffort,
						});
						new Notice('连接成功: ' + response.content.substring(0, 50));
					} catch (e) { new Notice(formatProviderTestError(e)); }
				});
			});
			providerSetting.addButton(btn => {
				btn.setButtonText('删除').onClick(async () => {
					this.plugin.settings = deleteProviderById(this.plugin.settings, provider.id);
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}

	private async detectAndShowAgents(containerEl: HTMLElement) {
		containerEl.empty();
		const { resolveExecutable } = await import('./agent/provider');
		const agents = [
			{ key: 'claude-code', name: 'Claude Code', binary: 'claude' },
			{ key: 'hermes', name: 'Hermes', binary: 'hermes' },
		];

		for (const agent of agents) {
			const row = containerEl.createEl('div', { cls: 'tracemind-agent-row' });
			const path = await resolveExecutable(agent.binary);
			const available = !!path;
			const dot = row.createEl('span', { cls: `tracemind-agent-dot ${available ? 'available' : 'unavailable'}` });
			dot.setText(available ? '🟢' : '🔴');
			row.createEl('span', {
				text: `${agent.name} ${available ? '— 已检测到' : '— 未检测到，请确认已安装'}`,
				cls: 'tracemind-agent-label'
			});
		}
	}
}

export { chat } from './ai/provider-config';
