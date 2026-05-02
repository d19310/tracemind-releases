import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IndexEntry,
  EntityIndex,
  parseIndex,
  serializeIndex,
  upsertEntry,
  searchByName,
} from '../../src/storage/entity-index';

describe('Entity Index - Parse from Markdown Card', () => {
  it('parses entity info from card frontmatter', () => {
    const markdown = `---
id: abc12345
name: 张三
type: person
maturity: L1
confidence: 0.8
aliases: [老张, 张哥]
status: needs_confirmation
---

# 张三

## 基本信息
- 公司：某科技公司
- 职位：技术总监

## 关联实体
_暂无关联实体_

## 关键事实
_暂无记录_
`;

    const entry = parseCardToIndexEntry('Person/张三.md', markdown);

    assert.equal(entry.id, 'abc12345');
    assert.equal(entry.name, '张三');
    assert.equal(entry.cardType, 'person');
    assert.equal(entry.maturity, 'L1');
    assert.equal(entry.confidence, 0.8);
    assert.deepEqual(entry.aliases, ['老张', '张哥']);
  });

  it('parses object entity', () => {
    const markdown = `---
id: def45678
name: Q2营销计划
type: object
maturity: L0
confidence: 0.6
aliases: []
---

# Q2营销计划

## 基本信息
- 类型：project

## 关联实体
_暂无关联实体_

## 关键事实
_暂无记录_
`;

    const entry = parseCardToIndexEntry('Object/Q2营销计划.md', markdown);

    assert.equal(entry.cardType, 'object');
    assert.equal(entry.name, 'Q2营销计划');
  });
});

/**
 * Helper to parse card markdown to index entry
 * Uses the same parseCardMarkdown from storage/markdown-card
 */
function parseCardToIndexEntry(filePath: string, markdown: string): IndexEntry {
  const { parseCardMarkdown } = require('../../src/storage/markdown-card');
  const card = parseCardMarkdown(markdown);

  return {
    id: card.id,
    name: card.name,
    cardType: card.cardType,
    maturity: card.maturity,
    confidence: card.confidence,
    filePath,
    aliases: card.aliases,
    relationCount: card.relatedPeople.length + card.relatedObjects.length + card.relatedThemes.length,
    lastUpdated: card.lastUpdated,
  };
}
