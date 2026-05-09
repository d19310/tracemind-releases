import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getVaultStructureIssues, decideStartupAction, PROFILE_PATH, REQUIRED_DIRS,
  type VaultStructureAccess,
} from '../../src/core/first-start-constants';

function vaultWith(entries: Map<string, 'folder' | 'file'>): VaultStructureAccess {
  return { getType: (p: string) => entries.get(p) || null };
}

describe('getVaultStructureIssues', () => {
  it('returns empty array when all dirs and PROFILE exist', () => {
    const m = new Map<string, 'folder' | 'file'>();
    for (const d of REQUIRED_DIRS) m.set(d, 'folder');
    m.set(PROFILE_PATH, 'file');
    assert.deepEqual(getVaultStructureIssues(vaultWith(m)), []);
  });

  it('returns missing_dir when directory is absent', () => {
    const issues = getVaultStructureIssues(vaultWith(new Map()));
    assert.ok(issues.some(i => i.type === 'missing_dir' && i.path === 'Daily'));
    assert.ok(issues.some(i => i.repairable));
  });

  it('returns missing_file when PROFILE.md is absent', () => {
    const m = new Map<string, 'folder' | 'file'>();
    for (const d of REQUIRED_DIRS) m.set(d, 'folder');
    const issues = getVaultStructureIssues(vaultWith(m));
    assert.ok(issues.some(i => i.type === 'missing_file' && i.path === PROFILE_PATH && i.repairable));
  });

  it('returns wrong_type when dir path is a file', () => {
    const m = new Map<string, 'folder' | 'file'>();
    for (const d of REQUIRED_DIRS) m.set(d, 'folder');
    m.set('Daily', 'file'); // wrong type
    m.set(PROFILE_PATH, 'file');
    const issues = getVaultStructureIssues(vaultWith(m));
    assert.ok(issues.some(i => i.type === 'wrong_type' && i.path === 'Daily' && !i.repairable));
  });

  it('returns wrong_type when PROFILE.md is a folder', () => {
    const m = new Map<string, 'folder' | 'file'>();
    for (const d of REQUIRED_DIRS) m.set(d, 'folder');
    m.set(PROFILE_PATH, 'folder');
    const issues = getVaultStructureIssues(vaultWith(m));
    assert.ok(issues.some(i => i.type === 'wrong_type' && i.path === PROFILE_PATH && !i.repairable));
  });

  it('does not report extra files as issues', () => {
    const m = new Map<string, 'folder' | 'file'>();
    for (const d of REQUIRED_DIRS) m.set(d, 'folder');
    m.set(PROFILE_PATH, 'file');
    m.set('extra.md', 'file');
    m.set('ExtraDir', 'folder');
    assert.deepEqual(getVaultStructureIssues(vaultWith(m)), []);
  });
});

describe('decideStartupAction', () => {
  it('first start returns first_start regardless of issues', () => {
    const result = decideStartupAction(true, [{ type: 'missing_dir', path: 'Daily', expected: 'folder', label: '', repairable: true }]);
    assert.equal(result.kind, 'first_start');
  });

  it('non-first + no issues returns continue', () => {
    assert.equal(decideStartupAction(false, []).kind, 'continue');
  });

  it('non-first + issues returns prompt_repair', () => {
    const result = decideStartupAction(false, [{ type: 'missing_dir', path: 'Daily', expected: 'folder', label: '', repairable: true }]);
    assert.equal(result.kind, 'prompt_repair');
    if (result.kind === 'prompt_repair') assert.equal(result.issues.length, 1);
  });
});
