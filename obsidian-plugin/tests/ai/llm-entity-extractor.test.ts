import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildExtractionPrompt, parseLLMResponse, extractEntitiesWithLLM } from '../../src/ai/llm-entity-extractor';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function mockEntityResponse() {
  return JSON.stringify({
    choices: [{ message: { role: 'assistant', content: JSON.stringify({ domain: '工作', entities: [{ name: '张三', type: 'person', confidence: 0.9 }] }) } }],
  });
}

function mockAnthropicResponse() {
  return JSON.stringify({
    content: [{ type: 'text', text: JSON.stringify({ domain: '工作', entities: [{ name: '张三', type: 'person', confidence: 0.9 }] }) }],
    role: 'assistant',
  });
}

describe('LLM Entity Extractor - Prompt Builder', () => {
  it('includes system instructions and diary text in prompt', () => {
    const diary = '今天和张三讨论了Q2项目进度。';
    const prompt = buildExtractionPrompt(diary);

    assert.ok(prompt.includes('实体提取'));
    assert.ok(prompt.includes(diary));
    assert.ok(prompt.includes('person'));
    assert.ok(prompt.includes('object'));
    assert.ok(prompt.includes('theme'));
  });

  it('includes JSON schema example in prompt', () => {
    const prompt = buildExtractionPrompt('test');
    assert.ok(prompt.includes('{'));
    assert.ok(prompt.includes('entities'));
    assert.ok(prompt.includes('type'));
    assert.ok(prompt.includes('name'));
  });

  it('includes extraContext when provided', () => {
    const extraCtx = '## 附加网页剪藏摘要\n\n1. 标题：Test Article\n   摘要：Summary text.';
    const prompt = buildExtractionPrompt('diary', undefined, extraCtx);
    assert.ok(prompt.includes('附加网页剪藏摘要'));
    assert.ok(prompt.includes('Test Article'));
    assert.ok(prompt.includes('Summary text.'));
  });

  it('does not include extra context when not provided (backward compat)', () => {
    const prompt = buildExtractionPrompt('diary');
    assert.ok(!prompt.includes('附加网页剪藏摘要'));
  });

  it('extraContext appears before diary text and profile context', () => {
    const extraCtx = '## 附加网页剪藏摘要\n\nClip summary.';
    const profileCtx = 'User profile info.';
    const prompt = buildExtractionPrompt('日记内容', profileCtx, extraCtx);
    const extraIdx = prompt.indexOf('附加网页剪藏摘要');
    const profileIdx = prompt.indexOf('User profile info');
    const diaryIdx = prompt.indexOf('日记内容');
    assert.ok(extraIdx >= 0);
    assert.ok(profileIdx >= 0);
    assert.ok(extraIdx < profileIdx, 'extraContext should appear before profileContext');
    assert.ok(profileIdx < diaryIdx, 'profileContext should appear before diary text');
  });

  it('extraContext does not change prompt structure when empty', () => {
    const promptWith = buildExtractionPrompt('diary', undefined, '');
    const promptWithout = buildExtractionPrompt('diary');
    assert.equal(promptWith, promptWithout);
  });
});

describe('LLM Entity Extractor - Response Parser', () => {
  it('parses valid JSON response with person entities', () => {
    const json = JSON.stringify({
      entities: [
        { name: '张三', type: 'person', confidence: 0.9 },
        { name: 'Q2计划', type: 'object', subtype: 'project', confidence: 0.8 },
      ],
    });

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 2);
    assert.equal(result.entities[0].name, '张三');
    assert.equal(result.entities[0].type, 'person');
    assert.equal(result.entities[1].name, 'Q2计划');
    assert.equal(result.entities[1].type, 'object');
    assert.equal(result.entities[1].subtype, 'project');
  });

  it('parses response wrapped in markdown code block', () => {
    const json = '```json\n{"entities": [{"name": "李四", "type": "person", "confidence": 0.85}]}\n```';

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 1);
    assert.equal(result.entities[0].name, '李四');
  });

  it('handles missing confidence with default 0.5', () => {
    const json = JSON.stringify({
      entities: [{ name: '王五', type: 'person' }],
    });

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 1);
    assert.equal(result.entities[0].confidence, 0.5);
  });

  it('rejects invalid entity type', () => {
    const json = JSON.stringify({
      entities: [{ name: 'test', type: 'unknown' }],
    });

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 0);
  });

  it('rejects empty entity name', () => {
    const json = JSON.stringify({
      entities: [{ name: '', type: 'person' }],
    });

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 0);
  });

  it('handles empty entities array', () => {
    const json = JSON.stringify({ entities: [] });

    const result = parseLLMResponse(json);

    assert.equal(result.entities.length, 0);
  });

  it('handles malformed JSON gracefully', () => {
    const result = parseLLMResponse('not json');

    assert.deepEqual(result.entities, []);
  });

  it('handles JSON without entities field', () => {
    const json = JSON.stringify({ data: 'something' });

    const result = parseLLMResponse(json);

    assert.deepEqual(result.entities, []);
  });
});

