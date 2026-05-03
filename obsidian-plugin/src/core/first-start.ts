/**
 * First-Start Wizard
 * Guides new users through initial setup:
 * 1. Create required vault directories
 * 2. Configure AI provider (optional)
 * 3. Verify vault structure
 *
 * Shown once on first plugin load.
 * Skipped if PROFILE.md already exists.
 */

import { App, Modal, Notice, Setting } from 'obsidian';
import { ensureFolder } from '../vault/vault';
import { REQUIRED_DIRS } from './first-start-constants';

export { REQUIRED_DIRS, PROFILE_PATH, isFirstStart, VaultAdapter } from './first-start-constants';

/**
 * Show the first-start wizard modal.
 */
export function showFirstStartWizard(app: App, onComplete: () => Promise<void>): void {
  const modal = new FirstStartModal(app, onComplete);
  modal.open();
}

class FirstStartModal extends Modal {
  private onComplete: () => Promise<void>;

  constructor(app: App, onComplete: () => Promise<void>) {
    super(app);
    this.onComplete = onComplete;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: '欢迎使用 TraceMind' });
    contentEl.createEl('p', {
      text: 'TraceMind 将帮助你从日记中自动识别和整理知识实体。请先完成初始设置。',
    });

    const stepsEl = contentEl.createEl('div', { cls: 'tracemind-steps' });

    // Step 1: Create directories
    contentEl.createEl('h3', { text: '步骤 1：创建目录结构' });
    new Setting(contentEl)
      .setName('创建知识目录')
      .setDesc('创建 Daily、Person、Object、Theme 目录')
      .addButton(btn => {
        btn.setButtonText('创建目录');
        btn.onClick(async () => {
          for (const dir of REQUIRED_DIRS) {
            await ensureFolder(this.app, dir);
          }
          btn.setButtonText('已完成');
          btn.setDisabled(true);
          new Notice('目录创建完成');
        });
      });

    // Step 2: Create PROFILE.md
    contentEl.createEl('h3', { text: '步骤 2：创建用户档案' });
    new Setting(contentEl)
      .setName('初始化 PROFILE.md')
      .setDesc('在 Daily 目录下创建用户档案文件')
      .addButton(btn => {
        btn.setButtonText('创建档案');
        btn.onClick(async () => {
          const profileContent = `---
name: ""
created: ${new Date().toISOString()}
version: "1.0"
---

# 用户档案

## 基本信息
- 姓名：
- 公司：
- 职位：

## 常用联系人
<!-- 在此列出你经常互动的人 -->

## 正在进行的项目
<!-- 在此列出你当前的项目 -->
`;
          await this.app.vault.create('Daily/PROFILE.md', profileContent);
          btn.setButtonText('已完成');
          btn.setDisabled(true);
          new Notice('档案创建完成');
        });
      });

    // Step 3: Done
    contentEl.createEl('h3', { text: '步骤 3：开始使用' });
    new Setting(contentEl)
      .setName('完成设置')
      .setDesc('设置完成后，你可以开始使用 TraceMind 了')
      .addButton(btn => {
        btn.setButtonText('完成');
        btn.setCta();
        btn.onClick(async () => {
          this.close();
          await this.onComplete();
        });
      });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
