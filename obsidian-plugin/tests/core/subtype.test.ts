import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RESERVED_ATTRIBUTE_KEYS,
  validateEntitySchema,
} from '../../src/core/entity-schema';
import {
  VALID_OBJECT_SUBTYPES,
  VALID_THEME_SUBTYPES,
  OBJECT_SUBTYPE_PRIORITY,
  validateObjectSubtype,
  validateThemeSubtype,
  getDefaultSubtype,
} from '../../src/core/entity-schema';

describe('Subtype Validation - Object', () => {
  it('accepts valid object subtypes', () => {
    assert.equal(validateObjectSubtype('company'), true);
    assert.equal(validateObjectSubtype('project'), true);
    assert.equal(validateObjectSubtype('task'), true);
    assert.equal(validateObjectSubtype('product'), true);
    assert.equal(validateObjectSubtype('technology'), true);
    assert.equal(validateObjectSubtype('document'), true);
    assert.equal(validateObjectSubtype('location'), true);
    assert.equal(validateObjectSubtype('other'), true);
  });

  it('rejects invalid object subtypes', () => {
    assert.equal(validateObjectSubtype('invalid'), false);
    assert.equal(validateObjectSubtype(''), false);
    assert.equal(validateObjectSubtype('person'), false);
  });

  it('exports subtype priority mapping', () => {
    assert.equal(OBJECT_SUBTYPE_PRIORITY['company'], 'P0');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['project'], 'P0');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['task'], 'P0');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['product'], 'P1');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['technology'], 'P1');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['document'], 'P2');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['location'], 'P2');
    assert.equal(OBJECT_SUBTYPE_PRIORITY['other'], 'P2');
  });
});

describe('Subtype Validation - Theme', () => {
  it('accepts valid theme subtypes', () => {
    assert.equal(validateThemeSubtype('friction'), true);
    assert.equal(validateThemeSubtype('goal'), true);
    assert.equal(validateThemeSubtype('judgment'), true);
    assert.equal(validateThemeSubtype('idea'), true);
  });

  it('rejects invalid theme subtypes', () => {
    assert.equal(validateThemeSubtype('domain'), false);
    assert.equal(validateThemeSubtype('habit'), false);
    assert.equal(validateThemeSubtype('invalid'), false);
    assert.equal(validateThemeSubtype(''), false);
  });
});

describe('Subtype - Default Values', () => {
  it('returns default object subtype when none provided', () => {
    assert.equal(getDefaultSubtype('object'), 'other');
  });

  it('returns default theme subtype when none provided', () => {
    assert.equal(getDefaultSubtype('theme'), 'friction');
  });

  it('returns undefined for person (no subtypes)', () => {
    assert.equal(getDefaultSubtype('person'), undefined);
  });
});

describe('Subtype Validation - Lists', () => {
  it('exports all valid object subtypes', () => {
    const expected = ['company', 'document', 'location', 'other', 'product', 'project', 'task', 'technology'];
    assert.deepEqual([...VALID_OBJECT_SUBTYPES].sort(), [...expected].sort());
  });

  it('exports all valid theme subtypes', () => {
    const expected = ['friction', 'goal', 'judgment', 'idea'];
    assert.deepEqual([...VALID_THEME_SUBTYPES].sort(), [...expected].sort());
  });
});

describe('ATTRIBUTE_PRIORITY backward compatibility', () => {
  it('object P0 includes subtype/status (old Phase 1 values)', () => {
    const { ATTRIBUTE_PRIORITY } = require('../../src/core/entity-schema');
    assert.ok(ATTRIBUTE_PRIORITY.object.p0.includes('subtype'));
    assert.ok(ATTRIBUTE_PRIORITY.object.p0.includes('status'));
    assert.ok(!ATTRIBUTE_PRIORITY.object.p0.includes('description'));
  });

  it('theme P0 only has subtype (old Phase 1 values)', () => {
    const { ATTRIBUTE_PRIORITY } = require('../../src/core/entity-schema');
    assert.deepEqual(ATTRIBUTE_PRIORITY.theme.p0, ['subtype']);
    assert.ok(!ATTRIBUTE_PRIORITY.theme.p0.includes('trigger'));
  });

  it('object P1 includes deadline/description (old Phase 1 values)', () => {
    const { ATTRIBUTE_PRIORITY } = require('../../src/core/entity-schema');
    assert.ok(ATTRIBUTE_PRIORITY.object.p1.includes('deadline'));
    assert.ok(ATTRIBUTE_PRIORITY.object.p1.includes('description'));
  });
});

