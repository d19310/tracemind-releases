/**
 * TraceMind Settings Tab UI
 */

import { App, Notice, Setting, PluginSettingTab } from 'obsidian';
import type TraceMindPlugin from './main';
import { ProviderConfig, TraceMindSettings } from './settings';

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

    // AI Provider 配置
    containerEl.createEl('h3', { text: 'AI Provider 配置' });

    let providerName = '';
    let providerModel = '';
    let providerBaseUrl = '';
    let providerApiKey = '';

    new Setting(containerEl)
      .setName('名称')
      .setDesc('Provider 显示名称（如 OpenAI、Claude、本地 Ollama）')
      .addText(text => text.setPlaceholder('My GPT-4').onChange(v => { providerName = v; }));

    new Setting(containerEl)
      .setName('模型')
      .setDesc('模型名称，如 gpt-4、claude-sonnet-4-6')
      .addText(text => text.setPlaceholder('gpt-4').onChange(v => { providerModel = v; }));

    new Setting(containerEl)
      .setName('Base URL')
      .setDesc('OpenAI 兼容API 地址。留空则使用默认端点')
      .addText(text => text.setPlaceholder('https://api.openai.com/v1').onChange(v => { providerBaseUrl = v; }));

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('API 密钥')
      .addText(text => {
        text.setPlaceholder('').onChange(v => { providerApiKey = v; });
        text.inputEl.type = 'password';
      });

    new Setting(containerEl)
      .addButton(btn => {
        btn.setButtonText('添加 Provider');
        btn.setCta();
        btn.onClick(async () => {
          if (!providerName || !providerModel) {
            new Notice('请填写名称和模型');
            return;
          }
          const id = `provider-${Date.now()}`;
          this.plugin.settings.providers.push({
            id,
            name: providerName,
            model: providerModel,
            baseUrl: providerBaseUrl,
            apiKey: providerApiKey,
          });
          if (this.plugin.settings.providers.length === 1) {
            this.plugin.settings.defaultProviderId = id;
          }
          await this.plugin.saveSettings();
          this.display();
          new Notice('Provider 已添加');
        });
      });

    // Provider list
    for (let i = 0; i < this.plugin.settings.providers.length; i++) {
      const provider = this.plugin.settings.providers[i];
      const isDefault = this.plugin.settings.defaultProviderId === provider.id;
      const setting = new Setting(containerEl)
        .setName(`${provider.name}${isDefault ? ' (默认)' : ''}`)
        .setDesc(`${provider.model}${provider.baseUrl ? ` - ${provider.baseUrl}` : ''}`);

      if (!isDefault) {
        setting.addButton(btn => {
          btn.setButtonText('设为默认');
          btn.onClick(async () => {
            this.plugin.settings.defaultProviderId = provider.id;
            await this.plugin.saveSettings();
            this.display();
          });
        });
      }

      setting.addButton(btn => {
        btn.setButtonText('删除');
        btn.onClick(async () => {
          this.plugin.settings.providers.splice(i, 1);
          if (this.plugin.settings.defaultProviderId === provider.id) {
            this.plugin.settings.defaultProviderId = this.plugin.settings.providers[0]?.id || '';
          }
          await this.plugin.saveSettings();
          this.display();
          new Notice('Provider 已删除');
        });
      });
    }

    if (this.plugin.settings.providers.length === 0) {
      containerEl.createEl('p', { text: '暂无 Provider，请添加一个' });
    }
  }
}
