import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sessionFilePath,
  listSession,
  formatSessionJson,
  parseSessionJson,
} from '../../src/storage/session-store-io';
import { BlockSession } from '../../src/storage/session-store';

const SAMPLE_SESSION: BlockSession = {
  blockId: 'abc-123',
  content: '今天和张三讨论了项目进度',
  messages: [
    { role: 'system', content: '分析此日记块' },
    { role: 'user', content: '请提取实体' },
    { role: 'assistant', content: '检测到实体：张三（person）' },
  ],
  analysisResult: { entities: [{ name: '张三', type: 'person' }] },
  createdAt: '2026-05-01T10:00:00Z',
  updatedAt: '2026-05-01T10:00:00Z',
  currentPhase: 'complete',
};

describe('Session Store I/O', () => {
  it('generates correct file path for block ID', () => {
    assert.equal(sessionFilePath('abc-123'), 'TraceMind/sessions/abc-123.json');
  });

  it('lists session files from file array', () => {
    const files = [
      { path: 'TraceMind/sessions/abc.json', content: '{}' },
      { path: 'Daily/2026-05-01.md', content: '' },
      { path: 'TraceMind/sessions/def.json', content: '{}' },
    ];
    const sessions = listSession(files);
    assert.equal(sessions.length, 2);
    assert.deepEqual(sessions, ['abc', 'def']);
  });

  it('formats session as JSON', () => {
    const json = formatSessionJson(SAMPLE_SESSION);
    assert.ok(json.includes('"blockId": "abc-123"'));
    assert.ok(json.includes('"currentPhase": "complete"'));
  });

  it('parses session from JSON', () => {
    const json = formatSessionJson(SAMPLE_SESSION);
    const session = parseSessionJson(json);
    assert.equal(session.blockId, 'abc-123');
    assert.equal(session.messages.length, 3);
    assert.equal(session.currentPhase, 'complete');
  });

  it('provides default phase when missing', () => {
    const session = parseSessionJson('{"blockId":"x","content":"hi","messages":[],"createdAt":"","updatedAt":""}');
    assert.equal(session.currentPhase, 'analysis');
  });
});