describe('normalizeEntityAttributes', () => {
  const { normalizeEntityAttributes } = require('../../src/core/entity-schema');

  it('does not mutate input', () => {
    const input = { communicationStyle: '直接' };
    const result = normalizeEntityAttributes('person', undefined, input);
    assert.notStrictEqual(result, input);
    assert.equal(input.communicationStyle, '直接'); // unchanged
  });

  it('person: communicationStyle → workingStyle', () => {
    const result = normalizeEntityAttributes('person', undefined, { communicationStyle: '直接' });
    assert.equal(result.workingStyle, '直接');
    assert.equal(result.communicationStyle, '直接'); // alias preserved
  });

  it('task: status → taskStatus, deadline → dueDate', () => {
    const result = normalizeEntityAttributes('object', 'task', {
      subtype: 'task',
      status: 'doing',
      deadline: '2026-06-01',
    });
    assert.equal(result.taskStatus, 'doing');
    assert.equal(result.dueDate, '2026-06-01');
    assert.equal(result.status, 'doing');
    assert.equal(result.deadline, '2026-06-01');
  });

  it('technology: maturity → techMaturity', () => {
    const result = normalizeEntityAttributes('object', 'technology', {
      subtype: 'technology',
      maturity: '成熟',
    });
    assert.equal(result.techMaturity, '成熟');
  });

  it('judgment: confidence → judgmentConfidence', () => {
    const result = normalizeEntityAttributes('theme', 'judgment', {
      subtype: 'judgment',
      confidence: 0.8,
    });
    assert.equal(result.judgmentConfidence, 0.8);
  });

  it('theme: context → summary (weak)', () => {
    const result = normalizeEntityAttributes('theme', undefined, { context: 'old context' });
    assert.equal(result.summary, 'old context');
  });

  it('canonical key takes priority over alias', () => {
    const result = normalizeEntityAttributes('object', 'task', {
      subtype: 'task',
      taskStatus: 'canonical-value',
      status: 'alias-value',
    });
    assert.equal(result.taskStatus, 'canonical-value');
  });

  it('skips empty alias values', () => {
    const result = normalizeEntityAttributes('object', 'task', {
      subtype: 'task',
      status: '',
    });
    assert.equal(result.taskStatus, undefined);
  });

  it('preserveAliases: false strips old aliases', () => {
    const result = normalizeEntityAttributes('person', undefined,
      { communicationStyle: '直接' },
      { preserveAliases: false },
    );
    assert.equal(result.workingStyle, '直接');
    assert.equal(result.communicationStyle, undefined);
  });
});

describe('Reserved Key Guard', () => {
  it('validateEntitySchema returns empty array for current schema', () => {
    const errors = validateEntitySchema();
    assert.deepEqual(errors, []);
  });

  it('RESERVED_ATTRIBUTE_KEYS includes status/maturity/confidence', () => {
    assert.ok(RESERVED_ATTRIBUTE_KEYS.has('status'));
    assert.ok(RESERVED_ATTRIBUTE_KEYS.has('maturity'));
    assert.ok(RESERVED_ATTRIBUTE_KEYS.has('confidence'));
  });

  it('schema attributes do not use reserved keys', () => {
    // Spot-check: previously-conflicting keys should now be renamed
    const errors = validateEntitySchema();
    // If there are errors, list them clearly
    if (errors.length > 0) {
      assert.fail('Schema has reserved key conflicts: ' + errors.join('; '));
    }
  });
});
