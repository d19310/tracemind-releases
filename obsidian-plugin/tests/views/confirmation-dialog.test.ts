import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateConfirmationItems, createEntityFromConfirmation, getEntityTypeLabel, getEntityTypeEmoji } from '../../src/views/confirmation-dialog';
import type { AnalysisResult } from '../../src/entities/types';

const sampleResult: AnalysisResult = {
  blockId: 'b1',
  aiResponse: '',
  category: '工作',
  entities: {
    people: [
      { type: 'person', name: '张三', confidence: 0.9, context: '', isArchived: false, newEntity: true },
    ],
    objects: [
      { type: 'object', name: 'Q2项目', confidence: 0.8, context: '', isArchived: false, newEntity: true },
    ],
    dimensions: [
      { type: 'theme', name: 'AI', confidence: 0.7, context: '', isArchived: false, newEntity: true },
    ],
  },
  needsConfirmation: ['person:张三', 'object:Q2项目', 'theme:AI'],
};

describe('generateConfirmationItems', () => {
  it('generates items from people/objects/dimensions', () => {
    const items = generateConfirmationItems(sampleResult);
    assert.equal(items.length, 3);
    assert.equal(items[0].entityType, 'person');
    assert.equal(items[1].entityType, 'object');
    assert.equal(items[2].entityType, 'theme');
  });

  it('skips unlisted entities', () => {
    const result = { ...sampleResult, needsConfirmation: ['person:张三'] };
    const items = generateConfirmationItems(result);
    assert.equal(items.length, 1);
    assert.equal(items[0].entityType, 'person');
  });
});

describe('createEntityFromConfirmation', () => {
  it('creates entity input from confirmation item', () => {
    const item = { id: 'c1', entityType: 'object' as const, name: 'Q2', confidence: 0.8, context: '', blockId: 'b1' };
    const input = createEntityFromConfirmation(item);
    assert.equal(input.type, 'object');
    assert.equal(input.title, 'Q2');
  });

});

describe('category items are excluded from entity creation', () => {
  it('generateConfirmationItems never returns category-type items from entities', () => {
    const items = generateConfirmationItems(sampleResult);
    // All items should have entity types, never 'category'
    for (const item of items) {
      assert.notEqual(item.entityType, 'category', `Expected entity type, got category for ${item.name}`);
    }
  });
});

describe('getEntityTypeLabel / getEntityTypeEmoji', () => {
  it('returns labels for person/object/theme', () => {
    assert.ok(getEntityTypeLabel('person').length > 0);
    assert.ok(getEntityTypeLabel('object').length > 0);
    assert.ok(getEntityTypeLabel('theme').length > 0);
  });

  it('returns emojis for person/object/theme', () => {
    assert.ok(getEntityTypeEmoji('person').length > 0);
    assert.ok(getEntityTypeEmoji('object').length > 0);
    assert.ok(getEntityTypeEmoji('theme').length > 0);
  });
});
