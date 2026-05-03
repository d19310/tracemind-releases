import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AnalysisService,
  MAX_ENTITIES_PER_BLOCK,
} from '../../src/ai/analysis-service';

describe('Analysis Service - Max Entities Limit', () => {
  it('returns at most MAX_ENTITIES_PER_BLOCK entities', () => {
    // Text with many person references to trigger many extractions
    const text = '今天和张三讨论了项目，和李四开会，和王五吃饭，和赵六合作，和钱七沟通，和孙八交流。';
    const result = AnalysisService.analyzeBlock(text, new Map());

    assert.ok(result.entities.length <= MAX_ENTITIES_PER_BLOCK);
  });

  it('returns fewer entities when text has less', () => {
    const text = '今天和张三讨论了项目。';
    const result = AnalysisService.analyzeBlock(text, new Map());

    assert.ok(result.entities.length <= MAX_ENTITIES_PER_BLOCK);
    assert.ok(result.entities.length > 0);
  });

  it('MAX_ENTITIES_PER_BLOCK is 5', () => {
    assert.equal(MAX_ENTITIES_PER_BLOCK, 5);
  });
});
