/**
 * Block ID format verification.
 *
 * Valid formats:
 * - Daily notes: YYYY-MM-DD (e.g. 2026-05-03)
 * - Custom blocks: YYYY-MM-DD_blockId (e.g. 2026-05-03_morning)
 * - Generated: block-<hex> (e.g. block-a1b2c3)
 */

const DAILY_RE = /^\d{4}-\d{2}-\d{2}$/;
const CUSTOM_RE = /^\d{4}-\d{2}-\d{2}_[\w-]+$/;
const GENERATED_RE = /^block-[a-f0-9]+$/i;

/**
 * Check if a block ID follows the TraceMind format.
 */
export function isValidBlockId(id: string): boolean {
  if (!id || id.length === 0) return false;
  return DAILY_RE.test(id) || CUSTOM_RE.test(id) || GENERATED_RE.test(id);
}

/**
 * Validate a block ID and return an error message if invalid.
 * Returns null if valid.
 */
export function validateBlockId(id: string): string | null {
  if (isValidBlockId(id)) return null;
  return `无效的块ID格式: "${id}"。应为 YYYY-MM-DD、YYYY-MM-DD_name 或 block-<hex>`;
}
