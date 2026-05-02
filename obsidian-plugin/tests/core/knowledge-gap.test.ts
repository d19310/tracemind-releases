import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KnowledgeGap,
  GapType,
  detectKnowledgeGaps,
  calculateGapScore,
} from '../../src/core/knowledge-gap';
import { CardType } from '../../src/core/context-card';

describe('Knowledge Gap - Score Calculation', () => {
  it('scores new entity with L0 + P0 reward', () => {
    // L0=30 + P0=10 = 40
    const score = calculateGapScore({
      type: 'new_entity',
      entityName: '张三',
      entityType: 'person',
      maturityLevel: 'L0',
      attributePriority: 'P0',
      description: 'New person entity',
    });
    assert.ok(score > 0);
  });

  it('scores higher for L0 than L3 for same gap type', () => {
    const scoreL0 = calculateGapScore({
      type: 'missing_attribute',
      entityName: '张三',
      entityType: 'person',
      maturityLevel: 'L0',
      attributePriority: 'P0',
      description: 'No info',
    });
    const scoreL2 = calculateGapScore({
      type: 'missing_attribute',
      entityName: '张三',
      entityType: 'person',
      maturityLevel: 'L2',
      attributePriority: 'P0',
      description: 'Some info',
    });
    assert.ok(scoreL0 > scoreL2);
  });

  it('scores P0 attributes higher than P2', () => {
    const scoreP0 = calculateGapScore({
      type: 'missing_attribute',
      entityName: '张三',
      entityType: 'person',
      maturityLevel: 'L0',
      attributePriority: 'P0',
      description: 'P0 missing',
    });
    const scoreP2 = calculateGapScore({
      type: 'missing_attribute',
      entityName: '张三',
      entityType: 'person',
      maturityLevel: 'L0',
      attributePriority: 'P2',
      description: 'P2 missing',
    });
    assert.ok(scoreP0 > scoreP2);
  });
});

describe('Knowledge Gap - Detection Algorithm', () => {
  it('detects missing attribute gaps for person with no P0', () => {
    const gaps = detectKnowledgeGaps('person', 'L0', {}, []);
    assert.ok(gaps.length > 0);
    assert.ok(gaps.some(g => g.type === 'missing_attribute'));
  });

  it('detects no gaps for fully filled person card', () => {
    const attributes = {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
      responsibility: '技术架构',
      communicationStyle: '直接',
      personality: '外向',
      preferences: '技术驱动',
      skills: '架构设计',
    };
    const gaps = detectKnowledgeGaps('person', 'L3', attributes, ['entity1']);
    assert.equal(gaps.length, 0);
  });

  it('detects missing attribute gaps for object without subtype/status', () => {
    const gaps = detectKnowledgeGaps('object', 'L0', {}, []);
    assert.ok(gaps.length > 0);
    assert.ok(gaps.some(g => g.type === 'missing_attribute'));
  });

  it('detects missing attribute gaps for theme without subtype', () => {
    const gaps = detectKnowledgeGaps('theme', 'L0', {}, []);
    assert.ok(gaps.some(g => g.type === 'missing_attribute'));
  });

  it('detects relation gaps when related entities are empty', () => {
    const gaps = detectKnowledgeGaps('person', 'L1', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    }, []);
    // Should detect missing relations for L1+ person
    assert.ok(gaps.length > 0);
  });
});

describe('Knowledge Gap - Gap Creation', () => {
  it('creates gaps with proper fields', () => {
    const gap = createTestGap();
    assert.ok(gap.type);
    assert.ok(gap.entityName);
    assert.ok(gap.entityType);
    assert.ok(gap.maturityLevel);
    assert.ok(gap.score > 0);
    assert.ok(gap.description);
  });
});

function createTestGap(): KnowledgeGap {
  const gap = {
    type: 'new_entity',
    entityName: 'Test',
    entityType: 'person',
    maturityLevel: 'L0',
    attributePriority: 'P0',
    description: 'Test gap',
    score: 0,
  } as KnowledgeGap;
  return { ...gap, score: calculateGapScore(gap) };
}
