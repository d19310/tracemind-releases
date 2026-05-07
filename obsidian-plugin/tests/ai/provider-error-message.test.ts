import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatProviderTestError } from '../../src/ai/provider-error-message';

describe('formatProviderTestError', () => {
  it('detects invalid API key', () => {
    const result = formatProviderTestError(new Error('AI Provider 请求失败 (HTTP 401): Invalid API key'));
    assert.ok(result.includes('API Key'), `Expected API Key hint, got: ${result}`);
  });

  it('detects 401 authentication failure', () => {
    const result = formatProviderTestError(new Error('AI Provider 请求失败 (HTTP 401): Unauthorized'));
    assert.ok(result.includes('401'));
    assert.ok(result.includes('认证失败'));
  });

  it('detects model not found', () => {
    const result = formatProviderTestError(new Error('AI Provider 请求失败 (HTTP 404): model not found'));
    assert.ok(result.includes('模型'), `Expected model hint, got: ${result}`);
  });

  it('detects network fetch failure', () => {
    const result = formatProviderTestError(new Error('Failed to fetch'));
    assert.ok(result.includes('网络连接失败'), `Expected network hint, got: ${result}`);
  });

  it('detects Ollama connection refused', () => {
    const result = formatProviderTestError(new Error('Failed to fetch: connect ECONNREFUSED localhost:11434'));
    assert.ok(result.includes('Ollama'), `Expected Ollama hint, got: ${result}`);
  });

  it('handles unknown error gracefully', () => {
    const result = formatProviderTestError(new Error('Something unexpected happened'));
    assert.ok(result.includes('连接失败'), `Expected fallback, got: ${result}`);
  });

  it('handles non-Error input', () => {
    const result = formatProviderTestError('plain string error');
    assert.ok(result.includes('连接失败'));
  });

  it('truncates long messages', () => {
    const result = formatProviderTestError(new Error('x'.repeat(500)));
    assert.ok(result.length < 350, `Expected truncated, got ${result.length} chars`);
  });
});
