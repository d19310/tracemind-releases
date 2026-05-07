import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMaturity, ATTRIBUTE_PRIORITY } from '../../src/core/context-card';
import { getAttributesByPriority, hasAttribute } from '../../src/core/entity-schema';

describe('Maturity Calculation - Object (Project subtype)', () => {
  it('returns L0 when only subtype is set (missing P0 stage/owner)', () => {
    const maturity = calculateMaturity('object', { subtype: 'project', stage: 'planning' });
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when project P0 (subtype/stage/owner) are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      stage: 'planning',
      owner: 'Vincent',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 + P1 are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      stage: 'planning',
      owner: 'Vincent',
      deadline: '2026-06-01',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when P0 + P1 + P2 are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      stage: 'planning',
      owner: 'Vincent',
      deadline: '2026-06-01',
      summary: 'Q2 project',
      priority: 'high',
    });
    assert.equal(maturity, 'L3');
  });
});

describe('Maturity Calculation - Object (Task subtype with legacy alias)', () => {
  it('returns L0 when only subtype is set', () => {
    assert.equal(calculateMaturity('object', { subtype: 'task' }), 'L0');
  });

  it('returns L1 when task P0 (subtype/taskStatus/nextAction) are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'task',
      taskStatus: 'doing',
      nextAction: 'write plan',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L1 when using legacy alias "status" for taskStatus', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'task',
      status: 'doing',
      nextAction: 'write plan',
    });
    assert.equal(maturity, 'L1');
  });
});

describe('Maturity Calculation - Object (no subtype / default other)', () => {
  it('returns L0 when no subtype and no attributes filled', () => {
    assert.equal(calculateMaturity('object', {}), 'L0');
  });

  it('returns L1 when other P0 filled (description + subtype implied by default)', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'other',
      description: 'Some object',
    });
    assert.equal(maturity, 'L1');
  });
});

describe('Maturity Calculation - Theme (Friction subtype)', () => {
  it('returns L0 when no attributes filled', () => {
    assert.equal(calculateMaturity('theme', {}), 'L0');
  });

  it('returns L1 when friction P0 (subtype/trigger/impact) are filled', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'friction',
      trigger: '需求反复',
      impact: '返工',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 + P1 are filled', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'friction',
      trigger: '需求反复',
      impact: '返工',
      frequency: 'weekly',
    });
    assert.equal(maturity, 'L2');
  });
});

describe('Maturity Calculation - Theme (Judgment subtype with legacy alias)', () => {
  it('returns L1 when judgment P0 (subtype/claim/judgmentConfidence) are filled', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'judgment',
      claim: 'MVP 应该 Markdown-first',
      judgmentConfidence: 0.7,
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L1 when using legacy alias "confidence" for judgmentConfidence', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'judgment',
      claim: 'MVP 应该 Markdown-first',
      confidence: 0.7,
    });
    assert.equal(maturity, 'L1');
  });
});

describe('Maturity Calculation - Person (unchanged)', () => {
  it('returns L0 when no attributes filled', () => {
    assert.equal(calculateMaturity('person', {}), 'L0');
  });

  it('returns L1 when only P0 attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 and P1 attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
      responsibility: 'Backend team lead',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when all attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
      responsibility: 'Backend team lead',
      personality: 'analytical',
    });
    assert.equal(maturity, 'L3');
  });
});

