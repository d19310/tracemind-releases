import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	extractWebClippingEmbedPaths,
	summarizeWebClippingMarkdown,
	buildWebClippingContext,
} from '../../src/storage/web-clipping-context';

describe('extractWebClippingEmbedPaths', () => {
	it('extracts a single Daily/webclippings embed', () => {
		const content = '今天看了这篇文章：![[Daily/webclippings/2026-05-09-test-a1b2c3d4.md]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, ['Daily/webclippings/2026-05-09-test-a1b2c3d4.md']);
	});

	it('supports Obsidian alias syntax', () => {
		const content = '![[Daily/webclippings/x.md|标题]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, ['Daily/webclippings/x.md']);
	});

	it('deduplicates the same path', () => {
		const content = 'a ![[Daily/webclippings/x.md]] b ![[Daily/webclippings/x.md]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, ['Daily/webclippings/x.md']);
	});

	it('extracts multiple distinct paths', () => {
		const content = '![[Daily/webclippings/a.md]] and ![[Daily/webclippings/b.md]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.equal(paths.length, 2);
		assert.ok(paths.includes('Daily/webclippings/a.md'));
		assert.ok(paths.includes('Daily/webclippings/b.md'));
	});

	it('ignores plain URLs', () => {
		const content = 'see https://example.com/article';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, []);
	});

	it('ignores regular wikilinks', () => {
		const content = '[[Some Note]] and [[Daily/webclippings/x.md]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, []);
	});

	it('ignores attachment embeds', () => {
		const content = '![[Daily/attachments/photo.png]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, []);
	});

	it('ignores embeds from other directories', () => {
		const content = '![[TraceMind/index/something.md]]';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, []);
	});

	it('returns empty array when no embeds present', () => {
		const content = '今天的日记内容，没有任何嵌入。';
		const paths = extractWebClippingEmbedPaths(content);
		assert.deepEqual(paths, []);
	});

	it('works with empty input', () => {
		assert.deepEqual(extractWebClippingEmbedPaths(''), []);
	});
});

describe('summarizeWebClippingMarkdown', () => {
	it('extracts title and url from frontmatter', () => {
		const md = [
			'---',
			'title: H200供货紧张',
			'url: https://example.com/article',
			'clippedAt: 2026-05-09',
			'source: web-clipper',
			'---',
			'',
			'# H200供货紧张',
			'',
			'> Source: https://example.com/article',
			'',
			'这是正文内容。详细描述了H200芯片的供货情况。',
		].join('\n');

		const result = summarizeWebClippingMarkdown(md);
		assert.equal(result.title, 'H200供货紧张');
		assert.equal(result.url, 'https://example.com/article');
	});

	it('strips heading and Source line from body', () => {
		const md = [
			'---',
			'title: Test Article',
			'url: https://example.com',
			'---',
			'',
			'# Test Article',
			'',
			'> Source: https://example.com',
			'',
			'The quick brown fox jumps over the lazy dog.',
		].join('\n');

		const result = summarizeWebClippingMarkdown(md);
		assert.ok(!result.summary.includes('# Test Article'));
		assert.ok(!result.summary.includes('> Source'));
		assert.ok(result.summary.includes('quick brown fox'));
	});

	it('truncates content exceeding maxChars', () => {
		const longContent = 'A'.repeat(2000);
		const md = [
			'---',
			'title: Long Article',
			'url: https://example.com/long',
			'---',
			'',
			'# Long Article',
			'',
			'> Source: https://example.com/long',
			'',
			longContent,
		].join('\n');

			const result = summarizeWebClippingMarkdown(md, 500);
			assert.ok(result.summary.length <= 500);
			assert.ok(result.summary.endsWith('...'));
	});

	it('does not truncate short content', () => {
		const md = [
			'---',
			'title: Short',
			'url: https://example.com/short',
			'---',
			'',
			'# Short',
			'',
			'> Source: https://example.com/short',
			'',
			'A brief note.',
		].join('\n');

		const result = summarizeWebClippingMarkdown(md);
		assert.ok(!result.summary.endsWith('...'));
	});

	it('handles markdown without frontmatter', () => {
		const md = 'Just raw text without frontmatter.';
		const result = summarizeWebClippingMarkdown(md);
		assert.equal(result.title, undefined);
		assert.equal(result.url, undefined);
		assert.ok(result.summary.includes('Just raw text'));
	});

	it('collapses multiple blank lines', () => {
		const md = [
			'---',
			'title: Test',
			'url: https://example.com',
			'---',
			'',
			'# Test',
			'',
			'> Source: https://example.com',
			'',
			'',
			'',
			'Paragraph one.',
			'',
			'',
			'',
			'',
			'Paragraph two.',
		].join('\n');

		const result = summarizeWebClippingMarkdown(md);
		assert.ok(!result.summary.includes('\n\n\n'));
	});

	it('handles quoted YAML values', () => {
		const md = [
			'---',
			'title: "Article: With Colon"',
			'url: "https://example.com/a?b=c"',
			'---',
			'',
			'Content here.',
		].join('\n');

		const result = summarizeWebClippingMarkdown(md);
		assert.equal(result.title, 'Article: With Colon');
		assert.equal(result.url, 'https://example.com/a?b=c');
	});

	it('returns empty summary for empty content', () => {
		const result = summarizeWebClippingMarkdown('');
		assert.equal(result.summary, '');
	});
});

describe('buildWebClippingContext', () => {
	it('builds formatted context from items', () => {
		const items = [
			{ path: 'Daily/webclippings/a.md', title: 'Article A', url: 'https://a.com', summary: 'Summary of A.' },
		];
		const ctx = buildWebClippingContext(items);
		assert.ok(ctx.includes('附加网页剪藏摘要'));
		assert.ok(ctx.includes('Article A'));
		assert.ok(ctx.includes('https://a.com'));
		assert.ok(ctx.includes('Summary of A.'));
	});

	it('returns empty string for empty items', () => {
		assert.equal(buildWebClippingContext([]), '');
	});

	it('enforces total length cap', () => {
		const items = [
			{ path: 'a.md', title: 'Long Title', url: 'https://long.com', summary: 'X'.repeat(3000) },
		];
			const ctx = buildWebClippingContext(items, 500);
			assert.ok(ctx.length <= 500, `Context length ${ctx.length} exceeds cap`);
	});

	it('includes numbering for multiple items', () => {
		const items = [
			{ path: 'a.md', title: 'A', url: 'https://a.com', summary: 'Summary A.' },
			{ path: 'b.md', title: 'B', url: 'https://b.com', summary: 'Summary B.' },
		];
		const ctx = buildWebClippingContext(items);
		assert.ok(ctx.includes('1. 标题'));
		assert.ok(ctx.includes('2. 标题'));
	});

	it('shows （无标题） for missing title', () => {
		const items = [
			{ path: 'a.md', summary: 'Just summary.' },
		];
		const ctx = buildWebClippingContext(items);
		assert.ok(ctx.includes('（无标题）'));
	});
});
