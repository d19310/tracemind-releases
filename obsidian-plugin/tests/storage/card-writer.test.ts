import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCardUpdate,
  buildWikilinkSection,
  parseWikilinks,
} from '../../src/storage/card-writer';
import { ContextCard } from '../../src/core/context-card';

describe('Card Writer - Build Card Update', () => {
  it('builds markdown for a new person card', () => {
    const card = ContextCard.create({
      name: '张三',
      cardType: 'person',
      attributes: {
        company: '某科技公司',
        role: 'CTO',
        relationship_to_user: '前同事',
      },
    });

    const md = buildCardUpdate(card);

    assert.ok(md.includes('---'));
    assert.ok(md.includes('name: 张三'));
    assert.ok(md.includes('type: person'));
    assert.ok(md.includes('# 张三'));
  });

  it('updates maturity field in card', () => {
    const card = ContextCard.create({
      name: '李四',
      cardType: 'person',
      attributes: {
        company: 'YY公司',
        role: '总监',
        relationship_to_user: '客户',
      },
    });

    // Verify the card was created with correct maturity
    assert.equal(card.maturity, 'L1');

    const md = buildCardUpdate(card);
    assert.ok(md.includes('maturity: L1'));
  });
});

describe('Card Writer - Wikilink Section', () => {
  it('builds wikilink section from entity IDs', () => {
    const section = buildWikilinkSection(['张三', 'Q2项目']);
    assert.equal(section, '[[张三]], [[Q2项目]]');
  });

  it('returns empty string for no entities', () => {
    const section = buildWikilinkSection([]);
    assert.equal(section, '');
  });
});

describe('Card Writer - Parse Wikilinks', () => {
  it('extracts wikilinks from text', () => {
    const text = '今天和[[张三]]讨论了[[Q2营销计划]]，[[李四]]也参加了。';
    const links = parseWikilinks(text);
    assert.deepEqual(links, ['张三', 'Q2营销计划', '李四']);
  });

  it('handles text without wikilinks', () => {
    const links = parseWikilinks('今天天气很好');
    assert.deepEqual(links, []);
  });
});
