import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidBlockId, validateBlockId } from '../../src/core/block-id-validator';

describe('Block ID Validator', () => {
  it('accepts standard date format YYYY-MM-DD', () => {
    assert.equal(isValidBlockId('2026-05-03'), true);
  });

  it('accepts date with custom block name', () => {
    assert.equal(isValidBlockId('2026-05-03_morning'), true);
  });

  it('accepts generated block IDs', () => {
    assert.equal(isValidBlockId('block-a1b2c3'), true);
    assert.equal(isValidBlockId('block-DEADBEEF'), true);
  });

  it('rejects empty IDs', () => {
    assert.equal(isValidBlockId(''), false);
  });

  it('rejects random strings', () => {
    assert.equal(isValidBlockId('hello'), false);
    assert.equal(isValidBlockId('my-diary'), false);
  });

  it('rejects malformed dates', () => {
    assert.equal(isValidBlockId('2026-5-3'), false);
    assert.equal(isValidBlockId('26-05-03'), false);
  });

  it('returns null for valid IDs', () => {
    assert.equal(validateBlockId('2026-05-03'), null);
    assert.equal(validateBlockId('2026-05-03_morning'), null);
  });

  it('returns error message for invalid IDs', () => {
    const err = validateBlockId('hello');
    assert.ok(err);
    assert.ok(err?.includes('无效'));
  });
});
