import type { ClipResult } from '../utils/web-clipper';

export const WEB_CLIPPINGS_DIR = 'Daily/webclippings';

export interface WebClippingDocument {
  title: string;
  url: string;
  siteName?: string;
  author?: string;
  clippedAt: string;
  source: 'opencli-weixin' | 'web-clipper';
  content: string;
}

export function sanitizeWebClippingTitle(value: string): string {
  return (value || 'untitled')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\n\r]/g, ' ')
    .trim()
    .slice(0, 48) || 'untitled';
}

export function shortHash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) - h) + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0').slice(0, 8);
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

export function buildWebClippingFileName(input: {
  title?: string;
  url: string;
  date: string;
}): string {
  const label = sanitizeWebClippingTitle(input.title || hostFromUrl(input.url));
  const hash = shortHash(input.url);
  return `${input.date}-${label}-${hash}.md`;
}

export function makeUniqueWebClippingPath(
  fileName: string,
  exists: (path: string) => boolean,
): string {
  let path = `${WEB_CLIPPINGS_DIR}/${fileName}`;
  if (!exists(path)) return path;
  const dotIdx = fileName.lastIndexOf('.');
  const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
  const ext = dotIdx > 0 ? fileName.slice(dotIdx) : '';
  for (let i = 1; i < 100; i++) {
    path = `${WEB_CLIPPINGS_DIR}/${base}-${i}${ext}`;
    if (!exists(path)) return path;
  }
  return `${WEB_CLIPPINGS_DIR}/${base}-${Date.now()}${ext}`;
}

export function webClippingEmbed(path: string): string {
  return `![[${path}]]`;
}

function escapeYamlValue(v: string): string {
  // Quote if value contains special YAML characters, newlines, or backslash
  if (/["':{},&*?|<>!%@`#]/.test(v) || v.includes('\n') || v.includes('\\')) {
    return `"${v.replace(/"/g, '\\"')}"`;
  }
  return v;
}

export function formatWebClippingMarkdown(doc: WebClippingDocument): string {
  const fm: string[] = [
    `title: ${escapeYamlValue(doc.title)}`,
    `url: ${escapeYamlValue(doc.url)}`,
  ];
  if (doc.siteName) fm.push(`siteName: ${escapeYamlValue(doc.siteName)}`);
  if (doc.author) fm.push(`author: ${escapeYamlValue(doc.author)}`);
  fm.push(`clippedAt: ${doc.clippedAt}`);
  fm.push(`source: ${doc.source}`);
  return `---\n${fm.join('\n')}\n---\n\n# ${doc.title}\n\n> Source: ${doc.url}\n\n${doc.content}`;
}

export function replaceUrlWithEmbed(content: string, url: string, embed: string): string {
  // Replace exact URL occurrence
  return content.split(url).join(embed);
}

export function clippingFromClipResult(result: ClipResult, source: 'opencli-weixin' | 'web-clipper', clippedAt: string): WebClippingDocument {
  return {
    title: result.title || 'Untitled',
    url: result.url,
    siteName: result.siteName,
    author: result.author,
    clippedAt,
    source,
    content: result.content,
  };
}
