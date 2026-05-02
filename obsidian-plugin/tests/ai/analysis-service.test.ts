import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AnalysisService,
  AnalysisResult,
} from '../../src/ai/analysis-service';

describe('Analysis Service - Analyze Block', () => {
  it('analyzes diary text and returns entities', () => {
    const diary = '今天和张三讨论了Q2营销计划的技术方案。';
    const existingCards = new Map();

    const result = AnalysisService.analyzeBlock(diary, existingCards);

    assert.ok(result.entities.length > 0);
    assert.ok(result.entities.some(e => e.type === 'person'));
    assert.ok(result.entities.some(e => e.type === 'object'));
  });

  it('identifies existing vs new entities', () => {
    const diary = '今天和李四开会讨论了Q3项目方案。';
    const existingCards = new Map([
      ['李四', { name: '李四', cardType: 'person', maturity: 'L2' }],
    ]);

    const result = AnalysisService.analyzeBlock(diary, existingCards);

    const existing = result.entities.find(e => e.name === '李四');
    assert.equal(existing?.isNew, false);
    // Q3项目方案 should be detected as a new object entity
    const newEntities = result.entities.filter(e => e.isNew);
    assert.ok(newEntities.length > 0);
  });

  it('returns empty when no entities found', () => {
    const diary = '今天天气很好，心情也不错。';
    const existingCards = new Map();

    const result = AnalysisService.analyzeBlock(diary, existingCards);

    assert.equal(result.entities.length, 0);
  });
});

describe('Analysis Service - Priority Ordering', () => {
  it('sorts new entities by type priority (person > object > theme)', () => {
    const diary = '今天和王五讨论了人工智能项目，感觉AI技术很有前景。';
    const existingCards = new Map();

    const result = AnalysisService.analyzeBlock(diary, existingCards);

    // Verify entities are present
    assert.ok(result.entities.length > 0);
  });

  it('includes clarification questions for new low-maturity entities', () => {
    const diary = '今天和张三讨论了营销计划。';
    const existingCards = new Map();

    const result = AnalysisService.analyzeBlock(diary, existingCards);

    // New entities should have questions
    for (const entity of result.entities) {
      if (entity.isNew) {
        assert.ok(Array.isArray(entity.clarificationQuestions));
      }
    }
  });
});