describe('getAttributesByPriority - subtype-aware', () => {
  it('project P0 includes subtype/stage/owner', () => {
    const attrs = getAttributesByPriority('object', 'project');
    assert.ok(attrs.p0.includes('subtype'));
    assert.ok(attrs.p0.includes('stage'));
    assert.ok(attrs.p0.includes('owner'));
  });

  it('task P0 includes subtype/taskStatus/nextAction', () => {
    const attrs = getAttributesByPriority('object', 'task');
    assert.ok(attrs.p0.includes('subtype'));
    assert.ok(attrs.p0.includes('taskStatus'));
    assert.ok(attrs.p0.includes('nextAction'));
  });

  it('technology P1 includes summary/techMaturity/risks/relatedProjects', () => {
    const attrs = getAttributesByPriority('object', 'technology');
    assert.ok(attrs.p1.includes('summary'));
    assert.ok(attrs.p1.includes('techMaturity'));
    assert.ok(attrs.p1.includes('risks'));
    assert.ok(attrs.p1.includes('relatedProjects'));
  });

  it('friction P0 includes subtype/trigger/impact', () => {
    const attrs = getAttributesByPriority('theme', 'friction');
    assert.ok(attrs.p0.includes('subtype'));
    assert.ok(attrs.p0.includes('trigger'));
    assert.ok(attrs.p0.includes('impact'));
  });

  it('judgment P0 includes subtype/claim/judgmentConfidence', () => {
    const attrs = getAttributesByPriority('theme', 'judgment');
    assert.ok(attrs.p0.includes('subtype'));
    assert.ok(attrs.p0.includes('claim'));
    assert.ok(attrs.p0.includes('judgmentConfidence'));
  });

  it('falls back to default subtype when invalid subtype given', () => {
    const attrsWithInvalid = getAttributesByPriority('theme', 'domain');
    const attrsDefault = getAttributesByPriority('theme', 'friction');
    assert.deepEqual(attrsWithInvalid, attrsDefault);
  });
});

describe('Maturity - Legacy alias (normalize)', () => {
  it('task old card {status: doing, nextAction: x} achieves L1 via alias normalize', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'task',
      status: 'doing',
      nextAction: 'write plan',
    });
    // P0: subtype+taskStatus+nextAction all filled via alias → L1
    assert.equal(maturity, 'L1');
  });

  it('technology old card {maturity: 成熟} still works', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'technology',
      useCase: 'AI coding',
      adoptionStatus: 'evaluating',
      maturity: '成熟',
    });
    // P0 filled (useCase+adoptionStatus), P1 filled (techMaturity via alias) → L2
    assert.equal(maturity, 'L2');
  });

  it('judgment old card {confidence: 0.8} works', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'judgment',
      claim: 'MVP is Markdown-first',
      confidence: 0.8,
    });
    assert.equal(maturity, 'L1');
  });

  it('person legacy communicationStyle works', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
      communicationStyle: '直接',
    });
    // P0 filled + P1 (communicationStyle → workingStyle) → L2
    assert.equal(maturity, 'L2');
  });
});

describe('Maturity - Normalized parse result', () => {
  const { parseCardMarkdown } = require('../../src/storage/markdown-card');

  it('parsed judgment card with confidence alias reaches L1', () => {
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
    const maturity = card.maturity;
    // After parse + normalize: judgmentConfidence should be filled
    assert.equal(card.attributes.judgmentConfidence, 0.8);
    assert.ok(maturity === 'L1' || maturity === 'L2');
  });

  it('parsed technology card with maturity alias reaches L2', () => {
    const md = `---
id: t001
name: Rust
type: object
subtype: technology
useCase: 系统编程
adoptionStatus: 评估中
maturity: 成熟
confidence: 0.7
createdAt: "2026-05-01T00:00:00.000Z"
lastUpdated: "2026-05-02T00:00:00.000Z"
---

# Rust
`;
    const card = parseCardMarkdown(md);
    // After parse + normalize: techMaturity should be filled
    assert.equal(card.attributes.techMaturity, '成熟');
    // Compute maturity from normalized attributes
    const maturity = calculateMaturity('object', card.attributes);
    assert.equal(maturity, 'L2');
  });
});

describe('hasAttribute - legacy alias support', () => {
  it('matches canonical key directly', () => {
    assert.equal(hasAttribute({ taskStatus: 'done' }, 'taskStatus'), true);
  });

  it('matches legacy alias', () => {
    assert.equal(hasAttribute({ status: 'done' }, 'taskStatus'), true);
  });

  it('returns false when neither key nor alias present', () => {
    assert.equal(hasAttribute({ other: 'x' }, 'taskStatus'), false);
  });

  it('returns false for null value', () => {
    assert.equal(hasAttribute({ taskStatus: null }, 'taskStatus'), false);
  });
});
