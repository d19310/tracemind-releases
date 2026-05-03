/**
 * Entity Index Store
 * Stores metadata for fast entity search across the vault.
 * Index is rebuilt on startup and incrementally updated on card changes.
 */

export interface IndexEntry {
  id: string;
  name: string;
  cardType: 'person' | 'object' | 'theme';
  type?: string; // LifeWiki entity type alias (person/project/thing/idea/knowledge)
  subtype?: string;
  maturity: string;
  confidence: number;
  filePath: string;
  aliases: string[];
  relationCount: number;
  lastUpdated: string;
  // Extended fields for view compatibility
  interactions?: Array<{ timestamp: string; type: string; content: string; sourceBlockId?: string }>;
  metadata?: Record<string, unknown>;
  relatedEntities?: Array<{ entityId: string; relation: string }>;
}

export interface EntityIndex {
  entries: IndexEntry[];
  lastRebuild: string;
}

/**
 * Search entities by name (case-insensitive partial match)
 */
export function searchByName(index: EntityIndex, query: string): IndexEntry[] {
  const lower = query.toLowerCase();
  return index.entries.filter(entry =>
    entry.name.toLowerCase().includes(lower) ||
    entry.aliases.some(a => a.toLowerCase().includes(lower))
  );
}

/**
 * Search entities by type
 */
export function searchByType(index: EntityIndex, cardType: string): IndexEntry[] {
  return index.entries.filter(e => e.cardType === cardType);
}

/**
 * Get entities sorted by priority score
 * score = frequency × (1 + log(relation_count)) × confidence
 */
export function getTopEntities(index: EntityIndex, limit: number = 10): IndexEntry[] {
  const scored = index.entries.map(entry => ({
    ...entry,
    score: entry.confidence * (1 + Math.log1p(entry.relationCount)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Upsert an entry into the index
 */
export function upsertEntry(index: EntityIndex, entry: IndexEntry): EntityIndex {
  const existingIdx = index.entries.findIndex(e => e.id === entry.id);
  const updated = [...index.entries];
  if (existingIdx >= 0) {
    updated[existingIdx] = entry;
  } else {
    updated.push(entry);
  }
  return { entries: updated, lastRebuild: index.lastRebuild };
}

/**
 * Remove an entry from the index
 */
export function removeEntry(index: EntityIndex, id: string): EntityIndex {
  return {
    entries: index.entries.filter(e => e.id !== id),
    lastRebuild: index.lastRebuild,
  };
}

/**
 * Serialize index to JSON string for storage
 */
export function serializeIndex(index: EntityIndex): string {
  return JSON.stringify(index, null, 2);
}

/**
 * Parse index from JSON string
 */
export function parseIndex(json: string): EntityIndex {
  const data = JSON.parse(json);
  return {
    entries: data.entries || [],
    lastRebuild: data.lastRebuild || new Date().toISOString(),
  };
}
