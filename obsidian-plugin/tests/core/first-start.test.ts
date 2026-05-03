import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isFirstStart, PROFILE_PATH, REQUIRED_DIRS } from '../../src/core/first-start-constants';

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
    assert.equal(PROFILE_PATH, 'Daily/PROFILE.md');
  });

  it('exports REQUIRED_DIRS constant', () => {
    assert.deepEqual(REQUIRED_DIRS, ['Daily', 'Person', 'Object', 'Theme']);
  });
});
