import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEntities, ExtractedEntity } from '../../src/ai/entity-extractor';

describe('Entity Extractor - Extract Entities', () => {
  it('extracts person entities from diary text', () => {
    const diary = '今天和张三讨论了项目进度，然后跟李四对齐任务。';
    const existingEntities = new Map<string, { name: string }>();

    const result = extractEntities(diary, existingEntities);

    assert.ok(result.some(e => e.name === '张三' && e.type === 'person'));
    assert.ok(result.some(e => e.name === '李四' && e.type === 'person'));
  });

  it('extracts object entities (project/task) from diary text', () => {
    const diary = 'Q2营销计划的技术方案已经确定，需要下周完成原型。';
    const existingEntities = new Map<string, { name: string }>();

    const result = extractEntities(diary, existingEntities);

    assert.ok(result.some(e => e.name === 'Q2营销计划' && e.type === 'object'));
  });

  it('returns empty for diary with no entities', () => {
    const diary = '今天心情不错，天气也很好。';
    const existingEntities = new Map<string, { name: string }>();

    const result = extractEntities(diary, existingEntities);

    assert.equal(result.length, 0);
  });
});
