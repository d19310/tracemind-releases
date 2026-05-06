import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildExtractionPrompt, parseLLMResponse } from '../../src/ai/llm-entity-extractor';

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
