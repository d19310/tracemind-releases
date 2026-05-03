import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { inferCooccurrenceRelations } from '../../src/core/cooccurrence';

describe('Co-occurrence Relationship Inference', () => {
  it('infers relation between two person entities mentioned together', () => {
    const text = '今天和张三讨论了Q2计划，李四也参加了会议。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: 'Q2计划', type: 'object' as const },
      { name: '李四', type: 'person' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    assert.ok(result.length >= 1);
    // Should link 张三 with Q2计划
    const zhangQ2 = result.find(r =>
      r.from === '张三' && r.to === 'Q2计划' ||
      r.from === 'Q2计划' && r.to === '张三',
    );
    assert.ok(zhangQ2);
  });

  it('does not infer self-relations', () => {
    const text = '张三今天工作很努力。';
    const entities = [{ name: '张三', type: 'person' as const }];

    const result = inferCooccurrenceRelations(text, entities);

    assert.equal(result.length, 0);
  });

  it('deduplicates relations between same pair', () => {
    // Same entity pair mentioned multiple times in text
    const text = '张三负责Q2计划。Q2计划由张三主导。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: 'Q2计划', type: 'object' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    // Should only have one relation between the pair
    assert.equal(result.length, 1);
    assert.ok(
      result[0].from === '张三' && result[0].to === 'Q2计划' ||
      result[0].from === 'Q2计划' && result[0].to === '张三',
    );
  });

  it('handles entities not found in text', () => {
    const text = '今天心情不错。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: '李四', type: 'person' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    assert.equal(result.length, 0);
  });

  it('infers relations between person and theme', () => {
    const text = '张三最近在研究远程工作。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: '远程工作', type: 'theme' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    assert.equal(result.length, 1);
  });

  it('skips entities with empty names', () => {
    const text = '张三和李四开会。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: '', type: 'person' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    assert.equal(result.length, 0);
  });

  it('returns relation with mention count as confidence', () => {
    const text = '张三负责Q2计划。Q2计划由张三主导。张三说Q2计划很重要。';
    const entities = [
      { name: '张三', type: 'person' as const },
      { name: 'Q2计划', type: 'object' as const },
    ];

    const result = inferCooccurrenceRelations(text, entities);

    assert.equal(result.length, 1);
    assert.ok(result[0].confidence > 0);
    assert.equal(result[0].relationType, 'cooccurrence');
  });
});
