import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnalysisService } from '../../src/ai/analysis-service';
import { CardType } from '../../src/core/context-card';

describe('Analysis Service - Async (LLM)', () => {
  it('uses rule-based extraction when no LLM config', async () => {
    const diary = '今天和张三讨论了项目进度，然后跟李四对齐任务。';
    const existingCards = new Map<string, { name: string; cardType: CardType; maturity: string }>();

    const result = await AnalysisService.analyzeBlockAsync(diary, existingCards, null);

    assert.ok(result.entities.length > 0);
    assert.ok(result.entities.some(e => e.name === '张三'));
    assert.ok(result.entities.some(e => e.name === '李四'));
  });

  it('returns same results as sync analyzeBlock when no LLM', async () => {
    const diary = '今天和张三讨论了项目进度，然后跟李四对齐任务。';
    const existingCards = new Map<string, { name: string; cardType: CardType; maturity: string }>();

    const syncResult = AnalysisService.analyzeBlock(diary, existingCards);
    const asyncResult = await AnalysisService.analyzeBlockAsync(diary, existingCards, null);

    assert.equal(asyncResult.entities.length, syncResult.entities.length);
    assert.deepEqual(
      asyncResult.entities.map(e => e.name).sort(),
      syncResult.entities.map(e => e.name).sort(),
    );
  });

  it('handles empty LLM config gracefully', async () => {
    const diary = '今天心情不错。';
    const emptyConfig = { apiKey: '', model: '', baseUrl: '' };

    const result = await AnalysisService.analyzeBlockAsync(diary, new Map(), emptyConfig as any);

    // Should not crash, should return empty since no entities detected
    assert.ok(Array.isArray(result.entities));
  });
});

describe('Analysis Service - Entity Deduplication', () => {
  it('deduplicates entities by name (case-insensitive)', async () => {
    // Test via the async method by checking no duplicates appear
    const diary = '今天和张三讨论了项目，张三是项目经理。';
    const result = await AnalysisService.analyzeBlockAsync(diary, new Map(), null);

    const names = result.entities.map(e => e.name.toLowerCase());
    const uniqueNames = new Set(names);
    assert.equal(names.length, uniqueNames.size, 'Should have no duplicate entity names');
  });
});
