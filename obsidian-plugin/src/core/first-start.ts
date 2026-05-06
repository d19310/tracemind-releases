/**
 * First-Start Wizard
 * Guides new users through initial setup:
 * 1. Create required vault directories
 * 2. Create TraceMind/PROFILE.md
 * 3. Validate structure before allowing completion
 *
 * Shown once on first plugin load.
 * Skipped if PROFILE.md already exists.
 */

import { App, Modal, Notice, Setting } from 'obsidian';
import { ensureFolder } from '../vault/vault';
import { getMissingFirstStartItems, REQUIRED_DIRS, PROFILE_PATH } from './first-start-constants';

export { REQUIRED_DIRS, PROFILE_PATH, isFirstStart, VaultAdapter } from './first-start-constants';

export function showFirstStartWizard(app: App, onComplete: () => Promise<void>): void {
  const modal = new FirstStartModal(app, onComplete);
  modal.open();
}

const PROFILE_TEMPLATE = `---
name: ""
occupation: ""
company: ""
city: ""
skills: []
roles: []
relationships: []
goals: []
focusAreas: []
---

# 用户档案

## 基本信息
- 姓名：
- 公司/组织：
- 职位/职业：
- 城市：

## 技能与专业
- _暂无_

## 角色与关系
- _暂无_

## 目标与计划
- _暂无_

## 关注领域
- _暂无_
`;

class FirstStartModal extends Modal {
  private onComplete: () => Promise<void>;
  private dirsCreated = false;
  private profileCreated = false;
  private statusEl: HTMLElement | null = null;

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

    // Status line for validation results
    this.statusEl = contentEl.createEl('div', {
      cls: 'tracemind-first-start-status',
      attr: { style: 'color: #e74c3c; min-height: 1.5em; margin: 8px 0;' },
    });

    // Step: Initialize directories and profile
    contentEl.createEl('h3', { text: '初始化 Vault 结构' });
    new Setting(contentEl)
      .setName('创建知识目录和用户档案')
      .setDesc('创建 Daily、Person、Object、Theme、TraceMind 等目录，以及用户档案文件。')
      .addButton(btn => {
        btn.setButtonText('初始化');
        btn.onClick(async () => {
          await this.initializeAll();
          btn.setButtonText('已完成');
          btn.setDisabled(true);
          this.clearStatus();
          new Notice('Vault 结构初始化完成');
        });
      });

    // Step: Complete
    contentEl.createEl('h3', { text: '完成设置' });
    new Setting(contentEl)
      .setName('确认完成')
      .setDesc('所有目录和档案创建完成后，点击完成开始使用 TraceMind')
      .addButton(btn => {
        btn.setButtonText('完成');
        btn.setCta();
        btn.onClick(async () => {
          const missing = this.validateStructure();
          if (missing.length > 0) {
            this.showStatus('以下项目缺失，请先点击"初始化"：\n' + missing.map(m => `  - ${m}`).join('\n'));
            return;
          }
          this.close();
          await this.onComplete();
        });
      });
  }

  /**
   * Create all required directories and PROFILE.md.
   * Idempotent — skips items that already exist.
   */
  private async initializeAll(): Promise<void> {
    for (const dir of REQUIRED_DIRS) {
      await ensureFolder(this.app, dir);
    }
    this.dirsCreated = true;

    // Create PROFILE.md only if it doesn't exist
    const existing = this.app.vault.getAbstractFileByPath(PROFILE_PATH);
    if (!existing) {
      await this.app.vault.create(PROFILE_PATH, PROFILE_TEMPLATE);
      this.profileCreated = true;
    } else {
      // Already exists — consider it created (idempotent)
      this.profileCreated = true;
    }
  }

  /**
   * Validate that all required directories and PROFILE.md exist.
   * Delegates to the pure getMissingFirstStartItems function.
   */
  private validateStructure(): string[] {
    return getMissingFirstStartItems({
      exists: (path: string) => this.app.vault.getAbstractFileByPath(path) !== null,
    });
  }

  private showStatus(msg: string): void {
    if (this.statusEl) {
      this.statusEl.style.whiteSpace = 'pre-line';
      this.statusEl.setText(msg);
    }
  }

  private clearStatus(): void {
    if (this.statusEl) {
      this.statusEl.setText('');
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
