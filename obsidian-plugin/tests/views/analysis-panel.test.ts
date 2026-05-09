import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateAnalysisSummary, getSectionTitle, getEntityEmoji } from '../../src/views/analysis-panel';
import type { AnalysisResult } from '../../src/entities/types';

const sampleResult: AnalysisResult = {
  blockId: 'b1',
  aiResponse: '',
  category: '工作',
  entities: {
    people: [
      { type: 'person', name: '张三', confidence: 0.9, context: '', isArchived: true, newEntity: false },
    ],
    objects: [
      { type: 'object', name: 'Q2项目', confidence: 0.8, context: '', isArchived: false, newEntity: true },
    ],
    dimensions: [
      { type: 'theme', name: 'AI', confidence: 0.7, context: '', isArchived: false, newEntity: true },
    ],
  },
  needsConfirmation: [],
};

describe('generateAnalysisSummary', () => {
  it('counts people/objects/dimensions', () => {
    const summary = generateAnalysisSummary(sampleResult);
    assert.equal(summary.totalEntities, 3);
    assert.equal(summary.people.length, 1);
    assert.equal(summary.objects.length, 1);
    assert.equal(summary.dimensions.length, 1);
  });

  it('counts archived and new separately', () => {
    const summary = generateAnalysisSummary(sampleResult);
    assert.equal(summary.archivedCount, 1);
    assert.equal(summary.newCount, 2);
  });
});

describe('getSectionTitle', () => {
  it('returns section titles for current groups', () => {
    assert.ok(getSectionTitle('objects').length > 0);
    assert.ok(getSectionTitle('dimensions').length > 0);
  });
});

describe('getEntityEmoji', () => {
  it('returns emoji for person/object/theme', () => {
    assert.ok(getEntityEmoji('person').length > 0);
    assert.ok(getEntityEmoji('object').length > 0);
    assert.ok(getEntityEmoji('theme').length > 0);
  });
});
