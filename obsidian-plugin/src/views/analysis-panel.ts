import type { AnalysisResult, EntityPreview, EntityType } from '../entities/types';

export interface EntityDisplayItem {
  type: EntityType;
  name: string;
  confidence: number;
  context: string;
  isArchived: boolean;
  newEntity?: boolean;
  displayText: string;
  statusLabel: string;
}

export interface AnalysisSummary {
  totalEntities: number;
  archivedCount: number;
  newCount: number;
  people: EntityDisplayItem[];
  objects: EntityDisplayItem[];
  dimensions: EntityDisplayItem[];
}

function toDisplayItem(entity: EntityPreview): EntityDisplayItem {
  return {
    type: entity.type,
    name: entity.name,
    confidence: entity.confidence,
    context: entity.context,
    isArchived: entity.isArchived,
    newEntity: entity.newEntity,
    displayText: entity.name,
    statusLabel: entity.isArchived ? '已归档' : '未归档',
  };
}

export function generateAnalysisSummary(result: AnalysisResult): AnalysisSummary {
  const summary: AnalysisSummary = {
    totalEntities: 0, archivedCount: 0, newCount: 0,
    people: [], objects: [], dimensions: [],
  };

  const processGroup = (entities: EntityPreview[], target: EntityDisplayItem[]) => {
    for (const e of entities) {
      const item = toDisplayItem(e);
      target.push(item);
      summary.totalEntities++;
      if (e.isArchived) summary.archivedCount++;
      if (e.newEntity) summary.newCount++;
    }
  };

  processGroup(result.entities.people, summary.people);
  processGroup(result.entities.objects, summary.objects);
  processGroup(result.entities.dimensions, summary.dimensions);

  return summary;
}

export type AnalysisEntitySection = 'people' | 'objects' | 'dimensions';

export function getSectionTitle(section: AnalysisEntitySection): string {
  const titles: Record<AnalysisEntitySection, string> = {
    people: '人',
    objects: '对象',
    dimensions: '主题',
  };
  return titles[section] || section;
}

export function getEntityEmoji(type: EntityType): string {
  const emojis: Record<EntityType, string> = {
    person: '👤',
    object: '📋',
    theme: '💭',
  };
  return emojis[type] || '📄';
}
