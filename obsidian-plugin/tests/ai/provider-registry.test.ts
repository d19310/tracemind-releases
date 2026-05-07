import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createProviderRegistry } from '../../src/ai/provider-registry';
import { DEFAULT_SETTINGS } from '../../src/settings-types';

describe('Provider Registry', () => {
  it('returns null default provider when no providers configured', () => {
    const registry = createProviderRegistry(DEFAULT_SETTINGS);
    assert.equal(registry.getDefaultProvider(), null);
  });

  it('returns null when defaultProviderId is empty', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      providers: [{
        id: 'p1',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-test',
        model: 'gpt-4',
      }],
      defaultProviderId: '',
    };
    const registry = createProviderRegistry(settings);
    assert.equal(registry.getDefaultProvider(), null);
  });

  it('returns default provider when configured', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      providers: [{
        id: 'p1',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-test',
        model: 'gpt-4',
      }],
      defaultProviderId: 'p1',
    };
    const registry = createProviderRegistry(settings);
    const provider = registry.getDefaultProvider();

    assert.ok(provider);
    assert.equal(provider!.id, 'p1');
    assert.equal(provider!.model, 'gpt-4');
  });

  it('gets provider by ID', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      providers: [
        { id: 'p1', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-1', model: 'gpt-4' },
        { id: 'p2', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiKey: 'sk-2', model: 'claude' },
      ],
      defaultProviderId: 'p1',
    };
    const registry = createProviderRegistry(settings);

    assert.equal(registry.getProviderById('p2')!.name, 'Anthropic');
    assert.equal(registry.getProviderById('nonexistent'), null);
  });

  it('isReady returns true when provider has apiKey and baseUrl', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      providers: [{
        id: 'p1',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-test',
        model: 'gpt-4',
      }],
      defaultProviderId: 'p1',
    };
    const registry = createProviderRegistry(settings);
    assert.equal(registry.isReady(), true);
  });

  it('isReady returns false when apiKey is missing', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      providers: [{
        id: 'p1',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4',
      }],
      defaultProviderId: 'p1',
    };
    const registry = createProviderRegistry(settings);
    assert.equal(registry.isReady(), false);
  });
});
