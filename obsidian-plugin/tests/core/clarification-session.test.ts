import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ClarificationSession,
  SessionAnswer,
} from '../../src/core/clarification-session';
import { KnowledgeGap } from '../../src/core/knowledge-gap';

function makeGap(type: string, entity: string, priority: string): KnowledgeGap {
  return {
    type: type as KnowledgeGap['type'],
    entityName: entity,
    entityType: 'person',
    maturityLevel: 'L0',
    attributePriority: priority,
    score: 10,
    description: `Missing ${priority} for ${entity}`,
    missingAttribute: 'company',
  };
}

describe('ClarificationSession - Creation', () => {
  it('creates a session with gap queue', () => {
    const gaps = [makeGap('missing_attribute', '张三', 'P0')];
    const session = ClarificationSession.create(gaps, { maxTurns: 5 });

    assert.equal(session.maxTurns, 5);
    assert.equal(session.turnCount, 0);
    assert.equal(session.status, 'active');
    assert.ok(session.startedAt);
  });

  it('sorts gaps by score descending', () => {
    const gaps = [
      makeGap('missing_attribute', '低优先级', 'P2'),
      makeGap('missing_attribute', '高优先级', 'P0'),
    ];
    gaps[0].score = 5;
    gaps[1].score = 40;

    const session = ClarificationSession.create(gaps, { maxTurns: 5 });
    assert.equal(session.gapQueue[0].entityName, '高优先级');
  });
});

describe('ClarificationSession - Next Question', () => {
  it('returns next gap from queue', () => {
    const gaps = [makeGap('missing_attribute', '张三', 'P0')];
    const session = ClarificationSession.create(gaps, { maxTurns: 5 });

    const next = session.nextQuestion();
    assert.ok(next);
    assert.equal(next.entityName, '张三');
    assert.equal(session.turnCount, 1);
  });

  it('returns null when queue is empty', () => {
    const session = ClarificationSession.create([], { maxTurns: 3 });
    assert.equal(session.nextQuestion(), null);
  });

  it('returns null when max turns reached', () => {
    const gaps = [
      makeGap('missing_attribute', '张三', 'P0'),
      makeGap('missing_attribute', '张三', 'P1'),
    ];
    const session = ClarificationSession.create(gaps, { maxTurns: 1 });

    session.nextQuestion();
    assert.equal(session.nextQuestion(), null);
  });

  it('returns null when session is stopped', () => {
    const gaps = [makeGap('missing_attribute', '张三', 'P0')];
    const session = ClarificationSession.create(gaps, { maxTurns: 5 });
    session.stop();

    assert.equal(session.nextQuestion(), null);
    assert.equal(session.status, 'stopped');
  });
});

describe('ClarificationSession - Stop Conditions', () => {
  it('detects "跳过" as skip', () => {
    assert.equal(ClarificationSession.isStopCommand('跳过'), true);
  });

  it('detects "不用问了" as stop', () => {
    assert.equal(ClarificationSession.isStopCommand('不用问了'), true);
  });

  it('detects "结束" as stop', () => {
    assert.equal(ClarificationSession.isStopCommand('结束'), true);
  });

  it('detects "stop" as stop', () => {
    assert.equal(ClarificationSession.isStopCommand('stop'), true);
  });

  it('returns false for normal text', () => {
    assert.equal(ClarificationSession.isStopCommand('他是一家科技公司的技术总监'), false);
  });
});

describe('ClarificationSession - Answer Processing', () => {
  it('records user answer and removes gap from queue', () => {
    const gaps = [makeGap('missing_attribute', '张三', 'P0')];
    const session = ClarificationSession.create(gaps, { maxTurns: 1 });

    // Move to first gap
    session.nextQuestion();

    // Process answer - extracts attribute
    const answer: SessionAnswer = {
      question: '请问张三是做什么工作的？',
      userResponse: '他是一家科技公司的CTO',
      extractedAttributes: { company: '某科技公司', role: 'CTO' },
    };
    session.processAnswer(answer);

    assert.ok(session.summary);
    assert.equal(session.status, 'completed');
  });

  it('handles skip answer', () => {
    const gaps = [
      makeGap('missing_attribute', '张三', 'P0'),
      makeGap('missing_attribute', '张三', 'P1'),
    ];
    const session = ClarificationSession.create(gaps, { maxTurns: 5 });
    session.nextQuestion();

    const answer: SessionAnswer = {
      question: '请问张三是做什么的？',
      userResponse: '跳过',
      extractedAttributes: {},
    };
    session.processAnswer(answer);

    // Session should continue if more gaps exist
    assert.equal(session.status, 'active');
  });
});

describe('ClarificationSession - Summary', () => {
  it('generates summary after session ends', () => {
    const gaps = [makeGap('missing_attribute', '张三', 'P0')];
    const session = ClarificationSession.create(gaps, { maxTurns: 5 });
    session.nextQuestion();

    session.processAnswer({
      question: '张三是做什么的？',
      userResponse: '某科技公司CTO',
      extractedAttributes: { company: '某科技公司', role: 'CTO' },
    });

    assert.ok(session.answers.length > 0);
    assert.ok(session.turnCount >= 1);
  });
});