describe('extractEntitiesWithLLM - OpenAI', () => {
  it('uses OpenAI URL and Bearer auth', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = ((url: string, init: any) => {
      capturedUrl = url;
      capturedHeaders = init.headers || {};
      return Promise.resolve(new Response(mockEntityResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('今天和张三讨论项目', {
      provider: 'openai', apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com',
    });

    assert.ok(capturedUrl.includes('/chat/completions'), `URL should include /chat/completions: ${capturedUrl}`);
    assert.equal(capturedHeaders['Authorization'], 'Bearer sk-test');
  });

  it('parses OpenAI response correctly', async () => {
    globalThis.fetch = (() => Promise.resolve(new Response(mockEntityResponse(), { status: 200 }))) as any;
    const result = await extractEntitiesWithLLM('test', {
      provider: 'openai', apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com',
    });
    assert.equal(result.entities.length, 1);
    assert.equal(result.entities[0].name, '张三');
  });

  it('includes reasoning_effort in extraction body when configured', async () => {
    let capturedBody: any;
    globalThis.fetch = ((_url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(new Response(mockEntityResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('test', {
      provider: 'openai', apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com',
      reasoningEffort: 'high',
    });
    assert.equal(capturedBody!.reasoning_effort, 'high', `Expected reasoning_effort in: ${JSON.stringify(capturedBody)}`);
  });

  it('does not include reasoning_effort by default', async () => {
    let capturedBody: any;
    globalThis.fetch = ((_url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(new Response(mockEntityResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('test', {
      provider: 'openai', apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com',
    });
    assert.equal(capturedBody!.reasoning_effort, undefined, 'Should not include reasoning_effort by default');
  });
});

describe('extractEntitiesWithLLM - Anthropic', () => {
  it('uses Anthropic /v1/messages URL and x-api-key', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = ((url: string, init: any) => {
      capturedUrl = url;
      capturedHeaders = init.headers || {};
      return Promise.resolve(new Response(mockAnthropicResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('今天和张三讨论项目', {
      provider: 'anthropic', apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6', baseUrl: 'https://api.anthropic.com/v1/messages',
    });

    assert.ok(capturedUrl.includes('/v1/messages'), `URL should include /v1/messages: ${capturedUrl}`);
    assert.equal(capturedHeaders['x-api-key'], 'sk-ant-test');
    assert.equal(capturedHeaders['anthropic-version'], '2023-06-01');
  });

  it('parses Anthropic response correctly', async () => {
    globalThis.fetch = (() => Promise.resolve(new Response(mockAnthropicResponse(), { status: 200 }))) as any;
    const result = await extractEntitiesWithLLM('test', {
      provider: 'anthropic', apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6', baseUrl: 'https://api.anthropic.com/v1/messages',
    });
    assert.equal(result.entities.length, 1);
    assert.equal(result.entities[0].name, '张三');
  });

  it('includes thinking in Anthropic extraction body when enableThinking is true', async () => {
    let capturedBody: any;
    globalThis.fetch = ((_url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(new Response(mockAnthropicResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('test', {
      provider: 'anthropic', apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6', baseUrl: 'https://api.anthropic.com/v1/messages',
      enableThinking: true,
    });
    assert.deepEqual(capturedBody!.thinking, { type: 'adaptive', effort: 'high' },
      `Expected thinking in: ${JSON.stringify(capturedBody)}`);
  });
});

describe('extractEntitiesWithLLM - Ollama', () => {
  it('works without API key', async () => {
    globalThis.fetch = (() => {
      return Promise.resolve(new Response(mockEntityResponse(), { status: 200 }));
    }) as any;

    const result = await extractEntitiesWithLLM('test', {
      provider: 'ollama', apiKey: '', model: 'llama3', baseUrl: 'http://localhost:11434',
    });
    assert.equal(result.entities.length, 1);
  });

  it('uses localhost URL', async () => {
    let capturedUrl = '';
    globalThis.fetch = ((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(mockEntityResponse(), { status: 200 }));
    }) as any;

    await extractEntitiesWithLLM('test', {
      provider: 'ollama', apiKey: '', model: 'llama3', baseUrl: 'http://localhost:11434',
    });
    assert.ok(capturedUrl.includes('localhost:11434'), `URL should include localhost: ${capturedUrl}`);
  });
});

describe('extractEntitiesWithLLM - error handling', () => {
  it('throws safe error on HTTP failure', async () => {
    const errorBody = JSON.stringify({ error: { message: 'Invalid API key: sk-abc123def456ghi789jkl012mno345pqr678stu' } });
    globalThis.fetch = (() => Promise.resolve(new Response(errorBody, { status: 401 }))) as any;

    try {
      await extractEntitiesWithLLM('test', {
        provider: 'openai', apiKey: 'sk-test', model: 'gpt-4', baseUrl: 'https://api.openai.com',
      });
      assert.fail('Should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      assert.ok(msg.includes('HTTP 401'), `Expected HTTP 401 in: ${msg}`);
      assert.ok(!msg.includes('sk-abc123'), `Secret should be masked: ${msg}`);
    }
  });

  it('throws on invalid config', async () => {
    try {
      await extractEntitiesWithLLM('test', {
        provider: 'openai', apiKey: '', model: '', baseUrl: '',
      });
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok((e as Error).message.includes('API Key') || (e as Error).message.includes('模型'));
    }
  });
});
