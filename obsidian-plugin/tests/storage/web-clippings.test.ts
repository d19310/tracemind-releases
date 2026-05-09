import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeWebClippingTitle, shortHash, buildWebClippingFileName,
  makeUniqueWebClippingPath, webClippingEmbed, formatWebClippingMarkdown, replaceUrlWithEmbed, WEB_CLIPPINGS_DIR,
} from '../../src/storage/web-clippings';

describe('sanitizeWebClippingTitle', () => {
  it('replaces slash colon star with underscore', () => {
    assert.equal(sanitizeWebClippingTitle('a/b:c*d'), 'a_b_c_d');
  });

  it('limits to 48 chars', () => {
    const result = sanitizeWebClippingTitle('x'.repeat(100));
    assert.ok(result.length <= 48);
  });

  it('falls back to untitled for empty', () => {
    assert.equal(sanitizeWebClippingTitle(''), 'untitled');
  });
});

describe('buildWebClippingFileName', () => {
  it('uses date + title + hash', () => {
    const name = buildWebClippingFileName({ title: 'H200供应', url: 'https://example.com/a', date: '2026-05-09' });
    const hash = shortHash('https://example.com/a');
    assert.equal(name, `2026-05-09-H200供应-${hash}.md`);
  });

  it('falls back to hostname when title is empty', () => {
    const name = buildWebClippingFileName({ title: '', url: 'https://example.com/article', date: '2026-05-09' });
    assert.ok(name.includes('example.com'));
  });
});

describe('makeUniqueWebClippingPath', () => {
  it('returns base path when no conflict', () => {
    const s = new Set<string>();
    assert.equal(makeUniqueWebClippingPath('test.md', p => s.has(p)), `${WEB_CLIPPINGS_DIR}/test.md`);
  });

  it('generates name-1.md on conflict', () => {
    const s = new Set<string>([`${WEB_CLIPPINGS_DIR}/test.md`]);
    assert.equal(makeUniqueWebClippingPath('test.md', p => s.has(p)), `${WEB_CLIPPINGS_DIR}/test-1.md`);
  });

  it('generates name-2.md when -1 also exists', () => {
    const s = new Set<string>([`${WEB_CLIPPINGS_DIR}/test.md`, `${WEB_CLIPPINGS_DIR}/test-1.md`]);
    assert.equal(makeUniqueWebClippingPath('test.md', p => s.has(p)), `${WEB_CLIPPINGS_DIR}/test-2.md`);
  });
});

describe('webClippingEmbed', () => {
  it('wraps in embed syntax', () => {
    assert.equal(webClippingEmbed('Daily/webclippings/x.md'), '![[Daily/webclippings/x.md]]');
  });
});

describe('formatWebClippingMarkdown', () => {
  it('includes frontmatter with title/url/clippedAt/source', () => {
    const doc = { title: 'Test', url: 'https://x.com', clippedAt: '2026-01-01T00:00Z', source: 'web-clipper' as const, content: 'Body' };
    const md = formatWebClippingMarkdown(doc);
    assert.ok(md.includes('title: Test'));
    assert.ok(md.includes('url:') && md.includes('https://x.com'));
    assert.ok(md.includes('clippedAt: 2026-01-01T00:00Z'));
    assert.ok(md.includes('source: web-clipper'));
    assert.ok(md.includes('Body'));
  });
});

describe('extractURLs strips Chinese text', () => {
  const { extractURLs } = require('../../src/utils/web-clipper');

  it('strips Chinese text after URL', () => {
    const urls = extractURLs('https://example.com/a，挺好');
    assert.deepEqual(urls, ['https://example.com/a']);
  });

  it('strips Chinese sentence after period', () => {
    const urls = extractURLs('链接https://example.com/a。下一句');
    assert.deepEqual(urls, ['https://example.com/a']);
  });

  it('keeps valid URL intact', () => {
    const urls = extractURLs('see https://example.com/path?q=1');
    assert.deepEqual(urls, ['https://example.com/path?q=1']);
  });

  it('handles multiple URLs', () => {
    const urls = extractURLs('a https://a.com，好 b https://b.com。完');
    assert.deepEqual(urls, ['https://a.com', 'https://b.com']);
  });
});

describe('replaceUrlWithEmbed', () => {
  it('replaces only target URL', () => {
    const result = replaceUrlWithEmbed('see https://a.com and https://b.com', 'https://a.com', '![[clip.md]]');
    assert.equal(result, 'see ![[clip.md]] and https://b.com');
  });

  it('does not affect text without URL', () => {
    assert.equal(replaceUrlWithEmbed('hello', 'https://x.com', '![[x]]'), 'hello');
  });
});
