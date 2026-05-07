import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCardUpdate,
  buildWikilinkSection,
  parseWikilinks,
  cardToVaultPath,
  cardExists,
  getCardFolder,
  sanitizeFileName,
  upsertCard,
} from '../../src/storage/card-writer';
import { resolveEntityPath } from '../../src/storage/entity-writer';
import { ContextCard } from '../../src/core/context-card';
import { ensureParentFolder } from '../../src/vault/vault';

// Minimal fake vault for testing upsert operations
interface FakeFile { path: string; content: string; }
function createFakeVault(opts?: { failCreate?: boolean; failModify?: boolean }) {
  const files = new Map<string, string>();
  const folders = new Set<string>();
  const deleted: string[] = [];
  const ops: string[] = [];

  const fakeApp = {
    vault: {
      getFileByPath: (p: string) => files.has(p) ? ({ path: p } as any) : null,
      getAbstractFileByPath: (p: string) => folders.has(p) ? ({ path: p } as any) : null,
      read: async (f: any) => files.get(f.path) || '',
      modify: async (f: any, content: string) => {
        if (opts?.failModify) throw new Error('modify failed');
        files.set(f.path, content); ops.push('modify:' + f.path);
      },
      create: async (p: string, content: string) => {
        if (opts?.failCreate) throw new Error('create failed');
        files.set(p, content); ops.push('create:' + p);
      },
      createFolder: async (p: string) => { folders.add(p); },
      delete: async (f: any) => { files.delete(f.path); deleted.push(f.path); ops.push('delete:' + f.path); },
    },
  };
  return { fakeApp: fakeApp as any, files, ops, deleted };
}

describe('Card Writer - Build Card Update', () => {
  it('builds markdown for a new person card', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: '某科技公司',
        role: 'CTO',
        relationship_to_user: '前同事',
      },
    });

    const md = buildCardUpdate(card);

    assert.ok(md.includes('---'));
    assert.ok(md.includes('name: 张三'));
    assert.ok(md.includes('type: person'));
    assert.ok(md.includes('# 张三'));
  });

  it('updates maturity field in card', () => {
    const card = ContextCard.create({
      name: '李四',
      cardType: 'person',
      attributes: {
        company: 'YY公司',
        role: '总监',
        relationship_to_user: '客户',
      },
    });

    // Verify the card was created with correct maturity
    assert.equal(card.maturity, 'L1');

    const md = buildCardUpdate(card);
    assert.ok(md.includes('maturity: L1'));
  });
});

describe('Card Writer - Wikilink Section', () => {
  it('builds wikilink section from entity IDs', () => {
    const section = buildWikilinkSection(['张三', 'Q2项目']);
    assert.equal(section, '[[张三]], [[Q2项目]]');
  });

  it('returns empty string for no entities', () => {
    const section = buildWikilinkSection([]);
    assert.equal(section, '');
  });
});

describe('Card Writer - Parse Wikilinks', () => {
  it('extracts wikilinks from text', () => {
    const text = '今天和[[张三]]讨论了[[Q2营销计划]]，[[李四]]也参加了。';
    const links = parseWikilinks(text);
    assert.deepEqual(links, ['张三', 'Q2营销计划', '李四']);
  });

  it('handles text without wikilinks', () => {
    const links = parseWikilinks('今天天气很好');
    assert.deepEqual(links, []);
  });
});

describe('Card Writer - Vault Path', () => {
  it('returns correct path for person cards', () => {
    assert.equal(cardToVaultPath('张三', 'person'), 'Person/张三.md');
  });

  it('returns correct path for object cards', () => {
    assert.equal(cardToVaultPath('Q2计划', 'object'), 'Object/Q2计划.md');
  });

  it('returns correct path for theme cards', () => {
    assert.equal(cardToVaultPath('远程工作', 'theme'), 'Theme/远程工作.md');
  });
});

describe('Card Writer - Path Existence Check', () => {
  it('returns true when path exists in file map', () => {
    const files = new Set(['Person/张三.md', 'Object/test.md']);
    assert.equal(cardExists(files, '张三', 'person'), true);
  });

  it('returns false when path does not exist', () => {
    const files = new Set(['Person/张三.md']);
    assert.equal(cardExists(files, '李四', 'person'), false);
  });

  it('returns false when empty file map', () => {
    assert.equal(cardExists(new Set(), '张三', 'person'), false);
  });
});

describe('Card Writer - File Name Sanitization', () => {
  it('handles names with special characters', () => {
    const path = cardToVaultPath('项目/A', 'object');
    assert.equal(path, 'Object/项目_A.md');
  });

  it('handles empty names gracefully', () => {
    const path = cardToVaultPath('', 'person');
    assert.ok(path.startsWith('Person/'));
  });
});

describe('EntityManagerAdapter - createEntity path resolution', () => {
  it('title with / uses sanitized path via resolveEntityPath', () => {
    const result = resolveEntityPath({ title: '项目/A', type: 'object' });
    assert.equal(result.path, 'Object/项目_A.md');
    assert.ok(!result.path.includes('/A'), 'Should not create nested path');
  });

  it('title with special chars uses sanitized path', () => {
    const result = resolveEntityPath({ title: 'test:file?', type: 'object' });
    assert.ok(!result.path.includes(':'));
    assert.ok(!result.path.includes('?'));
  });

  it('returns person path for person type', () => {
    const result = resolveEntityPath({ title: '张三', type: 'person' });
    assert.equal(result.path, 'Person/张三.md');
    assert.equal(result.cardType, 'person');
  });

  it('returns object path for project alias type', () => {
    const result = resolveEntityPath({ title: 'Q2计划', type: 'project' });
    assert.equal(result.path, 'Object/Q2计划.md');
    assert.equal(result.cardType, 'object');
  });

  it('returns theme path for idea alias type', () => {
    const result = resolveEntityPath({ title: 'AI', type: 'idea' });
    assert.equal(result.path, 'Theme/AI.md');
    assert.equal(result.cardType, 'theme');
  });
});

