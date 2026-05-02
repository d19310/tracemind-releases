import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ContextCard, cardToMarkdown, parseCardMarkdown } from '../../src/storage/markdown-card';

describe('Markdown Card - Serialize Person', () => {
  it('serializes a Person card to markdown with frontmatter', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: 'XX科技',
        role: '技术总监',
        relationship_to_user: '同事',
      },
      aliases: ['张总'],
    });

    const md = cardToMarkdown(card);

    assert.ok(md.startsWith('---'));
    assert.ok(md.includes('name: 张三'));
    assert.ok(md.includes('type: person'));
    assert.ok(md.includes('company: XX科技'));
    assert.ok(md.includes('role: 技术总监'));
    assert.ok(md.includes('relationship_to_user: 同事'));
    assert.ok(md.includes('aliases:'));
    assert.ok(md.includes('- 张总'));
    assert.ok(md.includes('# 张三'));
  });
});

describe('Markdown Card - Serialize Object', () => {
  it('serializes an Object card with subtype and status', () => {
    const card = ContextCard.create({
      name: 'Q2营销计划',
      cardType: 'object',
      attributes: { subtype: 'project', status: '进行中' },
    });

    const md = cardToMarkdown(card);

    assert.ok(md.includes('type: object'));
    assert.ok(md.includes('subtype: project'));
    assert.ok(md.includes('status: 进行中'));
  });
});

describe('Markdown Card - Parse Person', () => {
  it('parses a Person card from markdown', () => {
    const md = `---
id: a1b2c3d4
name: 张三
type: person
company: XX科技
role: 技术总监
relationship_to_user: 同事
aliases:
  - 张总
maturity: L1
confidence: 0.7
status: active
createdAt: "2026-05-01T10:00:00.000Z"
lastUpdated: "2026-05-02T10:00:00.000Z"
---

# 张三

## 基本信息
- 公司：XX科技
- 职位：技术总监
- 关系：同事

## 关联实体
- [[Q2营销计划]] - 参与者
`;

    const card = parseCardMarkdown(md);

    assert.equal(card.id, 'a1b2c3d4');
    assert.equal(card.name, '张三');
    assert.equal(card.cardType, 'person');
    assert.equal(card.attributes.company, 'XX科技');
    assert.equal(card.attributes.role, '技术总监');
    assert.equal(card.attributes.relationship_to_user, '同事');
    assert.deepEqual(card.aliases, ['张总']);
    assert.equal(card.maturity, 'L1');
    assert.equal(card.confidence, 0.7);
    assert.equal(card.status, 'active');
  });
});

describe('Markdown Card - Roundtrip', () => {
  it('serializes and parses back to the same card', () => {
    const original = ContextCard.create({
      name: '李四',
      cardType: 'person',
      attributes: {
        company: 'YY公司',
        role: '产品经理',
        relationship_to_user: '朋友',
      },
      aliases: ['老李'],
    });

    const md = cardToMarkdown(original);
    const parsed = parseCardMarkdown(md);

    assert.equal(parsed.id, original.id);
    assert.equal(parsed.name, original.name);
    assert.equal(parsed.cardType, original.cardType);
    assert.deepEqual(parsed.attributes, original.attributes);
    assert.deepEqual(parsed.aliases, original.aliases);
  });
});
