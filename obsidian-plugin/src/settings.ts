import { App, Notice, Setting, SettingTab } from 'obsidian';
import type TraceMindPlugin from './main';
import { chat } from './ai/provider-config';
export { ProviderConfig, TraceMindSettings, DEFAULT_SETTINGS } from './settings-types';

export class TraceMindSettingTab extends SettingTab {
	plugin: TraceMindPlugin;
	id: string = 'tracemind';
	name: string = 'TraceMind';
	icon: string = 'brain';

	constructor(app: App, plugin: TraceMindPlugin) {
		// @ts-expect-error - obsidian.d.ts doesn't type the constructor, but runtime expects (app, plugin)
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'TraceMind 设置' });

		// ============================================================
		// Section 1: AI Provider 配置
		// ============================================================
		containerEl.createEl('h2', { text: 'AI Provider 配置' });

		let providerName = '';
		let providerModel = '';
		let providerBaseUrl = '';
		let providerApiKey = '';
		let providerEnableThinking = false;
		let providerReasoningEffort: '' | 'high' | 'max' = '';

		const formContainer = containerEl.createEl('div', {
			cls: 'lifewiki-provider-form'
		});

		new Setting(formContainer)
			.setName('名称')
			.setDesc('Provider 显示名称')
			.addText(text => {
				text.setPlaceholder('My GPT-4')
					.onChange(value => { providerName = value; });
			});

		new Setting(formContainer)
			.setName('模型')
			.setDesc('模型名称，如 gpt-4、qwen-plus')
			.addText(text => {
				text.setPlaceholder('gpt-4')
					.onChange(value => { providerModel = value; });
			});

		new Setting(formContainer)
			.setName('Base URL')
			.setDesc('OpenAI 兼容 API 地址，如 https://api.openai.com/v1、https://api.deepseek.com/v1')
			.addText(text => {
				text.setPlaceholder('https://api.openai.com/v1')
					.onChange(value => { providerBaseUrl = value; });
			});

		new Setting(formContainer)
			.setName('API Key')
			.setDesc('API 密钥')
			.addText(text => {
				text.setPlaceholder('')
					.onChange(value => { providerApiKey = value; });
				text.inputEl.type = 'password';
			});

		new Setting(formContainer)
			.setName('思考模式')
			.setDesc('默认关闭。开启后请求体会带上 {"thinking":{"type":"enabled"}}。')
			.addToggle(toggle => {
				toggle.setValue(providerEnableThinking)
					.onChange(value => { providerEnableThinking = value; });
			});

		new Setting(formContainer)
			.setName('Reasoning Effort')
			.setDesc('默认不发送。部分 OpenAI 兼容模型支持 high 或 max。')
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

		new Setting(formContainer)
			.addButton(btn => {
				btn.setButtonText('保存 Provider');
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
						model: providerModel,
						baseUrl: providerBaseUrl,
						apiKey: providerApiKey,
						enableThinking: providerEnableThinking,
						reasoningEffort: providerReasoningEffort,
					});
					if (!this.plugin.settings.defaultProviderId) {
						this.plugin.settings.defaultProviderId = id;
					}
					await this.plugin.saveSettings();
					this.display();
					new Notice('Provider 已保存');
				});
			});

		for (let i = 0; i < this.plugin.settings.providers.length; i++) {
			const provider = this.plugin.settings.providers[i];
			const isDefault = this.plugin.settings.defaultProviderId === provider.id;
			const providerSetting = new Setting(containerEl)
				.setName(`${provider.name}${isDefault ? ' (默认)' : ''}`)
				.setDesc(`${provider.baseUrl} / ${provider.model}${provider.enableThinking ? ' / thinking:on' : ''}${provider.reasoningEffort ? ` / reasoning:${provider.reasoningEffort}` : ''}`);

			providerSetting.addToggle(toggle => {
				toggle
					.setTooltip('设为默认')
					.setValue(isDefault)
					.onChange(async (value) => {
						if (value) {
							this.plugin.settings.defaultProviderId = provider.id;
						}
						await this.plugin.saveSettings();
						this.display();
					});
			});

			providerSetting.addToggle(toggle => {
				toggle
					.setTooltip('思考模式')
					.setValue(provider.enableThinking ?? false)
					.onChange(async (value) => {
						provider.enableThinking = value;
						await this.plugin.saveSettings();
					});
			});

			providerSetting.addDropdown(dropdown => {
				dropdown
					.addOption('', '默认')
					.addOption('high', 'high')
					.addOption('max', 'max')
					.setValue(provider.reasoningEffort || '')
					.onChange(async (value) => {
						provider.reasoningEffort = value as '' | 'high' | 'max';
						await this.plugin.saveSettings();
					});
			});

			providerSetting.addButton(btn => {
				btn.setButtonText('测试');
				btn.onClick(async () => {
					new Notice('正在测试...');
					try {
						const response = await chat([{ role: 'user', content: '你好' }], {
							provider: provider.baseUrl?.includes('anthropic.com') ? 'anthropic' : 'openai',
							apiKey: provider.apiKey,
							model: provider.model,
							baseUrl: provider.baseUrl,
						});
						new Notice('连接成功: ' + response.content.substring(0, 50));
					} catch (e) {
						new Notice('连接失败: ' + (e as Error).message);
					}
				});
			});

			providerSetting.addButton(btn => {
				btn.setButtonText('删除');
				btn.onClick(async () => {
					this.plugin.settings.providers.splice(i, 1);
					if (this.plugin.settings.defaultProviderId === provider.id) {
						this.plugin.settings.defaultProviderId = this.plugin.settings.providers[0]?.id || '';
					}
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}

		if (this.plugin.settings.providers.length === 0) {
			containerEl.createEl('p', {
				text: '暂无 Provider，请添加一个',
				cls: 'lifewiki-no-providers'
			});
		}
	}
}
