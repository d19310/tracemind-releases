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

  it('shows workingStyle in 基本信息 when filled', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: 'XX科技',
        role: '技术总监',
        relationship_to_user: '同事',
        workingStyle: '直接沟通，喜欢异步',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('协作风格'), `Expected 协作风格 in: ${md}`);
    assert.ok(md.includes('直接沟通'));
  });

  it('shows legacy communicationStyle as 协作风格', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: 'XX科技',
        role: '技术总监',
        relationship_to_user: '同事',
        communicationStyle: '直接',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('协作风格'), `Expected 协作风格 label for legacy communicationStyle`);
    assert.ok(md.includes('直接'));
  });
});

describe('Markdown Card - Serialize Object (subtype-specific)', () => {
  it('shows project fields: stage, owner, deadline, blockers', () => {
    const card = ContextCard.create({
      name: 'Q2营销计划',
      cardType: 'object',
      attributes: {
        subtype: 'project',
        stage: '执行中',
        owner: '张三',
        deadline: '2026-06-01',
        blockers: '等待设计资源',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('阶段'), `Expected 阶段 in: ${md}`);
    assert.ok(md.includes('执行中'));
    assert.ok(md.includes('负责人'));
    assert.ok(md.includes('张三'));
    assert.ok(md.includes('截止日期'));
    assert.ok(md.includes('2026-06-01'));
    assert.ok(md.includes('阻碍'));
    assert.ok(md.includes('等待设计资源'));
    // status should not appear as a business attribute in body
    assert.ok(!md.includes('- 状态：'), 'Old status should not be primary field in body');
  });

  it('shows task fields: taskStatus, nextAction, dueDate', () => {
    const card = ContextCard.create({
      name: '写周报',
      cardType: 'object',
      attributes: {
        subtype: 'task',
        taskStatus: '进行中',
        nextAction: '提交给经理',
        dueDate: '2026-05-10',
        assignee: '李四',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('状态'), `Expected 状态 in: ${md}`);
    assert.ok(md.includes('进行中'));
    assert.ok(md.includes('下一步'));
    assert.ok(md.includes('提交给经理'));
    assert.ok(md.includes('经办人'));
    assert.ok(md.includes('李四'));
  });

  it('shows technology fields: useCase, adoptionStatus, techMaturity', () => {
    const card = ContextCard.create({
      name: 'Rust',
      cardType: 'object',
      attributes: {
        subtype: 'technology',
        useCase: '系统编程',
        adoptionStatus: '评估中',
        techMaturity: '成熟',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('用途'), `Expected 用途 in: ${md}`);
    assert.ok(md.includes('系统编程'));
    assert.ok(md.includes('采用状态'));
    assert.ok(md.includes('评估中'));
    assert.ok(md.includes('成熟度'));
    assert.ok(md.includes('成熟'));
  });
});

describe('Markdown Card - Serialize Theme (subtype-specific)', () => {
  it('shows friction fields: trigger, impact, frequency, possibleCause', () => {
    const card = ContextCard.create({
      name: '需求方向反复',
      cardType: 'theme',
      attributes: {
        subtype: 'friction',
        trigger: '需求评审会',
        impact: '返工两周',
        frequency: '每周一次',
        possibleCause: '产品与开发沟通不足',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('触发条件'), `Expected 触发条件 in: ${md}`);
    assert.ok(md.includes('需求评审会'));
    assert.ok(md.includes('影响'));
    assert.ok(md.includes('返工两周'));
    assert.ok(md.includes('频率'));
    assert.ok(md.includes('可能原因'));
  });

  it('shows judgment fields: claim, judgmentConfidence, evidence, counterEvidence', () => {
    const card = ContextCard.create({
      name: 'MVP应Markdown-first',
      cardType: 'theme',
      attributes: {
        subtype: 'judgment',
        claim: 'MVP 应该用 Markdown-first 架构',
        judgmentConfidence: 0.8,
        evidence: '日记、Context Card 都天然是文档',
        counterEvidence: '复杂表格需要额外处理',
      },
    });

    const md = cardToMarkdown(card);
    assert.ok(md.includes('主张'), `Expected 主张 in: ${md}`);
    assert.ok(md.includes('Markdown-first'));
    assert.ok(md.includes('确信度'));
    assert.ok(md.includes('0.8'));
    assert.ok(md.includes('证据'));
    assert.ok(md.includes('反证'));
  });
});

describe('Markdown Card - Legacy status roundtrip', () => {
  it('preserves old object status in attributes and body', () => {
    const md = `---
id: a1b2c3d4
name: 旧项目
type: object
subtype: project
status: 进行中
deadline: 2026-01-01
maturity: L1
confidence: 0.7
createdAt: "2026-05-01T00:00:00.000Z"
lastUpdated: "2026-05-02T00:00:00.000Z"
---

# 旧项目
`;

    const card = parseCardMarkdown(md);
    // '进行中' is NOT a valid CardStatus → should end up in attributes
    assert.equal(card.status, 'needs_confirmation');
    assert.equal(card.attributes.status, '进行中');
    // YAML parses '2026-01-01' as Date — check it exists
    assert.ok(card.attributes.deadline != null);

    // Roundtrip: serialize back — status preserved in frontmatter
    const md2 = cardToMarkdown(card);
    assert.ok(md2.includes('status: 进行中'), `Expected status preserved in frontmatter`);

    // Parse again — should be stable
    const card2 = parseCardMarkdown(md2);
    assert.equal(card2.attributes.status, '进行中');
    // Legacy status shows in body with raw key as fallback
    assert.ok(md2.includes('进行中'), `Expected value preserved in body`);
  });

  it('treats valid CardStatus as top-level only', () => {
    const md = `---
id: a1b2c3d4
name: Test
type: object
status: active
maturity: L1
confidence: 0.7
createdAt: "2026-05-01T00:00:00.000Z"
lastUpdated: "2026-05-02T00:00:00.000Z"
---

# Test
`;

    const card = parseCardMarkdown(md);
    assert.equal(card.status, 'active');
    assert.equal(card.attributes.status, undefined);
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

describe('Markdown Card - Parse alias → canonical', () => {
  it('old judgment card parse gives judgmentConfidence from confidence alias', () => {
    const md = `---
id: j001
name: MVP应Markdown-first
type: theme
subtype: judgment
claim: MVP should be Markdown-first
confidence: 0.8
maturity: L1
createdAt: "2026-05-01T00:00:00.000Z"
lastUpdated: "2026-05-02T00:00:00.000Z"
---

# MVP应Markdown-first
`;
    const card = parseCardMarkdown(md);
    // confidence alias → judgmentConfidence via copyReservedAliases + normalize
    assert.equal(card.attributes.judgmentConfidence, 0.8);
    // confidence was copied from reserved via copyReservedAliases, then normalized — kept as alias
    assert.equal(card.attributes.confidence, 0.8);
    // Card-level confidence still set from frontmatter
    assert.equal(card.confidence, 0.8);
  });

  it('old technology card parse gives techMaturity from maturity alias', () => {
    const md = `---
id: t001
name: Rust
type: object
subtype: technology
useCase: 系统编程
maturity: 成熟
confidence: 0.7
createdAt: "2026-05-01T00:00:00.000Z"
lastUpdated: "2026-05-02T00:00:00.000Z"
---

# Rust
`;
    const card = parseCardMarkdown(md);
    // maturity alias → techMaturity via copyReservedAliases + normalize
    assert.equal(card.attributes.techMaturity, '成熟');
    // maturity was copied from reserved via copyReservedAliases — kept as alias
    assert.equal(card.attributes.maturity, '成熟');
    assert.equal(card.maturity, 'L0'); // '成熟' is not a valid MaturityLevel
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
    // Parse + normalize may add canonical keys — check original keys still match
    for (const key of Object.keys(original.attributes)) {
      assert.equal(parsed.attributes[key], original.attributes[key],
        `Attribute ${key} should match after roundtrip`);
    }
    assert.deepEqual(parsed.aliases, original.aliases);
  });
});
