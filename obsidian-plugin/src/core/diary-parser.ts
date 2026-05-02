/**
 * Diary Block Parser
 * Parses Obsidian diary format into structured Block objects.
 *
 * Format:
 * ### HH:mm #tag1 #tag2
 * Content text.
 * - child bullet 1
 * - child bullet 2
 * <!-- TM:blockId -->
 */

export interface Block {
  timestamp: string;
  content: string;
  tags: string[];
  blockId: string;
  children: string[];
}

const BLOCK_HEADER_RE = /^###\s+(\d{2}:\d{2})\s+(.+)$/m;
const BLOCK_ID_RE = /<!--\s*TM:([a-z0-9]+)\s*-->/;

/**
 * Generate a unique block ID (8-char hex)
 */
function generateBlockId(): string {
  return Math.random().toString(16).slice(2, 10).padStart(8, '0');
}

/**
 * Parse diary markdown content into an array of Block objects
 */
export function parseDiaryContent(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(BLOCK_HEADER_RE);

    if (headerMatch) {
      const timestamp = headerMatch[1];
      const tagString = headerMatch[2].trim();
      const tags = tagString.split(/\s+/).filter(t => t.startsWith('#')).map(t => t.slice(1));

      i++;
      const contentLines: string[] = [];
      const children: string[] = [];

      // Collect content lines until next block header or end
      while (i < lines.length) {
        const nextLine = lines[i];

        // Stop at next block header
        if (nextLine.match(BLOCK_HEADER_RE)) break;

        // Skip blank lines
        if (!nextLine.trim()) {
          i++;
          continue;
        }

        // Check for block ID comment
        const idMatch = nextLine.match(BLOCK_ID_RE);
        if (idMatch) {
          const blockId = idMatch[1];
          blocks.push({
            timestamp,
            content: contentLines.join('\n').trim(),
            tags,
            blockId,
            children,
          });
          i++;
          break; // exit inner loop, move to next outer iteration
        }

        // Collect child bullets
        if (nextLine.startsWith('- ') || nextLine.startsWith('* ')) {
          children.push(nextLine.replace(/^[-*]\s+/, ''));
        } else {
          // Regular content line
          contentLines.push(nextLine);
        }

        i++;
      }

      // If we reached end without finding block ID, generate one
      if (contentLines.length > 0 || children.length > 0) {
        const lastBlock = blocks[blocks.length - 1];
        if (!lastBlock || lastBlock.timestamp !== timestamp) {
          blocks.push({
            timestamp,
            content: contentLines.join('\n').trim(),
            tags,
            blockId: generateBlockId(),
            children,
          });
        }
      }
    } else {
      i++;
    }
  }

  return blocks;
}

/**
 * Format Block objects back to diary markdown
 */
export function formatDiaryContent(blocks: Block[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    const header = `### ${block.timestamp} ${block.tags.map(t => `#${t}`).join(' ')}`;
    parts.push(header);

    if (block.content) {
      parts.push(block.content);
    }

    for (const child of block.children) {
      parts.push(`- ${child}`);
    }

    parts.push(`<!-- TM:${block.blockId} -->`);
    parts.push(''); // blank line between blocks
  }

  return parts.join('\n');
}
