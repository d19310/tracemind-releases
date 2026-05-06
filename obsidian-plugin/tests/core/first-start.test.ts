import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFirstStart,
  PROFILE_PATH,
  REQUIRED_DIRS,
  getMissingFirstStartItems,
} from '../../src/core/first-start-constants';
import type { VaultAccess } from '../../src/core/first-start-constants';

describe('First-Start Wizard', () => {
  it('detects first start when PROFILE.md does not exist (null return)', async () => {
    const mockVault = {
      stat: async (_path: string) => null,
    };

    const result = await isFirstStart(mockVault);
    assert.equal(result, true);
  });

  it('detects first start when stat throws', async () => {
    const mockVault = {
      stat: async (_path: string) => {
        throw new Error('File not found');
      },
    };

    const result = await isFirstStart(mockVault);
    assert.equal(result, true);
  });

  it('detects existing profile and skips wizard', async () => {
    const mockVault = {
      stat: async (_path: string) => ({ type: 'file' }),
    };

    const result = await isFirstStart(mockVault);
    assert.equal(result, false);
  });

  it('exports PROFILE_PATH constant', () => {
    assert.equal(PROFILE_PATH, 'TraceMind/PROFILE.md');
  });

  it('exports REQUIRED_DIRS constant', () => {
    assert.deepEqual(REQUIRED_DIRS, [
      'Daily',
      'Person',
      'Object',
      'Theme',
      'TraceMind',
      'TraceMind/sessions',
      'TraceMind/index',
      'TraceMind/insights',
    ]);
  });
});

describe('getMissingFirstStartItems', () => {
  function vaultWith(allPresent: boolean): VaultAccess {
    return {
      exists: () => allPresent,
    };
  }

  function vaultMissing(...absentPaths: string[]): VaultAccess {
    return {
      exists: (path: string) => !absentPaths.includes(path),
    };
  }

  it('returns empty array when all directories and PROFILE.md exist', () => {
    const vault = vaultWith(true);
    const missing = getMissingFirstStartItems(vault);
    assert.deepEqual(missing, []);
  });

  it('reports missing directory', () => {
    const vault = vaultMissing('Daily');
    const missing = getMissingFirstStartItems(vault);
    assert.ok(missing.includes('目录: Daily'), `Expected to include "目录: Daily", got: ${JSON.stringify(missing)}`);
  });

  it('reports missing PROFILE.md', () => {
    const vault = vaultMissing(PROFILE_PATH);
    const missing = getMissingFirstStartItems(vault);
    assert.ok(
      missing.includes(`档案: ${PROFILE_PATH}`),
      `Expected to include "档案: ${PROFILE_PATH}", got: ${JSON.stringify(missing)}`
    );
  });

  it('reports multiple missing items', () => {
    const vault = vaultMissing('Daily', 'TraceMind/sessions', PROFILE_PATH);
    const missing = getMissingFirstStartItems(vault);
    assert.equal(missing.length, 3);
    assert.ok(missing.includes('目录: Daily'));
    assert.ok(missing.includes('目录: TraceMind/sessions'));
    assert.ok(missing.includes(`档案: ${PROFILE_PATH}`));
  });

  it('reports only missing items (not present items)', () => {
    // Only Daily is missing, everything else exists
    const vault = vaultMissing('Daily');
    const missing = getMissingFirstStartItems(vault);
    assert.equal(missing.length, 1);
    // Person should NOT be in the list since it exists
    assert.ok(!missing.some(m => m.includes('Person')));
  });

  it('returns empty when PROFILE.md exists but some business dirs are missing', () => {
    // PROFILE.md exists — isFirstStart would return false, but
    // getMissingFirstStartItems still reports structural gaps
    const vault = vaultMissing('Daily', 'Person');
    const missing = getMissingFirstStartItems(vault);
    assert.equal(missing.length, 2);
  });
});

describe('Directory Integrity Validation', () => {
  it('REQUIRED_DIRS includes all needed subdirectories', () => {
    assert.ok(REQUIRED_DIRS.includes('TraceMind'));
    assert.ok(REQUIRED_DIRS.includes('TraceMind/sessions'));
    assert.ok(REQUIRED_DIRS.includes('TraceMind/index'));
    assert.ok(REQUIRED_DIRS.includes('TraceMind/insights'));
    assert.ok(REQUIRED_DIRS.includes('Daily'));
    assert.ok(REQUIRED_DIRS.includes('Person'));
    assert.ok(REQUIRED_DIRS.includes('Object'));
    assert.ok(REQUIRED_DIRS.includes('Theme'));
  });

  it('REQUIRED_DIRS has no duplicates', () => {
    const unique = new Set(REQUIRED_DIRS);
    assert.equal(unique.size, REQUIRED_DIRS.length);
  });

  it('PROFILE_PATH is not in REQUIRED_DIRS (it is a file)', () => {
    assert.ok(!REQUIRED_DIRS.includes(PROFILE_PATH));
  });

  it('all required paths use forward slashes', () => {
    for (const dir of REQUIRED_DIRS) {
      assert.ok(!dir.includes('\\'), `"${dir}" must use forward slashes`);
    }
    assert.ok(PROFILE_PATH.includes('/'));
    assert.ok(!PROFILE_PATH.includes('\\'));
  });
});
