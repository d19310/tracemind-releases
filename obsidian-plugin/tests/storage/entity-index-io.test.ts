import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cardToIndexEntry, buildIndexFromFiles } from '../../src/storage/entity-index-io';
import { IndexEntry } from '../../src/storage/entity-index';

const SAMPLE_PERSON_CARD = `---
id: abc12345
name: 张三
type: person
maturity: L1
confidence: 0.8
status: needs_confirmation
aliases: [老张, 小张]
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
company: 某公司
role: 工程师
relationship_to_user: 同事
---

# 张三

## 基本信息
- 公司：某公司
- 职位：工程师
- 关系：同事

## 关联实体
_暂无关联实体_

## 关键事实
_暂无记录_
`;

const SAMPLE_OBJECT_CARD = `---
id: def12345
name: Q2营销计划
type: object
maturity: L0
confidence: 0.6
status: needs_confirmation
aliases: []
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
subtype: project
---

# Q2营销计划

## 基本信息
- 类型：project

## 关联实体
_暂无关联实体_

## 关键事实
_暂无记录_
`;

describe('Entity Index I/O - cardToIndexEntry', () => {
  it('extracts IndexEntry from Person card markdown', () => {
    const entry = cardToIndexEntry(SAMPLE_PERSON_CARD, 'Person/张三.md');
    assert.equal(entry.id, 'abc12345');
    assert.equal(entry.name, '张三');
    assert.equal(entry.cardType, 'person');
    assert.equal(entry.maturity, 'L1');
    assert.equal(entry.confidence, 0.8);
    assert.equal(entry.filePath, 'Person/张三.md');
    assert.deepEqual(entry.aliases, ['老张', '小张']);
    assert.equal(entry.relationCount, 0);
  });

  it('extracts IndexEntry from Object card with subtype', () => {
    const entry = cardToIndexEntry(SAMPLE_OBJECT_CARD, 'Object/Q2营销计划.md');
    assert.equal(entry.name, 'Q2营销计划');
    assert.equal(entry.cardType, 'object');
    assert.equal(entry.subtype, 'project');
    assert.equal(entry.maturity, 'L0');
  });

  it('handles card without frontmatter gracefully', () => {
    const entry = cardToIndexEntry('# No Frontmatter', 'Person/Unknown.md');
    assert.equal(entry.name, 'Unknown'); // fallback to filename
    assert.equal(entry.filePath, 'Person/Unknown.md');
  });
});

describe('Entity Index I/O - legacy status + metadata', () => {
  it('preserves legacy business status in metadata', () => {
    const legacyObject = `---
id: old12345
name: 旧项目
type: object
subtype: project
status: 进行中
deadline: 2026-01-01
summary: 一个旧的项目卡片
maturity: L1
confidence: 0.7
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
---

# 旧项目
`;
    const entry = cardToIndexEntry(legacyObject, 'Object/旧项目.md');
    assert.equal(entry.subtype, 'project');
    assert.equal(entry.summary, '一个旧的项目卡片');

    // status should be in metadata since it was removed from reserved keys
    assert.ok(entry.metadata, 'Expected metadata to be present');
    assert.equal(entry.metadata!['status'], '进行中');
    // YAML parses '2026-01-01' as a date string
    assert.ok(entry.metadata!['deadline'] != null);

    // Reserved keys should NOT be in metadata
    assert.ok(!('id' in entry.metadata!), 'id should not be in metadata');
    assert.ok(!('name' in entry.metadata!), 'name should not be in metadata');
    assert.ok(!('type' in entry.metadata!), 'type should not be in metadata');
    assert.ok(!('subtype' in entry.metadata!), 'subtype should not be in metadata');
    assert.ok(!('maturity' in entry.metadata!), 'maturity should not be in metadata');
    assert.ok(!('confidence' in entry.metadata!), 'confidence should not be in metadata');
  });

  it('metadata includes subtype-specific attributes', () => {
    const techCard = `---
id: tech001
name: Rust
type: object
subtype: technology
useCase: 系统编程
adoptionStatus: 评估中
techMaturity: 成熟
risks: 学习曲线
maturity: L1
confidence: 0.8
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
---

# Rust
`;
    const entry = cardToIndexEntry(techCard, 'Object/Rust.md');
    assert.ok(entry.metadata);
    assert.equal(entry.metadata!['useCase'], '系统编程');
    assert.equal(entry.metadata!['adoptionStatus'], '评估中');
    assert.equal(entry.metadata!['techMaturity'], '成熟');
  });
});

