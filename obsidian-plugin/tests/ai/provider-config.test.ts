import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  type AiProviderConfig, validateConfig, buildRequest, type ChatMessage, parseResponse,
  chat, streamChat, summarizeProviderErrorBody, extractStreamDelta,
} from '../../src/ai/provider-config';

// Store original fetch for restoration
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('AI Provider Config - Validation', () => {
  it('accepts a valid OpenAI config', () => {
    const result = validateConfig({ provider: 'openai', apiKey: 'sk-test123', model: 'gpt-4' });
    assert.equal(result.valid, true);
  });

  it('rejects config with missing apiKey (non-Ollama)', () => {
    const result = validateConfig({ provider: 'openai', model: 'gpt-4' });
    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('API Key'));
  });

  it('rejects config with missing model', () => {
    const result = validateConfig({ provider: 'anthropic', apiKey: 'sk-ant-test' });
    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('模型'));
  });

  it('accepts Ollama without apiKey', () => {
    const result = validateConfig({ provider: 'ollama', model: 'llama3' });
    assert.equal(result.valid, true);
  });

  it('rejects config with missing provider type', () => {
    const result = validateConfig({ provider: '' as any, apiKey: 'x', model: 'x' });
    assert.equal(result.valid, false);
  });
});

describe('AI Provider Config - Build Request', () => {
  it('builds OpenAI chat completion request', () => {
    const config: AiProviderConfig = { provider: 'openai', apiKey: 'sk-test123', model: 'gpt-4' };
    const req = buildRequest(config, [
      { role: 'system', content: '你是实体提取助手' },
      { role: 'user', content: '今天和李四开会' },
    ]);
    assert.equal(req.url, 'https://api.openai.com/v1/chat/completions');
    assert.equal(req.headers!['Authorization'], 'Bearer sk-test123');
  });

  it('builds Anthropic messages API request', () => {
    const config: AiProviderConfig = { provider: 'anthropic', apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6' };
    const req = buildRequest(config, [
      { role: 'system', content: '你是实体提取助手' },
      { role: 'user', content: '今天和李四开会' },
    ]);
    assert.equal(req.url, 'https://api.anthropic.com/v1/messages');
    assert.equal(req.headers!['x-api-key'], 'sk-ant-test');
    const body = JSON.parse(req.body as string);
    assert.equal(body.system, '你是实体提取助手');
  });
});

describe('AI Provider Config - Parse Response', () => {
  it('parses OpenAI chat completion response', () => {
    const result = parseResponse('openai', {
      choices: [{ message: { role: 'assistant', content: '提取到实体：李四' } }],
    });
    assert.equal(result.content, '提取到实体：李四');
  });

  it('throws on empty OpenAI response', () => {
    assert.throws(() => parseResponse('openai', { choices: [] }), {
      message: 'Empty response from OpenAI',
    });
  });
});

describe('summarizeProviderErrorBody', () => {
  it('extracts message from OpenAI-style JSON error', () => {
    const body = JSON.stringify({ error: { message: 'Invalid API key' } });
    assert.equal(summarizeProviderErrorBody(body), 'Invalid API key');
  });

  it('extracts message from Anthropic-style JSON error', () => {
    const body = JSON.stringify({ error: { message: 'invalid x-api-key' } });
    assert.equal(summarizeProviderErrorBody(body), 'invalid x-api-key');
  });

  it('extracts message from simple { message } JSON', () => {
    const body = JSON.stringify({ message: 'Something went wrong' });
    assert.equal(summarizeProviderErrorBody(body), 'Something went wrong');
  });

  it('returns empty for non-standard JSON without message', () => {
    const body = JSON.stringify({ code: 500 });
    assert.equal(summarizeProviderErrorBody(body), '(empty response)');
  });

  it('truncates plain text to 200 chars', () => {
    const long = 'x'.repeat(500);
    const result = summarizeProviderErrorBody(long);
    assert.ok(result.length <= 200);
  });

  it('handles empty string', () => {
    assert.equal(summarizeProviderErrorBody(''), '(empty response)');
  });

  it('truncates long JSON error message to 200 chars', () => {
    const longMsg = 'x'.repeat(500);
    const body = JSON.stringify({ error: { message: longMsg } });
    const result = summarizeProviderErrorBody(body);
    // Should be at most 200 chars, not the full 500
    assert.ok(result.length <= 200);
    // Should start with x but be shorter than the original
    assert.ok(result.length < 400);
  });

  it('masks sk- API key in error message', () => {
    const body = JSON.stringify({ error: { message: 'Invalid key: sk-abc123def456ghi789jkl012mno345pqr678stu' } });
    const result = summarizeProviderErrorBody(body);
    assert.ok(!result.includes('sk-abc123'));
    assert.ok(result.includes('sk-***'));
  });

  it('masks Bearer token in plain text error', () => {
    const result = summarizeProviderErrorBody('Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0');
    assert.ok(!result.includes('eyJhbGciOi'));
    assert.ok(result.includes('Bearer ***'));
  });

  it('handles non-standard JSON without message gracefully', () => {
    const body = JSON.stringify({ code: 500, detail: 'error' });
    const result = summarizeProviderErrorBody(body);
    assert.equal(result, '(empty response)');
  });

  it('truncates plain text to 200 chars including masking', () => {
    const long = 'Error: ' + 'x'.repeat(500);
    const result = summarizeProviderErrorBody(long);
    assert.ok(result.length <= 200);
  });
});

describe('buildRequest - enableThinking / reasoningEffort', () => {
  it('OpenAI default config does not include reasoning_effort', () => {
    const req = buildRequest({ provider: 'openai', apiKey: 'sk', model: 'gpt-4' }, []);
    const body = JSON.parse(req.body!);
    assert.equal(body.reasoning_effort, undefined);
  });

  it('OpenAI reasoningEffort: high adds reasoning_effort to body', () => {
    const req = buildRequest({ provider: 'openai', apiKey: 'sk', model: 'gpt-4', reasoningEffort: 'high' }, []);
    const body = JSON.parse(req.body!);
    assert.equal(body.reasoning_effort, 'high');
  });

  it('OpenAI enableThinking: true without effort defaults to high', () => {
    const req = buildRequest({ provider: 'openai', apiKey: 'sk', model: 'gpt-4', enableThinking: true }, []);
    const body = JSON.parse(req.body!);
    assert.equal(body.reasoning_effort, 'high');
  });

  it('Ollama enableThinking adds reasoning_effort to OpenAI-compatible body', () => {
    const req = buildRequest({ provider: 'ollama', model: 'llama3', reasoningEffort: 'max' }, []);
    const body = JSON.parse(req.body!);
    assert.equal(body.reasoning_effort, 'max');
  });

  it('Anthropic default config does not include thinking', () => {
    const req = buildRequest({ provider: 'anthropic', apiKey: 'sk-ant', model: 'claude' }, []);
    const body = JSON.parse(req.body!);
    assert.equal(body.thinking, undefined);
  });

  it('Anthropic enableThinking: true adds thinking adaptive', () => {
    const req = buildRequest({ provider: 'anthropic', apiKey: 'sk-ant', model: 'claude', enableThinking: true }, []);
    const body = JSON.parse(req.body!);
    assert.deepEqual(body.thinking, { type: 'adaptive', effort: 'high' });
  });

  it('Anthropic reasoningEffort: max uses max effort', () => {
    const req = buildRequest({ provider: 'anthropic', apiKey: 'sk-ant', model: 'claude', reasoningEffort: 'max' }, []);
    const body = JSON.parse(req.body!);
    assert.deepEqual(body.thinking, { type: 'adaptive', effort: 'max' });
  });
});

describe('streamChat preserves reasoning in body', () => {
  it('streamChat includes reasoning_effort with stream: true for OpenAI', async () => {
    let capturedBody: any;
    globalThis.fetch = ((_u: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(new Response(
        'data: {"choices":[{"delta":{"content":"hi"}}]}\n\ndata: [DONE]\n',
        { status: 200 },
      ));
    }) as any;

    let doneText = '';
    await streamChat([{ role: 'user', content: 'hi' }],
      { provider: 'openai', apiKey: 'sk', model: 'gpt-4', reasoningEffort: 'high' },
      { onDelta: () => {}, onDone: (t) => { doneText = t; }, onError: () => {} },
    );
    assert.equal(capturedBody!.stream, true);
    assert.equal(capturedBody!.reasoning_effort, 'high');
  });
});

describe('chat() HTTP error safe summary', () => {
  it('throws safe summary on 401, not full body', async () => {
    const errorBody = JSON.stringify({ error: { message: 'Invalid API key: sk-abc123def456ghi789jkl012mno345pqr678stu' } });
    globalThis.fetch = (() => Promise.resolve(new Response(errorBody, { status: 401 }))) as any;

    try {
      await chat([{ role: 'user', content: 'hi' }], { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4' });
      assert.fail('Should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      assert.ok(msg.includes('HTTP 401'), `Expected HTTP 401 in: ${msg}`);
      assert.ok(msg.includes('Invalid API key'), `Expected "Invalid API key" in: ${msg}`);
      assert.ok(!msg.includes('sk-abc123'), `Should mask secret, got: ${msg}`);
    }
  });

  it('throws safe summary on 500 without full body', async () => {
    const longBody = 'Internal error: ' + 'x'.repeat(500);
    globalThis.fetch = (() => Promise.resolve(new Response(longBody, { status: 500 }))) as any;

    try {
      await chat([{ role: 'user', content: 'hi' }], { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4' });
      assert.fail('Should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      assert.ok(msg.includes('HTTP 500'), `Expected HTTP 500 in: ${msg}`);
      assert.ok(msg.length < 400, `Error message too long: ${msg.length} chars`);
    }
  });
});

describe('streamChat() HTTP error safe summary', () => {
  it('calls onError with safe summary on 401', async () => {
    const errorBody = JSON.stringify({ error: { message: 'invalid x-api-key' } });
    globalThis.fetch = (() => Promise.resolve(new Response(errorBody, { status: 401 }))) as any;

    let errorMsg = '';
    await streamChat(
      [{ role: 'user', content: 'hi' }],
      { provider: 'anthropic', apiKey: 'sk-ant-test', model: 'claude' },
      {
        onDelta: () => {},
        onDone: () => {},
        onError: (e) => { errorMsg = e.message; },
      },
    );
    assert.ok(errorMsg.includes('HTTP 401'), `Expected HTTP 401 in: ${errorMsg}`);
    assert.ok(errorMsg.includes('invalid x-api-key'), `Expected error detail in: ${errorMsg}`);
  });
});

describe('chat() with validateConfig', () => {
  it('throws validation error without calling fetch on invalid config', async () => {
    let fetchCalled = false;
    globalThis.fetch = (() => { fetchCalled = true; return Promise.resolve(new Response('{}')); }) as any;

    try {
      await chat([{ role: 'user', content: 'hi' }], { provider: 'openai', model: 'gpt-4' });
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok((e as Error).message.includes('API Key'));
    }
    assert.equal(fetchCalled, false);
  });

  it('succeeds with valid config', async () => {
    globalThis.fetch = (() => Promise.resolve(new Response(
      JSON.stringify({ choices: [{ message: { role: 'assistant', content: 'Hello' } }] }),
      { status: 200 },
    ))) as any;

    const result = await chat([{ role: 'user', content: 'hi' }], {
      provider: 'openai', apiKey: 'sk-test', model: 'gpt-4',
    });
    assert.equal(result.content, 'Hello');
  });
});

describe('streamChat() with validateConfig', () => {
  it('calls onError on invalid config, does not fetch', async () => {
    let fetchCalled = false;
    globalThis.fetch = (() => { fetchCalled = true; return Promise.resolve(new Response('{}')); }) as any;

    let errorMsg = '';
    await streamChat(
      [{ role: 'user', content: 'hi' }],
      { provider: 'openai', model: 'gpt-4' },
      {
        onDelta: () => {},
        onDone: () => {},
        onError: (e) => { errorMsg = e.message; },
      },
    );
    assert.ok(errorMsg.includes('API Key'));
    assert.equal(fetchCalled, false);
  });
});
