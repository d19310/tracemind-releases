/**
 * Aho-Corasick Entity Scanner
 *
 * Builds an AC automaton from the entity index and pre-scans diary text
 * to find known entity mentions before LLM extraction.
 *
 * Layered matching: exact → alias → prefix (per PRD spec)
 */

import type { IndexEntry } from '../storage/entity-index';

/** A single match result from a scan */
export interface EntityMatch {
  /** The matched text in the diary */
  matchedText: string;
  /** The entity name this matched */
  entityName: string;
  /** Entry ID from the entity index */
  entityId: string;
  /** Match method */
  matchType: 'exact' | 'alias' | 'prefix';
  /** Position in the diary text */
  position: number;
}

/**
 * AC automaton trie node
 */
interface TrieNode {
  children: Map<string, TrieNode>;
  fail: TrieNode | null;
  output: Array<{
    entityName: string;
    entityId: string;
    matchType: 'exact' | 'alias' | 'prefix';
    patternLen: number;
  }>;
}

/**
 * Build an AC automaton from a list of patterns.
 */
function buildACTrie(patterns: Array<{ text: string; entityName: string; entityId: string; matchType: 'exact' | 'alias' | 'prefix' }>): TrieNode {
  const root: TrieNode = { children: new Map(), fail: null, output: [] };

  // Phase 1: Build trie
  for (const p of patterns) {
    let node = root;
    for (const ch of p.text) {
      let child = node.children.get(ch);
      if (!child) {
        child = { children: new Map(), fail: null, output: [] };
        node.children.set(ch, child);
      }
      node = child;
    }
    node.output.push({
      entityName: p.entityName,
      entityId: p.entityId,
      matchType: p.matchType,
      patternLen: p.text.length,
    });
  }

  // Phase 2: Build failure links (BFS)
  const queue: TrieNode[] = [];
  for (const child of root.children.values()) {
    child.fail = root;
    queue.push(child);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const [ch, child] of current.children) {
      queue.push(child);
      let failNode = current.fail;
      while (failNode !== null && !failNode.children.has(ch)) {
        failNode = failNode.fail;
      }
      child.fail = failNode ? (failNode.children.get(ch) || root) : root;
      // Inherit outputs from fail node
      if (child.fail) {
        child.output.push(...child.fail.output);
      }
    }
  }

  return root;
}

/**
 * Scan text with the AC automaton, returning all matches.
 */
function scanWithACTrie(root: TrieNode, text: string): EntityMatch[] {
  const matches: EntityMatch[] = [];
  const seen = new Set<string>(); // deduplicate by entityId
  let node: TrieNode = root as any;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    while (node !== (root as any) && !node.children.has(ch)) {
      node = node.fail as TrieNode;
    }
    const next = node.children.get(ch);
    if (next) {
      node = next;
    } else {
      node = root as any;
    }

    // Collect outputs at this position
    for (const out of node.output) {
      const key = out.entityId + ':' + out.matchType;
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({
          matchedText: text.slice(i - out.patternLen + 1, i + 1),
          entityName: out.entityName,
          entityId: out.entityId,
          matchType: out.matchType,
          position: i - out.patternLen + 1,
        });
      }
    }
  }

  return matches;
}

/**
 * Scan diary text against the entity index using AC automaton.
 * Returns known entities found in the text.
 *
 * Matching layers:
 * 1. Exact: entity name appears as-is in text
 * 2. Alias: entity alias appears in text
 * 3. Prefix: first 2+ characters of entity name appear (for Chinese names)
 */
export function scanDiaryForKnownEntities(
  diaryText: string,
  indexEntries: IndexEntry[],
): EntityMatch[] {
  if (indexEntries.length === 0) return [];

  const patterns: Array<{ text: string; entityName: string; entityId: string; matchType: 'exact' | 'alias' | 'prefix' }> = [];

  for (const entry of indexEntries) {
    // Layer 1: Exact name match
    if (entry.name.length >= 2) {
      patterns.push({
        text: entry.name,
        entityName: entry.name,
        entityId: entry.id,
        matchType: 'exact',
      });
    }

    // Layer 2: Alias matches
    for (const alias of entry.aliases || []) {
      if (alias.length >= 2) {
        patterns.push({
          text: alias,
          entityName: entry.name,
          entityId: entry.id,
          matchType: 'alias',
        });
      }
    }

    // Layer 3: Prefix match (first 4 chars, >=4 char entities only)
    // e.g. "字节跳动910C" matches "字节910C项目" but "上海电力" does not match "上海电信"
    if (entry.name.length >= 4) {
      const prefix = entry.name.slice(0, 4);
      const existing = patterns.filter(p => p.entityId === entry.id && p.text === prefix);
      if (existing.length === 0) {
        patterns.push({
          text: prefix,
          entityName: entry.name,
          entityId: entry.id,
          matchType: 'prefix',
        });
      }
    }
  }

  // Sort by pattern length descending for greedy longest match
  patterns.sort((a, b) => b.text.length - a.text.length);

  const root = buildACTrie(patterns);
  return scanWithACTrie(root, diaryText);
}
