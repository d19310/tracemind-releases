import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ConfirmationFlow,
  ConfirmationResult,
} from '../../src/core/confirmation-flow';

describe('ConfirmationFlow - Creation', () => {
  it('creates flow with pending entities', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
      { name: 'Q2项目', type: 'object', isNew: true, maturity: 'L0' },
    ]);

    assert.equal(flow.pendingCount, 2);
    assert.equal(flow.status, 'active');
  });

  it('sorts entities by priority', () => {
    const flow = ConfirmationFlow.create([
      { name: '低优先', type: 'theme', isNew: true, maturity: 'L0' },
      { name: '高优先', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    assert.equal(flow.currentEntity?.name, '高优先');
  });
});

describe('ConfirmationFlow - Next Entity', () => {
  it('returns current entity', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    const entity = flow.currentEntity;
    assert.ok(entity);
    assert.equal(entity.name, '张三');
  });

  it('returns null when no entities', () => {
    const flow = ConfirmationFlow.create([]);
    assert.equal(flow.currentEntity, undefined);
  });
});

describe('ConfirmationFlow - Confirm', () => {
  it('confirms current entity and moves to next', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
      { name: '李四', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    const result = flow.confirm({ attributes: { company: 'XX科技' } });
    assert.equal(result.status, 'confirmed');
    assert.equal(result.entityName, '张三');
    assert.equal(flow.pendingCount, 1);
    assert.equal(flow.confirmedCount, 1);
  });

  it('records confirmed entity', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    flow.confirm({ attributes: { role: 'CTO' } });
    assert.equal(flow.confirmed.length, 1);
    assert.equal(flow.confirmed[0].name, '张三');
  });
});

describe('ConfirmationFlow - Skip', () => {
  it('skips current entity and moves to next', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
      { name: '李四', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    const result = flow.skip();
    assert.equal(result.status, 'skipped');
    assert.equal(result.entityName, '张三');
    assert.equal(flow.pendingCount, 1);
  });
});

describe('ConfirmationFlow - Stop', () => {
  it('stops the entire flow', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
      { name: '李四', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    flow.stop();
    assert.equal(flow.status, 'stopped');
    assert.equal(flow.pendingCount, 0);
  });
});

describe('ConfirmationFlow - Summary', () => {
  it('generates summary after completion', () => {
    const flow = ConfirmationFlow.create([
      { name: '张三', type: 'person', isNew: true, maturity: 'L0' },
      { name: '李四', type: 'person', isNew: true, maturity: 'L0' },
    ]);

    flow.confirm({ attributes: { company: 'XX' } });
    flow.skip();

    const summary = flow.summary;
    assert.ok(summary.includes('确认'));
    assert.ok(summary.includes('跳过'));
  });
});
