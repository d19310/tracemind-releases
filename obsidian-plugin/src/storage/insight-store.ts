/**
 * Insight Report Store - Data model and serialization for daily insight reports.
 * Stored as TraceMind/insights/YYYY-MM-DD.md with YAML frontmatter.
 *
 * Pure functions only — no Obsidian dependencies.
 */

export interface InsightReport {
  date: string;           // YYYY-MM-DD
  content: string;        // Full Markdown report body (6 sections)
  contentHash: string;    // SHA-256 hex hash of (todayBlocks + yesterdayBlocks)
  generatedAt: string;    // ISO 8601 timestamp
  blockCount: number;     // Number of blocks in today's diary
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

/**
 * Parse an insight Markdown file with YAML frontmatter into an InsightReport.
 * Returns null if the frontmatter is missing or malformed.
 */
export function parseInsightMarkdown(markdown: string): InsightReport | null {
  const match = markdown.match(FRONTMATTER_RE);
  if (!match) return null;

  const yamlStr = match[1];
  const body = markdown.slice(match[0].length);

  const frontmatter: Record<string, string> = {};
  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key && value) frontmatter[key] = value;
  }

  const date = frontmatter['date'];
  const contentHash = frontmatter['contentHash'];
  const generatedAt = frontmatter['generatedAt'];
  const blockCount = parseInt(frontmatter['blockCount'] || '0', 10);

  if (!date || !contentHash || !generatedAt || !body.trim()) return null;

  return {
    date,
    content: body.trim(),
    contentHash,
    generatedAt,
    blockCount,
  };
}

/**
 * Format an InsightReport to Markdown with YAML frontmatter.
 * The body is the raw 6-section Markdown content from the LLM.
 */
export function formatInsightMarkdown(report: InsightReport): string {
  const frontmatter = [
    '---',
    `date: ${report.date}`,
    `generatedAt: ${report.generatedAt}`,
    `contentHash: ${report.contentHash}`,
    `blockCount: ${report.blockCount}`,
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${report.content}\n`;
}

/**
 * Construct the vault file path for an insight report.
 * Example: "TraceMind/insights/2026-05-04.md"
 */
export function insightFilePath(date: string): string {
  return `TraceMind/insights/${date}.md`;
}
