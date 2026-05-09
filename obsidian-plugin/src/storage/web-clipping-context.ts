/**
 * Web Clipping Context — Extract, summarize, and format web clipping content
 * for inclusion as supplementary context in AI analysis prompts.
 *
 * Pure functions (no Obsidian API dependency) for testability.
 * Vault read operations live in the caller (block-editor / main).
 */

export interface WebClippingContextItem {
	path: string;
	title?: string;
	url?: string;
	summary: string;
}

const EMBED_REGEX = /!\[\[(Daily\/webclippings\/[^\]]+\.md)(?:\|[^\]]*)?\]\]/g;

/**
 * Extract unique web clipping embed paths from block content.
 * Only matches ![[Daily/webclippings/<name>.md]] with optional alias.
 */
export function extractWebClippingEmbedPaths(content: string): string[] {
	const paths = new Set<string>();
	let match: RegExpExecArray | null;
	// Reset regex state
	EMBED_REGEX.lastIndex = 0;
	while ((match = EMBED_REGEX.exec(content)) !== null) {
		paths.add(match[1]);
	}
	return Array.from(paths);
}

const DEFAULT_MAX_CHARS = 800;

/**
 * Generate a deterministic summary from a web clipping Markdown file.
 * Strips YAML frontmatter, removes title duplication, removes Source line,
 * collapses whitespace, and truncates to maxChars.
 */
export function summarizeWebClippingMarkdown(
	markdown: string,
	maxChars = DEFAULT_MAX_CHARS,
): { title?: string; url?: string; summary: string } {
	// Remove YAML frontmatter
	let body = markdown;
	let title: string | undefined;
	let url: string | undefined;

	const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
	if (fmMatch) {
		const fm = fmMatch[1];
		body = markdown.slice(fmMatch[0].length);

		const titleMatch = fm.match(/^title:\s*(.+)$/m);
		if (titleMatch) {
			title = titleMatch[1].replace(/^["']|["']$/g, '').trim();
		}
		const urlMatch = fm.match(/^url:\s*(.+)$/m);
		if (urlMatch) {
			url = urlMatch[1].replace(/^["']|["']$/g, '').trim();
		}
	}

	// Remove the "# Title" heading (duplicate of frontmatter title) and "> Source:" line
	let cleaned = body
		.replace(/^#\s+.+$/m, '')
		.replace(/^>\s*Source:.*$/m, '')
		// Collapse multi-blank lines to single blank
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	// Truncate to maxChars; try to break at a sentence/word boundary
	if (cleaned.length > maxChars) {
		const cut = cleaned.slice(0, maxChars);
		// Prefer breaking at the last sentence-ending char
		const lastPeriod = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('. '), cut.lastIndexOf('！'), cut.lastIndexOf('？'));
		if (lastPeriod > maxChars * 0.6) {
			cleaned = cut.slice(0, Math.max(0, lastPeriod + 1 - 3)) + '...';
		} else {
			// Break at last space
			const lastSpace = cut.lastIndexOf(' ');
			if (lastSpace > maxChars * 0.6) {
				cleaned = cut.slice(0, Math.max(0, lastSpace - 3)) + '...';
			} else {
				cleaned = cut.slice(0, Math.max(0, maxChars - 3)) + '...';
			}
		}
	}

	return { title, url, summary: cleaned };
}

const DEFAULT_TOTAL_MAX_CHARS = 2000;

/**
 * Build a formatted context string from web clipping context items.
 */
export function buildWebClippingContext(
	items: WebClippingContextItem[],
	maxTotalChars = DEFAULT_TOTAL_MAX_CHARS,
): string {
	if (items.length === 0) return '';

	let result = '## 附加网页剪藏摘要\n\n';
	result += '以下内容来自用户在日记中引用的网页剪藏，已做摘要。可作为理解日记背景的辅助信息，但实体提取仍以日记文本和用户真实表达为主。\n';

	let totalUsed = result.length;
	let included = 0;

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const lines: string[] = [];
		lines.push(`\n${i + 1}. 标题：${item.title || '（无标题）'}`);
		if (item.url) lines.push(`   来源：${item.url}`);
		lines.push(`   摘要：${item.summary}`);

		const entry = lines.join('\n');
		if (totalUsed + entry.length > maxTotalChars) {
			// If can't fit even the first item, include truncated
			if (included === 0) {
				const remaining = Math.max(0, maxTotalChars - totalUsed);
				if (remaining > 3) {
					result += entry.slice(0, remaining - 3) + '...';
				} else {
					result = result.slice(0, maxTotalChars);
				}
			}
			break;
		}
		result += entry;
		totalUsed += entry.length;
		included++;
	}

	return result;
}
