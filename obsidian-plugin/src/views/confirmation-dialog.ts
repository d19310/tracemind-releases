import type { AnalysisResult, EntityType, EntityCreateInput } from '../entities/types';

export interface ConfirmationItem {
  id: string;
  entityType: EntityType | 'category';
  name: string;
  confidence: number;
  context: string;
  blockId: string;
}

/** Narrowed confirmation item — only entity confirmations, never 'category'. */
export interface EntityConfirmationItem extends ConfirmationItem {
  entityType: EntityType;
}

function generateConfirmId(): string {
  return `confirm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function entityGroupToType(group: keyof AnalysisResult['entities']): EntityType {
  if (group === 'people') return 'person';
  if (group === 'objects') return 'object';
  return 'theme';
}

export function generateConfirmationItems(result: AnalysisResult): ConfirmationItem[] {
  const items: ConfirmationItem[] = [];

  if (result.category === '待确认') {
    items.push({
      id: generateConfirmId(),
      entityType: 'category',
      name: '分类待确认',
      confidence: 1.0,
      context: '请确认这条日记是工作还是个人内容',
      blockId: result.blockId,
    });
  }

  const entityTypes: (keyof AnalysisResult['entities'])[] = ['people', 'objects', 'dimensions'];

  for (const group of entityTypes) {
    const entities = result.entities[group];
    const typeKey = entityGroupToType(group);

    for (const entity of entities) {
      if (entity.newEntity && !entity.isArchived) {
        const confirmKey = `${typeKey}:${entity.name}`;
        if (result.needsConfirmation.includes(confirmKey)) {
          items.push({
            id: generateConfirmId(),
            entityType: typeKey,
            name: entity.name,
            confidence: entity.confidence,
            context: entity.context,
            blockId: result.blockId,
          });
        }
      }
    }
  }

  return items;
}

export function createEntityFromConfirmation(item: EntityConfirmationItem): EntityCreateInput {
  return {
    type: item.entityType,
    title: item.name,
    titleRaw: item.name,
    aliases: [],
    tags: [],
    summary: item.context,
    confidence: item.confidence,
    verificationStatus: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: 'human',
    lastUpdated: new Date().toISOString(),
    relatedEntities: [],
    interactions: [{
      timestamp: new Date().toISOString(),
      type: 'user_feedback',
      content: `用户确认创建实体: ${item.name}`,
      sourceBlockId: item.blockId,
    }],
    metadata: { status: 'active', source: 'diary' },
  };
}

export function getEntityTypeLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    person: '人',
    object: '对象',
    theme: '主题',
  };
  return labels[type];
}

export function getEntityTypeEmoji(type: EntityType): string {
  const emojis: Record<EntityType, string> = {
    person: '👤',
    object: '📋',
    theme: '💭',
  };
  return emojis[type];
}