describe('Entity Index I/O - legacy alias → canonical metadata', () => {
  it('old judgment metadata has canonical judgmentConfidence', () => {
    const judgmentCard = `---
id: j001
name: MVP应Markdown-first
type: theme
subtype: judgment
claim: MVP should be Markdown-first
confidence: 0.8
maturity: L1
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
---

# MVP应Markdown-first
`;
    const entry = cardToIndexEntry(judgmentCard, 'Theme/MVP应Markdown-first.md');
    assert.ok(entry.metadata, 'Expected metadata');
    assert.equal(entry.metadata!['judgmentConfidence'], 0.8,
      'confidence alias should normalize to judgmentConfidence in metadata');
    // confidence is a reserved key → not in metadata, but canonical judgmentConfidence is
    assert.ok(!('confidence' in entry.metadata!),
      'confidence should not be in metadata (reserved key)');
  });

  it('old technology metadata has canonical techMaturity', () => {
    const techCard = `---
id: t001
name: Rust
type: object
subtype: technology
useCase: 系统编程
adoptionStatus: 评估中
maturity: 成熟
confidence: 0.7
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
---

# Rust
`;
    const entry = cardToIndexEntry(techCard, 'Object/Rust.md');
    assert.ok(entry.metadata, 'Expected metadata');
    assert.equal(entry.metadata!['techMaturity'], '成熟',
      'maturity alias should normalize to techMaturity in metadata');
    // maturity is a reserved key → not in metadata, but canonical techMaturity is
    assert.ok(!('maturity' in entry.metadata!),
      'maturity should not be in metadata (reserved key)');
  });
});

describe('Entity Index I/O - maturity validation', () => {
  it('technology card with maturity: 成熟 gets entry.maturity = L0, not polluted', () => {
    const techCard = `---
id: t001
name: Rust
type: object
subtype: technology
maturity: 成熟
confidence: 0.7
createdAt: "2026-05-01T10:00:00Z"
lastUpdated: "2026-05-01T10:00:00Z"
---

# Rust
`;
    const entry = cardToIndexEntry(techCard, 'Object/Rust.md');
    assert.equal(entry.maturity, 'L0');
  });
});

describe('Entity Index I/O - buildIndexFromFiles', () => {
  it('builds index from array of markdown files', () => {
    const files = [
      { path: 'Person/张三.md', content: SAMPLE_PERSON_CARD },
      { path: 'Object/Q2营销计划.md', content: SAMPLE_OBJECT_CARD },
    ];

    const index = buildIndexFromFiles(files);

    assert.ok(index.entries.length >= 2);
    assert.ok(index.lastRebuild.length > 0);

    const person = index.entries.find(e => e.name === '张三');
    assert.ok(person);
    assert.equal(person?.cardType, 'person');

    const obj = index.entries.find(e => e.name === 'Q2营销计划');
    assert.ok(obj);
    assert.equal(obj?.cardType, 'object');
  });

  it('returns empty index for no files', () => {
    const index = buildIndexFromFiles([]);
    assert.equal(index.entries.length, 0);
  });

  it('skips files that cannot be parsed', () => {
    const files = [
      { path: 'Person/张三.md', content: SAMPLE_PERSON_CARD },
      { path: 'Person/Broken.md', content: '' },
    ];

    const index = buildIndexFromFiles(files);
    assert.equal(index.entries.length, 1); // only the valid one
    assert.equal(index.entries[0].name, '张三');
  });
});
