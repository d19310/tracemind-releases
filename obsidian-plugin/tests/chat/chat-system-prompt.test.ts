/**
 * Tests for ChatSystemPrompt builder
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface IndexEntry {
  id: string;
  name: string;
  cardType: 'person' | 'object' | 'theme';
  type?: string;
  subtype?: string;
  maturity: string;
  confidence: number;
  filePath: string;
  aliases: string[];
  relationCount: number;
  lastUpdated: string;
}

/**
 * Build the chat system prompt with vault context.
 */
function buildChatSystemPrompt(
  entityEntries: IndexEntry[],
  profileContext?: string,
): string {
  const parts = [
    '你是 TraceMind 的 Vault 管家助手，可以帮助用户管理整个 Obsidian Vault 中的知识。',

    '',
    '你的能力：',
    '- 搜索和查询 Person、Object、Theme 目录下的实体档案（Context Card）',
    '- 查看实体的属性（公司、职位、关系、状态、截止日期等）和互动记录',
    '- 分析实体之间的关系和共现模式',
    '- 总结、分析日记（Daily/ 目录下的 .md 文件）',
    '- 撰写周报、月报（基于日记内容和实体互动记录）',
    '- 创建和修改 Person、Object、Theme 档案',

    '',
    'Vault 结构：',
    '- Person/{name}.md — 人物档案（属性：company, role, relationship_to_user, aliases）',
    '- Object/{name}.md — 客体档案（属性：subtype: project/task/product/technology/document/location/other, status, deadline）',
    '- Theme/{name}.md — 主题档案（属性：subtype: domain/habit/state/pending_decision）',
    '- Daily/YYYY-MM-DD.md — 每日日记',
  ];

  // Entity index summary
  if (entityEntries.length > 0) {
    const persons = entityEntries.filter(e => e.cardType === 'person' || e.type === 'person');
    const objects = entityEntries.filter(e => e.cardType === 'object' || e.type === 'object' || e.type === 'project');
    const themes = entityEntries.filter(e => e.cardType === 'theme' || e.type === 'theme');

    parts.push('');
    parts.push('当前 Vault 中有 ' + persons.length + ' 个人物、' + objects.length + ' 个客体、' + themes.length + ' 个主题。');
    if (persons.length > 0) {
      parts.push('人物：' + persons.map(e => e.name).join('、'));
    }
    if (objects.length > 0) {
      parts.push('客体：' + objects.map(e => e.name).join('、'));
    }
    if (themes.length > 0) {
      parts.push('主题：' + themes.map(e => e.name).join('、'));
    }
  }

  // PROFILE
  if (profileContext) {
    parts.push('');
    parts.push(profileContext);
  }

  return parts.join('\n');
}

describe('ChatSystemPrompt', () => {
  describe('buildChatSystemPrompt', () => {
    it('generates basic prompt with empty index', () => {
      const result = buildChatSystemPrompt([], '');
      assert.ok(result.includes('TraceMind 的 Vault 管家助手'));
      assert.ok(result.includes('Person/{name}.md'));
      assert.ok(result.includes('Object/{name}.md'));
      assert.ok(result.includes('Theme/{name}.md'));
      assert.ok(result.includes('Daily/YYYY-MM-DD.md'));
    });

    it('includes entity list when index has entries', () => {
      const entries: IndexEntry[] = [
        { id: '1', name: '卢晏', cardType: 'person', maturity: 'L0', confidence: 0.5, filePath: 'Person/卢晏.md', aliases: [], relationCount: 0, lastUpdated: '' },
        { id: '2', name: '临港实验室算力租赁项目', cardType: 'object', maturity: 'L1', confidence: 0.5, filePath: 'Object/临港实验室算力租赁项目.md', aliases: [], relationCount: 0, lastUpdated: '' },
        { id: '3', name: 'H200供货紧张', cardType: 'theme', maturity: 'L0', confidence: 0.5, filePath: 'Theme/H200供货紧张.md', aliases: [], relationCount: 0, lastUpdated: '' },
      ];

      const result = buildChatSystemPrompt(entries, '');
      assert.ok(result.includes('1 个人物'));
      assert.ok(result.includes('1 个客体'));
      assert.ok(result.includes('1 个主题'));
      assert.ok(result.includes('卢晏'));
      assert.ok(result.includes('临港实验室算力租赁项目'));
      assert.ok(result.includes('H200供货紧张'));
    });

    it('includes PROFILE context when provided', () => {
      const profile = '用户档案：\n- 姓名：董升\n- 公司/组织：临港算力';
      const result = buildChatSystemPrompt([], profile);
      assert.ok(result.includes('用户档案'));
      assert.ok(result.includes('董升'));
      assert.ok(result.includes('临港算力'));
    });

    it('uses cardType for type classification', () => {
      const entries: IndexEntry[] = [
        { id: '1', name: '张三', cardType: 'person', maturity: 'L0', confidence: 0.5, filePath: 'Person/张三.md', aliases: [], relationCount: 0, lastUpdated: '' },
      ];

      const result = buildChatSystemPrompt(entries, '');
      assert.ok(result.includes('人物：张三'));
    });

    it('falls back to entry.type when cardType not set', () => {
      const entries: IndexEntry[] = [
        {
          id: '1', name: '临港实验室', cardType: 'object' as const,
          type: 'project', maturity: 'L1', confidence: 0.5,
          filePath: 'Object/临港实验室.md', aliases: [], relationCount: 0, lastUpdated: '',
        },
      ];

      const result = buildChatSystemPrompt(entries, '');
      assert.ok(result.includes('客体：临港实验室'));
    });

    it('handles no entities gracefully', () => {
      const result = buildChatSystemPrompt([], undefined);
      assert.ok(!result.includes('当前 Vault 中有'));
    });
  });
});
