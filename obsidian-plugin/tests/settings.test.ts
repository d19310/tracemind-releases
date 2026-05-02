import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TraceMindSettings, DEFAULT_SETTINGS } from '../src/settings';

describe('Settings - Defaults', () => {
  it('has empty providers array', () => {
    assert.equal(DEFAULT_SETTINGS.providers.length, 0);
  });

  it('has default vault structure', () => {
    assert.equal(DEFAULT_SETTINGS.vaultRoot, 'TraceMindVault');
  });
});

describe('Settings - Load with migration', () => {
  it('merges partial settings with defaults', () => {
    const partial = { providers: [{ id: 'test', name: 'Test', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-test', model: 'gpt-4' }] };
    const settings: TraceMindSettings = { ...DEFAULT_SETTINGS, ...partial };

    assert.equal(settings.providers.length, 1);
    assert.equal(settings.vaultRoot, 'TraceMindVault');
    assert.equal(settings.defaultProviderId, '');
  });

  it('preserves existing values when loading', () => {
    const loaded: TraceMindSettings = {
      providers: [{ id: 'p1', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-123', model: 'gpt-4' }],
      vaultRoot: 'MyVault',
      defaultProviderId: 'p1',
    };

    assert.equal(loaded.vaultRoot, 'MyVault');
    assert.equal(loaded.defaultProviderId, 'p1');
  });
});
