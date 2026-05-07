import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { saveInsightReport } from '../../src/storage/insight-writer';
import { insightFilePath, formatInsightMarkdown, parseInsightMarkdown, type InsightReport } from '../../src/storage/insight-store';

function createFakeApp() {
  const files = new Map<string, string>();
  const folders = new Set<string>();
  const ops: string[] = [];
  const fakeApp = {
    vault: {
      getFileByPath: (p: string) => files.has(p) ? { path: p } as any : null,
      read: async (f: any) => files.get(f.path) || '',
      modify: async (f: any, c: string) => { files.set(f.path, c); ops.push('modify:' + f.path); },
      create: async (p: string, c: string) => { files.set(p, c); ops.push('create:' + p); },
      getAbstractFileByPath: (p: string) => folders.has(p) ? ({ path: p } as any) : null,
      createFolder: async (p: string) => { folders.add(p); },
    },
  };
  return { fakeApp: fakeApp as any, files, ops };
}

const testReport: InsightReport = {
  date: '2026-05-07',
  content: '# Test Insight\n\nContent here.',
  contentHash: 'abc123',
  generatedAt: '2026-05-07T10:00:00.000Z',
  blockCount: 3,
};

describe('saveInsightReport', () => {
  it('creates new insight file and ensures parent folder', async () => {
    const { fakeApp, files, ops } = createFakeApp();
    await saveInsightReport(fakeApp, testReport);

    assert.ok(files.has('TraceMind/insights/2026-05-07.md'), 'File should be created');
    assert.ok(ops.some(o => o.startsWith('create:')), 'Should have create op');
  });

  it('overwrites existing same-date file via modify', async () => {
    const { fakeApp, files, ops } = createFakeApp();
    files.set('TraceMind/insights/2026-05-07.md', 'old content');

    await saveInsightReport(fakeApp, testReport);

    const content = files.get('TraceMind/insights/2026-05-07.md');
    assert.ok(content!.includes('Content here'), 'Content should be updated');
    assert.ok(ops.some(o => o.startsWith('modify:')), 'Should use modify');
  });

  it('does not touch other date files', async () => {
    const { fakeApp, files } = createFakeApp();
    files.set('TraceMind/insights/2026-05-06.md', 'yesterday');

    await saveInsightReport(fakeApp, testReport);

    assert.equal(files.get('TraceMind/insights/2026-05-06.md'), 'yesterday');
    assert.ok(files.has('TraceMind/insights/2026-05-07.md'));
  });

  it('generates correct file path', () => {
    assert.equal(insightFilePath('2026-05-07'), 'TraceMind/insights/2026-05-07.md');
  });
});

describe('Insight Writer - format/parse roundtrip', () => {
  it('formats and parses back', () => {
    const md = formatInsightMarkdown(testReport);
    const parsed = parseInsightMarkdown(md);
    assert.ok(parsed);
    assert.equal(parsed!.date, '2026-05-07');
    assert.equal(parsed!.blockCount, 3);
  });
});