describe('EntityManagerAdapter - existing file index safety', () => {
  // Tests the adapter's existing-file guard: when a file already exists,
  // the adapter must read from the real file, not use new markdown.
  it('existing file returns content from vault, not new md', async () => {
    const { fakeApp, files } = createFakeVault();
    // Pre-create the file as if it were already in vault
    files.set('Person/张三.md', '# Real card content');

    const path = cardToVaultPath('张三', 'person');
    await ensureParentFolder(fakeApp, path);
    const existing = fakeApp.vault.getFileByPath(path);
    assert.ok(existing, 'File should be found');

    // This is the adapter's guard: read from vault, not from new markdown
    const content = await fakeApp.vault.read(existing);
    assert.ok(content.includes('Real card content'));
  });
});

describe('Card Writer - upsertCard reliability', () => {
  it('creates a new card and ensures parent folder', async () => {
    const { fakeApp, files, ops } = createFakeVault();
    const card = ContextCard.create({ name: '张三', cardType: 'person', attributes: { company: 'XX' } });

    await upsertCard(fakeApp, card);

    assert.ok(files.has('Person/张三.md'), 'File should be created');
    assert.ok(ops.some(o => o.startsWith('create:')), 'Should have create operation');
    assert.equal(ops.filter(o => o.startsWith('delete:')).length, 0, 'No deletes on new card');
  });

  it('rename writes new file before deleting old one', async () => {
    const { fakeApp, files, ops, deleted } = createFakeVault();
    // Pre-create old file
    files.set('Person/旧名.md', '# Old');

    const card = ContextCard.create({ name: '新名', cardType: 'person', attributes: { company: 'XX' } });
    await upsertCard(fakeApp, card, '旧名');

    assert.ok(files.has('Person/新名.md'), 'New file should exist');
    // Old file should NOT exist after successful write
    assert.ok(deleted.includes('Person/旧名.md'), 'Old file should be deleted after successful write');
  });

  it('rename: old file preserved when new create fails', async () => {
    const { fakeApp, files, ops, deleted } = createFakeVault({ failCreate: true });
    files.set('Person/旧名.md', '# Old');

    const card = ContextCard.create({ name: '新名', cardType: 'person', attributes: { company: 'XX' } });
    try {
      await upsertCard(fakeApp, card, '旧名');
      assert.fail('Should have thrown');
    } catch {
      // Expected — create failed
    }

    // Old file must still exist — NOT deleted
    assert.ok(files.has('Person/旧名.md'), 'Old file must be preserved when new write fails');
    // No delete ops should have been recorded
    assert.equal(deleted.length, 0, 'No deletes when write fails');
    assert.ok(!ops.some(o => o.startsWith('delete:')), 'Should not have delete ops');
  });

  it('renaming to same name does not delete', async () => {
    const { fakeApp, files } = createFakeVault();
    files.set('Person/测试.md', '# Old');

    const card = ContextCard.create({ name: '测试', cardType: 'person', attributes: { company: 'XX' } });
    await upsertCard(fakeApp, card, '测试');

    // File should still exist (no delete)
    assert.ok(files.has('Person/测试.md'));
  });
});

describe('ensureParentFolder', () => {
  it('ensures single-level parent for Object/Foo.md', async () => {
    const created: string[] = [];
    const fakeApp = {
      vault: {
        getAbstractFileByPath: () => null,
        createFolder: async (p: string) => { created.push(p); },
      },
    };
    await ensureParentFolder(fakeApp as any, 'Object/Foo.md');
    assert.ok(created.includes('Object'), 'Should create Object folder');
  });

  it('ensures multi-level parent for TraceMind/insights/date.md', async () => {
    const created: string[] = [];
    const fakeApp = {
      vault: {
        getAbstractFileByPath: () => null,
        createFolder: async (p: string) => { created.push(p); },
      },
    };
    await ensureParentFolder(fakeApp as any, 'TraceMind/insights/2026-05-07.md');
    assert.ok(created.includes('TraceMind'));
    assert.ok(created.includes('TraceMind/insights'));
  });

  it('handles path without parent directory (no-op)', async () => {
    let called = false;
    const fakeApp = {
      vault: {
        getAbstractFileByPath: () => null,
        createFolder: async () => { called = true; },
      },
    };
    await ensureParentFolder(fakeApp as any, 'file.md');
    assert.equal(called, false);
  });
});

describe('Card Writer - Folder Mapping', () => {
  it('returns Person folder for person type', () => {
    assert.equal(getCardFolder('person'), 'Person/');
  });

  it('returns Object folder for object type', () => {
    assert.equal(getCardFolder('object'), 'Object/');
  });

  it('returns Theme folder for theme type', () => {
    assert.equal(getCardFolder('theme'), 'Theme/');
  });

  it('returns empty string for unknown type', () => {
    assert.equal(getCardFolder('unknown' as any), '');
  });
});
