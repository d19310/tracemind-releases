import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore, PRIORITY_WEIGHTS } from '../../src/core/context-card';

describe('Priority Score - Formula', () => {
  it('returns 0 when no attributes are filled', () => {
    const score = calculatePriorityScore('person', {}, 0);
    assert.equal(score, 0);
  });

  it('scores P0 attributes with 1.5 weight', () => {
    // Person with all P0 filled: weight = 1.5, frequency = 1, relationCount = 0
    // score = 1.5 * 1 * (1 + log1p(0)) = 1.5 * 1 * 1 = 1.5
    const score = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('scores higher with more relations', () => {
    // P0 filled + 3 relations: 1.5 * 1 * (1 + log1p(3)) = 1.5 * (1 + 1.386) = 1.5 * 2.386 = 3.579
    const score = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 3);
    assert.ok(score > 1.5);
    assert.ok(score < 4);
  });

  it('scores P0 + P1 higher than P0 alone', () => {
    // P0 only
    const scoreP0 = calculatePriorityScore('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, 0);

    // P0 + P1
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

describe('Priority Score - Object Type', () => {
  it('scores object with P0 subtype and status', () => {
    // subtype is P0, status is P0 -> weight = 1.5
    const score = calculatePriorityScore('object', {
      subtype: 'project',
      status: '进行中',
    }, 0);
    assert.equal(score, 1.5);
  });

  it('scores object with only subtype (partial P0)', () => {
    // subtype filled, status missing -> partial P0
    // weight = 1.5, but only 1 of 2 P0 filled = 1.5 * 0.5 = 0.75
    const score = calculatePriorityScore('object', {
      subtype: 'project',
    }, 0);
    assert.ok(score > 0);
    assert.ok(score < 1.5);
  });
});

describe('Priority Score - Theme Type', () => {
  it('scores theme with subtype', () => {
    // subtype is P0 for theme
    const score = calculatePriorityScore('theme', { subtype: 'domain' }, 0);
    assert.equal(score, 1.5);
  });
});

describe('Priority Score - Weights Export', () => {
  it('exports correct priority weights', () => {
    assert.equal(PRIORITY_WEIGHTS.P0, 1.5);
    assert.equal(PRIORITY_WEIGHTS.P1, 1.0);
    assert.equal(PRIORITY_WEIGHTS.P2, 0.5);
  });
});
