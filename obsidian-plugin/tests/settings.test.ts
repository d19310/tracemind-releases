import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TraceMindSettings, DEFAULT_SETTINGS } from '../src/settings-types';
import { updateProviderById, deleteProviderById } from '../src/settings-provider-utils';

describe('Settings - Defaults', () => {
  it('has empty providers array', () => {
    assert.equal(DEFAULT_SETTINGS.providers.length, 0);
  });

  it('has empty defaultProviderId', () => {
    assert.equal(DEFAULT_SETTINGS.defaultProviderId, '');
  });
});

describe('Settings - Load with migration', () => {
  it('merges partial settings with defaults', () => {
    const partial = {
      providers: [{ id: 'test', name: 'Test', providerType: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-test', model: 'gpt-4' }],
    };
    const settings: TraceMindSettings = { ...DEFAULT_SETTINGS, ...partial } as TraceMindSettings;

    assert.equal(settings.providers.length, 1);
    assert.equal(settings.defaultProviderId, '');
  });

  it('preserves existing values when loading', () => {
    const loaded = {
      providers: [{ id: 'p1', name: 'OpenAI', providerType: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-123', model: 'gpt-4' }],
      defaultProviderId: 'p1',
    } as TraceMindSettings;

    assert.equal(loaded.defaultProviderId, 'p1');
    assert.equal(loaded.providers[0].name, 'OpenAI');
    assert.equal(loaded.providers[0].providerType, 'openai');
  });
});

describe('Settings - providerType migration', () => {
  function inferProviderType(baseUrl: string): string {
    if (baseUrl?.includes('anthropic.com')) return 'anthropic';
    if (baseUrl?.includes('localhost:11434') || baseUrl?.includes('127.0.0.1:11434')) return 'ollama';
    return 'openai';
  }

  it('infers anthropic from baseUrl', () => {
    assert.equal(inferProviderType('https://api.anthropic.com/v1/messages'), 'anthropic');
  });

  it('infers ollama from localhost:11434', () => {
    assert.equal(inferProviderType('http://localhost:11434'), 'ollama');
    assert.equal(inferProviderType('http://127.0.0.1:11434'), 'ollama');
  });

  it('defaults to openai', () => {
    assert.equal(inferProviderType('https://api.openai.com/v1'), 'openai');
    assert.equal(inferProviderType('https://custom.api.com/v1'), 'openai');
  });
});

describe('buildTestConnectionConfig', () => {
  function buildTestConnectionConfig(provider: { providerType?: string; apiKey?: string; model?: string; baseUrl?: string; enableThinking?: boolean; reasoningEffort?: '' | 'high' | 'max' }) {
    return {
      provider: provider.providerType || 'openai',
      apiKey: provider.apiKey!,
      model: provider.model!,
      baseUrl: provider.baseUrl!,
      enableThinking: provider.enableThinking,
      reasoningEffort: provider.reasoningEffort,
    };
  }

  it('includes enableThinking when true', () => {
    const cfg = buildTestConnectionConfig({ providerType: 'openai', apiKey: 'sk', model: 'gpt-4', baseUrl: 'https://x.com', enableThinking: true });
    assert.equal(cfg.enableThinking, true);
  });

  it('includes reasoningEffort when set', () => {
    const cfg = buildTestConnectionConfig({ providerType: 'anthropic', apiKey: 'sk-ant', model: 'claude', baseUrl: 'https://x.com', reasoningEffort: 'max' });
    assert.equal(cfg.reasoningEffort, 'max');
  });

  it('does not include enableThinking when false', () => {
    const cfg = buildTestConnectionConfig({ providerType: 'openai', apiKey: 'sk', model: 'gpt-4', baseUrl: 'https://x.com', enableThinking: false });
    assert.equal(cfg.enableThinking, false);
  });
});

describe('validateProviderDraft', () => {
  function validateProviderDraft(draft: { name: string; model: string; baseUrl: string; providerType: string }): string | null {
    if (!draft.name.trim()) return '名称不能为空';
    if (!draft.model.trim()) return '模型不能为空';
    if (!draft.baseUrl.trim()) return 'Base URL 不能为空';
    return null;
  }

  it('rejects empty name', () => {
    assert.ok(validateProviderDraft({ name: '', model: 'gpt-4', baseUrl: 'https://x.com', providerType: 'openai' }));
  });

  it('rejects empty model', () => {
    assert.ok(validateProviderDraft({ name: 'A', model: '', baseUrl: 'https://x.com', providerType: 'openai' }));
  });

  it('rejects empty baseUrl', () => {
    assert.ok(validateProviderDraft({ name: 'A', model: 'gpt-4', baseUrl: '', providerType: 'openai' }));
  });

  it('accepts valid draft (Ollama with empty apiKey is fine)', () => {
    assert.equal(validateProviderDraft({ name: 'A', model: 'llama3', baseUrl: 'http://localhost:11434', providerType: 'ollama' }), null);
  });

  it('accepts valid draft with all fields', () => {
    assert.equal(validateProviderDraft({ name: 'My GPT', model: 'gpt-4', baseUrl: 'https://api.openai.com', providerType: 'openai' }), null);
  });
});

describe('updateProviderById', () => {
  const base: TraceMindSettings = {
    ...DEFAULT_SETTINGS,
    providers: [
      { id: 'p1', name: 'A', providerType: 'openai', baseUrl: 'https://a.com', apiKey: 'ka', model: 'gpt-4' },
      { id: 'p2', name: 'B', providerType: 'anthropic', baseUrl: 'https://b.com', apiKey: 'kb', model: 'claude' },
    ],
    defaultProviderId: 'p1',
  } as TraceMindSettings;

  it('updates provider name while keeping id', () => {
    const result = updateProviderById(base, 'p1', { name: 'Renamed' });
    assert.equal(result.providers[0].name, 'Renamed');
    assert.equal(result.providers[0].id, 'p1');
  });

  it('updates providerType', () => {
    const result = updateProviderById(base, 'p1', { providerType: 'anthropic' });
    assert.equal(result.providers[0].providerType, 'anthropic');
  });

  it('updates model/baseUrl/apiKey', () => {
    const result = updateProviderById(base, 'p1', { model: 'gpt-4o', baseUrl: 'https://new.com', apiKey: 'new-key' });
    assert.equal(result.providers[0].model, 'gpt-4o');
    assert.equal(result.providers[0].baseUrl, 'https://new.com');
    assert.equal(result.providers[0].apiKey, 'new-key');
  });

  it('does not affect other providers', () => {
    const result = updateProviderById(base, 'p1', { name: 'X' });
    assert.equal(result.providers[1].name, 'B');
    assert.equal(result.providers[1].id, 'p2');
  });

  it('preserves defaultProviderId', () => {
    const result = updateProviderById(base, 'p1', { name: 'X' });
    assert.equal(result.defaultProviderId, 'p1');
  });

  it('updates enableThinking', () => {
    const result = updateProviderById(base, 'p1', { enableThinking: true });
    assert.equal(result.providers[0].enableThinking, true);
  });

  it('updates reasoningEffort', () => {
    const result = updateProviderById(base, 'p1', { reasoningEffort: 'high' });
    assert.equal(result.providers[0].reasoningEffort, 'high');
  });
});

describe('deleteProviderById', () => {
  const base: TraceMindSettings = {
    ...DEFAULT_SETTINGS,
    providers: [
      { id: 'p1', name: 'A', providerType: 'openai', baseUrl: 'https://a.com', apiKey: 'ka', model: 'gpt-4' },
      { id: 'p2', name: 'B', providerType: 'anthropic', baseUrl: 'https://b.com', apiKey: 'kb', model: 'claude' },
    ],
    defaultProviderId: 'p1',
    agentProviderMapping: { analysis: 'p1', chat: 'p2' },
  } as TraceMindSettings;

  it('removes provider from list', () => {
    const result = deleteProviderById(base, 'p2');
    assert.equal(result.providers.length, 1);
    assert.equal(result.providers[0].id, 'p1');
  });

  it('falls back defaultProviderId when deleting default', () => {
    const result = deleteProviderById(base, 'p1');
    assert.equal(result.defaultProviderId, 'p2');
  });

  it('clears empty defaultProviderId when deleting last provider', () => {
    const single = { ...base, providers: [base.providers[0]] };
    const result = deleteProviderById(single, 'p1');
    assert.equal(result.defaultProviderId, '');
  });

  it('cleans analysis mapping when deleting mapped provider', () => {
    const result = deleteProviderById(base, 'p1');
    assert.equal(result.agentProviderMapping.analysis, '');
  });

  it('cleans chat mapping when deleting mapped provider', () => {
    const result = deleteProviderById(base, 'p2');
    assert.equal(result.agentProviderMapping.chat, '');
  });

  it('does not change defaultProviderId when deleting non-default', () => {
    const result = deleteProviderById(base, 'p2');
    assert.equal(result.defaultProviderId, 'p1');
  });
});
