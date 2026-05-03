import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCardUpdate,
  buildWikilinkSection,
  parseWikilinks,
  cardToVaultPath,
  cardExists,
  getCardFolder,
  sanitizeFileName,
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

describe('Card Writer - Vault Path', () => {
  it('returns correct path for person cards', () => {
    assert.equal(cardToVaultPath('张三', 'person'), 'Person/张三.md');
  });

  it('returns correct path for object cards', () => {
    assert.equal(cardToVaultPath('Q2计划', 'object'), 'Object/Q2计划.md');
  });

  it('returns correct path for theme cards', () => {
    assert.equal(cardToVaultPath('远程工作', 'theme'), 'Theme/远程工作.md');
  });
});

describe('Card Writer - Path Existence Check', () => {
  it('returns true when path exists in file map', () => {
    const files = new Set(['Person/张三.md', 'Object/test.md']);
    assert.equal(cardExists(files, '张三', 'person'), true);
  });

  it('returns false when path does not exist', () => {
    const files = new Set(['Person/张三.md']);
    assert.equal(cardExists(files, '李四', 'person'), false);
  });

  it('returns false when empty file map', () => {
    assert.equal(cardExists(new Set(), '张三', 'person'), false);
  });
});

describe('Card Writer - File Name Sanitization', () => {
  it('handles names with special characters', () => {
    const path = cardToVaultPath('项目/A', 'object');
    assert.equal(path, 'Object/项目_A.md');
  });

  it('handles empty names gracefully', () => {
    const path = cardToVaultPath('', 'person');
    assert.ok(path.startsWith('Person/'));
  });
});

describe('Card Writer - Folder Mapping', () => {
  it('returns Person folder for person type', () => {
    assert.equal(getCardFolder('person'), 'Person/');
  });

  it('returns Object folder for object type', () => {
    assert.equal(getCardFolder('object'), 'Object/');
  });

  it('returns Theme folder for theme type', () => {
    assert.equal(getCardFolder('theme'), 'Theme/');
  });

  it('returns empty string for unknown type', () => {
    assert.equal(getCardFolder('unknown' as any), '');
  });
});
