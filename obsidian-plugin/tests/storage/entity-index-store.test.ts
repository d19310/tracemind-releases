import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { saveEntityIndex, loadEntityIndex, ENTITY_INDEX_PATH } from '../../src/storage/entity-index-store';
import type { EntityIndex } from '../../src/storage/entity-index';

function createFakeApp() {
  const files = new Map<string, string>();
  const folders = new Set<string>();
  const ops: string[] = [];
  const fakeApp = {
    vault: {
      getFileByPath: (p: string) => files.has(p) ? ({ path: p } as any) : null,
      getAbstractFileByPath: (p: string) => folders.has(p) ? ({ path: p } as any) : null,
      modify: async (f: any, c: string) => { files.set(f.path, c); ops.push('modify:' + f.path); },
      create: async (p: string, c: string) => { files.set(p, c); ops.push('create:' + p); },
      read: async (f: any) => files.get(f.path) || '',
      createFolder: async (p: string) => { folders.add(p); },
    },
  };
  return { fakeApp: fakeApp as any, files, ops };
}

const sampleIndex: EntityIndex = {
  entries: [
    { id: 'abc', name: '张三', cardType: 'person', maturity: 'L1', confidence: 0.8, filePath: 'Person/张三.md', aliases: [], relationCount: 0, lastUpdated: '2026-01-01T00:00:00Z' },
  ],
  lastRebuild: '2026-01-01T00:00:00Z',
};

describe('saveEntityIndex', () => {
  it('creates index file at TraceMind/index/entity-index.json', async () => {
    const { fakeApp, files } = createFakeApp();
    await saveEntityIndex(fakeApp, sampleIndex);
    assert.ok(files.has(ENTITY_INDEX_PATH), 'Index file should be created');
  });

  it('modifies existing index file', async () => {
    const { fakeApp, files, ops } = createFakeApp();
    files.set(ENTITY_INDEX_PATH, '{"entries":[]}');
    await saveEntityIndex(fakeApp, sampleIndex);
    assert.ok(ops.some(o => o.startsWith('modify:')), 'Should use modify when file exists');
  });
});

describe('loadEntityIndex', () => {
  it('roundtrips an index', async () => {
    const { fakeApp, files } = createFakeApp();
    await saveEntityIndex(fakeApp, sampleIndex);
    const loaded = await loadEntityIndex(fakeApp);
    assert.ok(loaded);
    assert.equal(loaded!.entries.length, 1);
    assert.equal(loaded!.entries[0].name, '张三');
  });

  it('returns null when file does not exist', async () => {
    const { fakeApp } = createFakeApp();
    const loaded = await loadEntityIndex(fakeApp);
    assert.equal(loaded, null);
  });

  it('returns null on parse error', async () => {
    const { fakeApp, files } = createFakeApp();
    files.set(ENTITY_INDEX_PATH, 'not valid json');
    const loaded = await loadEntityIndex(fakeApp);
    assert.equal(loaded, null);
  });
});
