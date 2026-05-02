import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  searchByName,
  searchByType,
  getTopEntities,
  upsertEntry,
  removeEntry,
  serializeIndex,
  parseIndex,
  EntityIndex,
  IndexEntry,
} from '../../src/storage/entity-index';

const sampleIndex: EntityIndex = {
  entries: [
    { id: 'a1', name: '张三', cardType: 'person', maturity: 'L1', confidence: 0.8, filePath: 'Person/张三.md', aliases: ['老张'], relationCount: 3, lastUpdated: '2026-05-01T10:00:00Z' },
    { id: 'a2', name: 'Q2营销计划', cardType: 'object', subtype: 'project', maturity: 'L0', confidence: 0.6, filePath: 'Object/Q2营销计划.md', aliases: [], relationCount: 1, lastUpdated: '2026-05-01T10:00:00Z' },
    { id: 'a3', name: '技术架构', cardType: 'theme', subtype: 'domain', maturity: 'L2', confidence: 0.9, filePath: 'Theme/技术架构.md', aliases: ['架构设计'], relationCount: 5, lastUpdated: '2026-05-01T10:00:00Z' },
  ],
  lastRebuild: '2026-05-01T08:00:00Z',
};

describe('Entity Index - Search by Name', () => {
  it('finds entities by partial name match', () => {
    const results = searchByName(sampleIndex, '张');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, '张三');
  });

  it('finds entities by alias match', () => {
    const results = searchByName(sampleIndex, '老张');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, '张三');
  });

  it('returns empty for no match', () => {
    const results = searchByName(sampleIndex, '不存在');
    assert.equal(results.length, 0);
  });
});

describe('Entity Index - Search by Type', () => {
  it('finds all person entities', () => {
    const results = searchByType(sampleIndex, 'person');
    assert.equal(results.length, 1);
    assert.equal(results[0].cardType, 'person');
  });

  it('finds all object entities', () => {
    const results = searchByType(sampleIndex, 'object');
    assert.equal(results.length, 1);
    assert.equal(results[0].cardType, 'object');
  });
});

describe('Entity Index - Top Entities', () => {
  it('returns entities sorted by score', () => {
    const top = getTopEntities(sampleIndex);
    assert.ok(top.length >= 1);
    // Higher confidence + more relations should rank higher
    assert.equal(top[0].name, '技术架构'); // confidence 0.9, relations 5
  });

  it('respects limit', () => {
    const top = getTopEntities(sampleIndex, 2);
    assert.equal(top.length, 2);
  });
});

describe('Entity Index - Upsert', () => {
  it('adds new entry', () => {
    const entry: IndexEntry = {
      id: 'new1',
      name: '李四',
      cardType: 'person',
      maturity: 'L0',
      confidence: 0.5,
      filePath: 'Person/李四.md',
      aliases: [],
      relationCount: 0,
      lastUpdated: new Date().toISOString(),
    };
    const result = upsertEntry(sampleIndex, entry);
    assert.equal(result.entries.length, sampleIndex.entries.length + 1);
  });

  it('updates existing entry', () => {
    const updated = { ...sampleIndex.entries[0], maturity: 'L2', confidence: 0.95 };
    const result = upsertEntry(sampleIndex, updated);
    assert.equal(result.entries.length, sampleIndex.entries.length);
    assert.equal(result.entries[0].maturity, 'L2');
  });
});

describe('Entity Index - Remove', () => {
  it('removes entry by id', () => {
    const result = removeEntry(sampleIndex, 'a1');
    assert.equal(result.entries.length, sampleIndex.entries.length - 1);
    assert.ok(!result.entries.some(e => e.id === 'a1'));
  });
});

describe('Entity Index - Serialize/Parse', () => {
  it('roundtrips through serialize and parse', () => {
    const json = serializeIndex(sampleIndex);
    const parsed = parseIndex(json);

    assert.equal(parsed.entries.length, sampleIndex.entries.length);
    assert.equal(parsed.entries[0].name, sampleIndex.entries[0].name);
    assert.equal(parsed.lastRebuild, sampleIndex.lastRebuild);
  });
});
