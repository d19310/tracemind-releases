import type { App } from 'obsidian';
import { EntityIndex, serializeIndex, parseIndex } from './entity-index';
import { ensureParentFolder } from '../vault/vault';

export const ENTITY_INDEX_PATH = 'TraceMind/index/entity-index.json';

export async function saveEntityIndex(app: App, index: EntityIndex): Promise<void> {
  await ensureParentFolder(app, ENTITY_INDEX_PATH);
  const json = serializeIndex(index);
  const existing = app.vault.getFileByPath(ENTITY_INDEX_PATH);
  if (existing) {
    await app.vault.modify(existing, json);
  } else {
    await app.vault.create(ENTITY_INDEX_PATH, json);
  }
}

export async function loadEntityIndex(app: App): Promise<EntityIndex | null> {
  const file = app.vault.getFileByPath(ENTITY_INDEX_PATH);
  if (!file) return null;
  try {
    return parseIndex(await app.vault.read(file));
  } catch {
    return null;
  }
}
