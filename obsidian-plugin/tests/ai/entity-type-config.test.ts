import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClarificationAttributeGuide,
  buildVaultSchemaGuide,
} from '../../src/ai/entity-type-config';

describe('buildClarificationAttributeGuide - subtype-aware', () => {
  it('object + project includes stage/owner/deadline/stakeholders/blockers', () => {
    const guide = buildClarificationAttributeGuide('object', 'project');
    assert.ok(guide.includes('stage'), `Expected stage in: ${guide}`);
    assert.ok(guide.includes('owner'));
    assert.ok(guide.includes('deadline'));
    assert.ok(guide.includes('stakeholders'));
    assert.ok(guide.includes('blockers'));
    assert.ok(!guide.includes('status'), 'Should not recommend "status" as primary key');
  });

  it('object + task includes taskStatus/nextAction/dueDate/assignee/parentProject', () => {
    const guide = buildClarificationAttributeGuide('object', 'task');
    assert.ok(guide.includes('taskStatus'));
    assert.ok(guide.includes('nextAction'));
    assert.ok(guide.includes('dueDate'));
    assert.ok(guide.includes('assignee'));
    assert.ok(guide.includes('parentProject'));
  });

  it('theme + judgment includes claim/judgmentConfidence/evidence/counterEvidence', () => {
    const guide = buildClarificationAttributeGuide('theme', 'judgment');
    assert.ok(guide.includes('claim'));
    assert.ok(guide.includes('judgmentConfidence'));
    assert.ok(guide.includes('evidence'));
    assert.ok(guide.includes('counterEvidence'));
    assert.ok(!guide.includes('confidence'), 'Should not recommend "confidence" as primary key');
  });

  it('theme + friction includes trigger/impact/frequency/possibleCause', () => {
    const guide = buildClarificationAttributeGuide('theme', 'friction');
    assert.ok(guide.includes('trigger'));
    assert.ok(guide.includes('impact'));
    assert.ok(guide.includes('frequency'));
    assert.ok(guide.includes('possibleCause'));
  });

  it('person includes company/role/relationship_to_user', () => {
    const guide = buildClarificationAttributeGuide('person');
    assert.ok(guide.includes('company'));
    assert.ok(guide.includes('role'));
    assert.ok(guide.includes('relationship_to_user'));
  });

  it('falls back to default subtype when no subtype given', () => {
    const guide = buildClarificationAttributeGuide('object');
    assert.ok(guide.includes('description'), `Expected description in fallback guide: ${guide}`);
  });
});

describe('buildVaultSchemaGuide', () => {
  it('includes person attributes', () => {
    const guide = buildVaultSchemaGuide();
    assert.ok(guide.includes('company'));
    assert.ok(guide.includes('role'));
    assert.ok(guide.includes('relationship_to_user'));
  });

  it('includes object subtype list', () => {
    const guide = buildVaultSchemaGuide();
    assert.ok(guide.includes('company'));
    assert.ok(guide.includes('project'));
    assert.ok(guide.includes('task'));
    assert.ok(guide.includes('technology'));
  });

  it('includes theme subtype list', () => {
    const guide = buildVaultSchemaGuide();
    assert.ok(guide.includes('friction'));
    assert.ok(guide.includes('goal'));
    assert.ok(guide.includes('judgment'));
    assert.ok(guide.includes('idea'));
  });

  it('does not recommend status/deadline as sole object attributes', () => {
    const guide = buildVaultSchemaGuide();
    assert.ok(!guide.includes('status, deadline'));
  });

  it('does not reference old theme subtypes domain/habit', () => {
    const guide = buildVaultSchemaGuide();
    assert.ok(!guide.includes('domain'));
    assert.ok(!guide.includes('habit'));
    assert.ok(!guide.includes('pending_decision'));
  });
});
