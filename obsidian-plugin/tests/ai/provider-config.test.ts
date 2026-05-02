import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AiProviderConfig, validateConfig, buildRequest, ChatMessage, parseResponse } from '../../src/ai/provider-config';

describe('AI Provider Config - Validation', () => {
  it('accepts a valid OpenAI config', () => {
    const config: AiProviderConfig = {
      provider: 'openai',
      apiKey: 'sk-test123',
      model: 'gpt-4',
    };

    const result = validateConfig(config);

    assert.equal(result.valid, true);
  });

  it('rejects config with missing apiKey', () => {
    const config: AiProviderConfig = {
      provider: 'openai',
      model: 'gpt-4',
    };

    const result = validateConfig(config);

    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('apiKey'));
  });

  it('rejects config with missing model', () => {
    const config: AiProviderConfig = {
      provider: 'anthropic',
      apiKey: 'sk-ant-test',
    };

    const result = validateConfig(config);

    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('model'));
  });
});

describe('AI Provider Config - Build Request', () => {
  it('builds OpenAI chat completion request', () => {
    const config: AiProviderConfig = {
      provider: 'openai',
      apiKey: 'sk-test123',
      model: 'gpt-4',
    };
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是实体提取助手' },
      { role: 'user', content: '今天和李四开会' },
    ];

    const req = buildRequest(config, messages);

    assert.equal(req.url, 'https://api.openai.com/v1/chat/completions');
    assert.equal(req.headers!['Authorization'], 'Bearer sk-test123');
    assert.equal(req.headers!['Content-Type'], 'application/json');
    assert.deepStrictEqual(JSON.parse(req.body as string), {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是实体提取助手' },
        { role: 'user', content: '今天和李四开会' },
      ],
    });
  });

  it('builds Anthropic messages API request', () => {
    const config: AiProviderConfig = {
      provider: 'anthropic',
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-6',
    };
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是实体提取助手' },
      { role: 'user', content: '今天和李四开会' },
    ];

    const req = buildRequest(config, messages);

    assert.equal(req.url, 'https://api.anthropic.com/v1/messages');
    assert.equal(req.headers!['x-api-key'], 'sk-ant-test');
    assert.equal(req.headers!['anthropic-version'], '2023-06-01');
    assert.equal(req.headers!['Content-Type'], 'application/json');
    const body = JSON.parse(req.body as string);
    assert.equal(body.model, 'claude-sonnet-4-6');
    assert.equal(body.system, '你是实体提取助手');
    assert.deepStrictEqual(body.messages, [
      { role: 'user', content: '今天和李四开会' },
    ]);
  });
});

describe('AI Provider Config - Parse Response', () => {
  it('parses OpenAI chat completion response', () => {
    const body = {
      choices: [{ message: { role: 'assistant', content: '提取到实体：李四（人物）' } }],
    };

    const result = parseResponse('openai', body);

    assert.equal(result.content, '提取到实体：李四（人物）');
    assert.equal(result.role, 'assistant');
  });

  it('parses Anthropic messages response', () => {
    const body = {
      content: [{ type: 'text', text: '提取到实体：张三（人物）、项目A（对象）' }],
      role: 'assistant',
    };

    const result = parseResponse('anthropic', body);

    assert.equal(result.content, '提取到实体：张三（人物）、项目A（对象）');
    assert.equal(result.role, 'assistant');
  });

  it('throws on empty OpenAI response', () => {
    const body = { choices: [] };

    assert.throws(() => parseResponse('openai', body), {
      message: 'Empty response from OpenAI',
    });
  });
});
