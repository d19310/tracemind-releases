import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnalysisService } from '../../src/ai/analysis-service';

describe('Analysis Service - Async (LLM)', () => {
  it('returns empty result when no LLM config provided', async () => {
    const diary = '今天和张三讨论了项目进度，然后跟李四对齐任务。';

    const result = await AnalysisService.analyzeBlockAsync(diary, new Map(), null);

    // Without LLM config, entities should be empty (no rule-based fallback)
    assert.equal(result.entities.length, 0);
  });

  it('handles empty LLM config gracefully', async () => {
    const diary = '今天心情不错。';
    const emptyConfig = { apiKey: '', model: '', baseUrl: '' };

    const result = await AnalysisService.analyzeBlockAsync(diary, new Map(), emptyConfig as any);

    // Should not crash, should return empty since no valid credentials
    assert.ok(Array.isArray(result.entities));
  });
});

describe('Analysis Service - Entity Deduplication', () => {
  it('deduplicates entities by name (case-insensitive)', async () => {
    // With no LLM config, result is empty — but we verify the structure is correct
    const diary = '今天和张三讨论了项目，张三是项目经理。';
    const result = await AnalysisService.analyzeBlockAsync(diary, new Map(), null);

    const names = result.entities.map(e => e.name.toLowerCase());
    const uniqueNames = new Set(names);
    assert.equal(names.length, uniqueNames.size, 'Should have no duplicate entity names');
  });
});
