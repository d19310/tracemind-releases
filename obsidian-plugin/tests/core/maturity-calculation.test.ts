import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMaturity, ATTRIBUTE_PRIORITY, CardType } from '../../src/core/context-card';

describe('Maturity Calculation - Object', () => {
  it('returns L0 when P0 attributes are missing', () => {
    const maturity = calculateMaturity('object', {});
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when P0 attributes are filled', () => {
    const maturity = calculateMaturity('object', { subtype: 'project', status: 'active' });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 and P1 attributes are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      status: 'active',
      owner: '张三',
      deadline: '2026-06-01',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when all P0, P1, P2 attributes are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      status: 'active',
      owner: '张三',
      deadline: '2026-06-01',
      description: 'A test project',
      priority: 'high',
    });
    assert.equal(maturity, 'L3');
  });

  it('has non-empty P1 and P2 arrays for object type', () => {
    assert.ok(ATTRIBUTE_PRIORITY.object.p1.length > 0, 'Object should have P1 attributes');
    assert.ok(ATTRIBUTE_PRIORITY.object.p2.length > 0, 'Object should have P2 attributes');
  });
});

describe('Maturity Calculation - Theme', () => {
  it('returns L0 when P0 attributes are missing', () => {
    const maturity = calculateMaturity('theme', {});
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when P0 attributes are filled', () => {
    const maturity = calculateMaturity('theme', { subtype: 'habit' });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 and P1 attributes are filled', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'habit',
      frequency: 'daily',
      context: 'morning routine',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when all P0, P1, P2 attributes are filled', () => {
    const maturity = calculateMaturity('theme', {
      subtype: 'habit',
      frequency: 'daily',
      context: 'morning routine',
      goals: ['improve health'],
      emotions: ['motivated'],
    });
    assert.equal(maturity, 'L3');
  });

  it('has non-empty P1 and P2 arrays for theme type', () => {
    assert.ok(ATTRIBUTE_PRIORITY.theme.p1.length > 0, 'Theme should have P1 attributes');
    assert.ok(ATTRIBUTE_PRIORITY.theme.p2.length > 0, 'Theme should have P2 attributes');
  });
});

describe('Maturity Calculation - Person (unchanged)', () => {
  it('returns L0 when no attributes filled', () => {
    assert.equal(calculateMaturity('person', {}), 'L0');
  });

  it('returns L1 when only P0 attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 and P1 attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
      responsibility: 'Backend team lead',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when all attributes filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'ACME',
      role: 'Engineer',
      relationship_to_user: 'colleague',
      responsibility: 'Backend team lead',
      personality: 'analytical',
    });
    assert.equal(maturity, 'L3');
  });
});
