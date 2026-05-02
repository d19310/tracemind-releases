import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_OBJECT_SUBTYPES,
  VALID_THEME_SUBTYPES,
  OBJECT_SUBTYPE_PRIORITY,
  validateObjectSubtype,
  validateThemeSubtype,
  getDefaultSubtype,
} from '../../src/core/context-card';

describe('Subtype Validation - Object', () => {
  it('accepts valid object subtypes', () => {
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
    assert.equal(validateThemeSubtype('domain'), true);
    assert.equal(validateThemeSubtype('habit'), true);
    assert.equal(validateThemeSubtype('state'), true);
    assert.equal(validateThemeSubtype('pending_decision'), true);
  });

  it('rejects invalid theme subtypes', () => {
    assert.equal(validateThemeSubtype('invalid'), false);
    assert.equal(validateThemeSubtype(''), false);
    assert.equal(validateThemeSubtype('person'), false);
  });
});

describe('Subtype - Default Values', () => {
  it('returns default object subtype when none provided', () => {
    assert.equal(getDefaultSubtype('object'), 'other');
  });

  it('returns default theme subtype when none provided', () => {
    assert.equal(getDefaultSubtype('theme'), 'domain');
  });

  it('returns undefined for person (no subtypes)', () => {
    assert.equal(getDefaultSubtype('person'), undefined);
  });
});

describe('Subtype Validation - Lists', () => {
  it('exports all valid object subtypes', () => {
    assert.deepEqual(VALID_OBJECT_SUBTYPES.sort(), ['document', 'location', 'other', 'product', 'project', 'task', 'technology'].sort());
  });

  it('exports all valid theme subtypes', () => {
    assert.deepEqual(VALID_THEME_SUBTYPES.sort(), ['domain', 'habit', 'pending_decision', 'state'].sort());
  });
});
