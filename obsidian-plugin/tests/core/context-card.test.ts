import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateEntityId, ContextCard, calculateMaturity } from '../../src/core/context-card';

describe('Context Card - ID Generation', () => {
  it('generates an 8-character hex ID', () => {
    const id = generateEntityId('张三');
    assert.equal(id.length, 8);
    assert.match(id, /^[0-9a-f]{8}$/);
  });

  it('generates the same ID for the same name', () => {
    const id1 = generateEntityId('张三');
    const id2 = generateEntityId('张三');
    assert.equal(id1, id2);
  });

  it('generates different IDs for different names', () => {
    const id1 = generateEntityId('张三');
    const id2 = generateEntityId('李四');
    assert.notEqual(id1, id2);
  });
});

describe('Context Card - Create Person', () => {
  it('creates a Person card with required fields', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
    });

    assert.equal(card.id, generateEntityId('张三'));
    assert.equal(card.name, '张三');
    assert.equal(card.cardType, 'person');
    assert.equal(card.maturity, 'L0');
    assert.equal(card.confidence, 0.5);
    assert.equal(card.status, 'needs_confirmation');
    assert.ok(card.createdAt);
    assert.ok(card.lastUpdated);
  });

  it('creates a Person card with metadata', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: 'XX科技',
        role: '技术总监',
        relationship_to_user: '同事',
      },
    });

    assert.equal(card.attributes.company, 'XX科技');
    assert.equal(card.attributes.role, '技术总监');
  });
});

describe('Context Card - Create Object', () => {
  it('creates an Object card with subtype and priority', () => {
    const card = ContextCard.create({
      name: 'Q2营销计划',
      cardType: 'object',
      attributes: { subtype: 'project', status: '进行中' },
    });

    assert.equal(card.cardType, 'object');
    assert.equal(card.attributes.subtype, 'project');
    assert.equal(card.attributes.status, '进行中');
  });
});

describe('Context Card - Create Theme', () => {
  it('creates a Theme card with subtype', () => {
    const card = ContextCard.create({
      name: 'AI技术',
      cardType: 'theme',
      attributes: { subtype: 'domain' },
    });

    assert.equal(card.cardType, 'theme');
    assert.equal(card.attributes.subtype, 'domain');
  });
});

describe('Maturity - Person', () => {
  it('returns L0 when no P0 attributes are filled', () => {
    const maturity = calculateMaturity('person', {});
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when all P0 attributes are filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
    });
    assert.equal(maturity, 'L1');
  });

  it('returns L2 when P0 + P1 attributes are filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
      responsibility: '技术架构',
      communicationStyle: '直接',
    });
    assert.equal(maturity, 'L2');
  });

  it('returns L3 when all attributes are filled', () => {
    const maturity = calculateMaturity('person', {
      company: 'XX科技',
      role: '技术总监',
      relationship_to_user: '同事',
      responsibility: '技术架构',
      communicationStyle: '直接',
      personality: '外向',
      preferences: '技术驱动',
      skills: '架构设计',
    });
    assert.equal(maturity, 'L3');
  });
});

describe('Maturity - Object', () => {
  it('returns L0 when P0 attributes are missing', () => {
    const maturity = calculateMaturity('object', {});
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when P0 (subtype, status) are filled', () => {
    const maturity = calculateMaturity('object', {
      subtype: 'project',
      status: '进行中',
    });
    assert.equal(maturity, 'L1');
  });
});

describe('Maturity - Theme', () => {
  it('returns L0 when P0 (subtype) is missing', () => {
    const maturity = calculateMaturity('theme', {});
    assert.equal(maturity, 'L0');
  });

  it('returns L1 when P0 (subtype) is filled', () => {
    const maturity = calculateMaturity('theme', { subtype: 'domain' });
    assert.equal(maturity, 'L1');
  });
});
