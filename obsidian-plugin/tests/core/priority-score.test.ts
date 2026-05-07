import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore, PRIORITY_WEIGHTS } from '../../src/core/context-card';

describe('Priority Score - Formula', () => {
  it('returns 0 when no attributes are filled', () => {
    assert.equal(calculatePriorityScore('person', {}, 0), 0);
    assert.equal(calculatePriorityScore('object', {}, 0), 0);
    assert.equal(calculatePriorityScore('theme', {}, 0), 0);
  });

  it('returns 0 when empty attributes with relations', () => {
    assert.equal(calculatePriorityScore('person', {}, 5, 3), 0);
  });

  it('scores P0 attributes with 1.5 weight', () => {
    const score = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('scores higher with more relations', () => {
    const score = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 3);
    assert.ok(score > 1.5);
    assert.ok(score < 4);
  });

  it('scores P0 + P1 higher than P0 alone', () => {
    const scoreP0 = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 0);

    const scoreP0P1 = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
      responsibility: '技术架构',
      communicationStyle: '直接',
    }, 0);

    assert.ok(scoreP0P1 > scoreP0);
  });

  it('scores P0 + P1 + P2 highest for person', () => {
    const scoreFull = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
      responsibility: '技术架构',
      communicationStyle: '直接',
      personality: '外向',
      preferences: '技术驱动',
      skills: '架构设计',
    }, 0);

    const scoreP0 = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 0);

    assert.ok(scoreFull > scoreP0);
  });
});

describe('Priority Score - Frequency Scaling', () => {
  it('scales linearly with frequency', () => {
    const attrs = {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    };

    const score1 = calculatePriorityScore('person', attrs, 0, 1);
    const score5 = calculatePriorityScore('person', attrs, 0, 5);

    assert.equal(score5, score1 * 5);
  });
});

describe('Priority Score - Object (subtype-aware)', () => {
  it('project with subtype/stage/owner gets full P0', () => {
    const score = calculatePriorityScore('object', {
      subtype: 'project',
      stage: 'planning',
      owner: 'Vincent',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('project with only subtype gets partial P0', () => {
    const score = calculatePriorityScore('object', { subtype: 'project' }, 0);
    assert.ok(score > 0, 'partial P0 should score > 0');
    assert.ok(score < 1.5, 'partial P0 should score < full P0');
  });

  it('task with legacy status + nextAction gets full P0 via alias', () => {
    const score = calculatePriorityScore('object', {
      subtype: 'task',
      status: 'doing',
      nextAction: 'write plan',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('technology with legacy maturity gets P1 bonus via alias', () => {
    const scoreWithMaturity = calculatePriorityScore('object', {
      subtype: 'technology',
      useCase: 'AI coding',
      adoptionStatus: 'evaluating',
      maturity: '成熟',
    }, 0);
    // P0 full (useCase+adoptionStatus): 1.5, P1 partial (techMaturity via alias): +
    const scoreWithout = calculatePriorityScore('object', {
      subtype: 'technology',
      useCase: 'AI coding',
      adoptionStatus: 'evaluating',
    }, 0);
    assert.ok(scoreWithMaturity > scoreWithout, 'legacy maturity should boost score');
  });
});

describe('Priority Score - Theme (subtype-aware)', () => {
  it('friction with trigger/impact gets full P0', () => {
    const score = calculatePriorityScore('theme', {
      subtype: 'friction',
      trigger: '需求反复',
      impact: '返工',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('judgment with legacy confidence gets P0 bonus via alias', () => {
    const score = calculatePriorityScore('theme', {
      subtype: 'judgment',
      claim: 'MVP should be Markdown-first',
      confidence: 0.8,
    }, 0);
    assert.equal(score, 1.5);
  });

  it('friction with only subtype gets partial P0', () => {
    const score = calculatePriorityScore('theme', { subtype: 'friction' }, 0);
    assert.ok(score > 0);
    assert.ok(score < 1.5);
  });
});

describe('Priority Score - Weights Export', () => {
  it('exports correct priority weights', () => {
    assert.equal(PRIORITY_WEIGHTS.P0, 1.5);
    assert.equal(PRIORITY_WEIGHTS.P1, 1.0);
    assert.equal(PRIORITY_WEIGHTS.P2, 0.5);
  });
});
