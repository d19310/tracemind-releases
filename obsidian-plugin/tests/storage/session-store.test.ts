import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BlockSession, saveSession, loadSession } from '../../src/storage/session-store';

describe('Session Store - Save and Load', () => {
  it('saves a session to JSON', () => {
    const session: BlockSession = {
      blockId: 'abc12345',
      content: '今天和张三讨论了Q2营销计划',
      messages: [
        { role: 'user', content: '今天和张三讨论了Q2营销计划' },
        { role: 'assistant', content: '已识别实体：张三（Person）、Q2营销计划（Object）' },
      ],
      createdAt: '2026-05-02T10:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
      currentPhase: 'complete',
    };

    const json = saveSession(session);
    const parsed = JSON.parse(json);

    assert.equal(parsed.blockId, 'abc12345');
    assert.equal(parsed.messages.length, 2);
    assert.equal(parsed.messages[0].role, 'user');
  });

  it('loads a session from JSON', () => {
    const json = JSON.stringify({
      blockId: 'abc12345',
      content: '今天和张三讨论了Q2营销计划',
      messages: [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好！' },
      ],
      createdAt: '2026-05-02T10:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
      currentPhase: 'complete',
    });

    const session = loadSession(json);

    assert.equal(session.blockId, 'abc12345');
    assert.equal(session.messages.length, 2);
    assert.equal(session.messages[0].content, '你好');
  });
});

describe('Session Store - Roundtrip', () => {
  it('preserves all fields through save/load cycle', () => {
    const original: BlockSession = {
      blockId: 'test0001',
      content: '测试内容',
      messages: [
        { role: 'user', content: '测试消息' },
        { role: 'assistant', content: '测试回复' },
      ],
      analysisResult: { summary: '提取了2个实体' },
      createdAt: '2026-05-01T08:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
      currentPhase: 'complete',
    };

    const json = saveSession(original);
    const loaded = loadSession(json);

    assert.equal(loaded.blockId, original.blockId);
    assert.equal(loaded.content, original.content);
    assert.deepEqual(loaded.messages, original.messages);
    assert.deepEqual(loaded.analysisResult, original.analysisResult);
  });
});
