/**
 * Entity Type Configuration
 *
 * Single source of truth for entity type definitions.
 * Loaded at runtime from TraceMind/entity-type-config.json in vault.
 * Falls back to DEFAULT_CONFIG if file not found or invalid.
 *
 * To modify: edit the JSON file in vault, then reload plugin.
 * No rebuild needed.
 */

export interface SubtypeConfig {
  priority: 'P0' | 'P1' | 'P2';
  label: string;
  hints?: string[];
}

export interface EntityTypeConfig {
  label: string;
  subtypes?: Record<string, SubtypeConfig>;
  p0: string[];
  p1: string[];
  p2: string[];
}

export interface AttributeLabelMap {
  [key: string]: string;
}

export interface EntityTypeConfigFile {
  entityTypes: Record<string, EntityTypeConfig>;
  attributeLabels: AttributeLabelMap;
}

// ---------------------------------------------------------------------------
// DEFAULT_CONFIG is now derived from the entity schema.
// ---------------------------------------------------------------------------

import {
  getEntitySchema,
  getAttributesByPriority,
  ATTRIBUTE_PRIORITY,
} from '../core/entity-schema';
import type { CardType } from '../core/context-card';

function buildDefaultConfig(): EntityTypeConfigFile {
  const entityTypes: Record<string, EntityTypeConfig> = {};
  const attributeLabels: AttributeLabelMap = {};

  const cardTypes: CardType[] = ['person', 'object', 'theme'];

  for (const cardType of cardTypes) {
    const schema = getEntitySchema(cardType);
    const attrs = ATTRIBUTE_PRIORITY[cardType]; // common attributes for Phase 1

    const config: EntityTypeConfig = {
      label: schema.label,
      p0: attrs.p0,
      p1: attrs.p1,
      p2: attrs.p2,
    };

    if (schema.subtypes) {
      config.subtypes = {};
      for (const [key, sub] of Object.entries(schema.subtypes)) {
        config.subtypes[key] = {
          priority: sub.priority,
          label: sub.label,
          hints: sub.hints,
        };
      }
    }

    entityTypes[cardType] = config;
  }

  // Collect all attribute labels from the schema
  for (const cardType of cardTypes) {
    const schema = getEntitySchema(cardType);
    for (const attr of schema.commonAttributes) {
      attributeLabels[attr.key] = attr.label;
    }
    if (schema.subtypes) {
      for (const sub of Object.values(schema.subtypes)) {
        for (const attr of sub.attributes) {
          if (!attributeLabels[attr.key]) {
            attributeLabels[attr.key] = attr.label;
          }
        }
      }
    }
  }

  // Legacy aliases for backward compatibility
  attributeLabels['communicationStyle'] = '沟通风格';
  attributeLabels['occurrenceCount'] = '出现次数';
  attributeLabels['context'] = '背景';
  attributeLabels['deadline'] = '截止日期';
  attributeLabels['description'] = '描述';
  attributeLabels['status'] = '状态';
  attributeLabels['goals'] = '目标';
  attributeLabels['priority'] = '优先级';

  return { entityTypes, attributeLabels };
}

const DEFAULT_CONFIG: EntityTypeConfigFile = buildDefaultConfig();

/** In-memory config, loaded at startup */
let runtimeConfig: EntityTypeConfigFile = { ...DEFAULT_CONFIG };

/**
 * Initialize entity type config from DEFAULT_CONFIG.
 * No vault file I/O — all configuration lives in code.
 */
export function loadEntityTypeConfig(): void {
  runtimeConfig = { ...DEFAULT_CONFIG };
  console.log('[TraceMind] Loaded entity type config');
}

/** Get current runtime config */
export function getEntityTypeConfig(): EntityTypeConfigFile {
  return runtimeConfig;
}

/**
 * Get the Chinese label for a subtype of a given entity type.
 * E.g., getSubtypeLabel('object', 'task') → '任务'.
 * Returns empty string if entity type or subtype not found.
 */
export function getSubtypeLabel(entityType: string, subtype?: string): string {
  if (!subtype) return '';
  const config = getEntityTypeConfig().entityTypes;
  const typeCfg = config[entityType];
  return typeCfg?.subtypes?.[subtype]?.label || '';
}

/**
 * Build the entity type description for LLM extraction prompts.
 */
export function buildExtractionTypeGuide(): string {
  const config = getEntityTypeConfig().entityTypes;
  const lines: string[] = ['实体类型规则：'];

  lines.push('- "person": ' + config.person.label + '（如 张三、John Smith）');

  const objSubs = config.object.subtypes || {};
  const subtypeList = Object.keys(objSubs).join('、');
  lines.push('- "object": ' + config.object.label + '，可用 subtype：' + subtypeList);

  // Add per-subtype recognition hints from config
  for (const [key, sub] of Object.entries(objSubs)) {
    if (sub.hints && sub.hints.length > 0) {
      lines.push('  - ' + key + ' 识别：' + sub.hints.join('；'));
    }
  }

  const themeSubs = config.theme.subtypes || {};
  const themeList = Object.keys(themeSubs).join('、');
  lines.push('- "theme": ' + config.theme.label + '，可用 subtype：' + themeList);

  for (const [key, sub] of Object.entries(themeSubs)) {
    if (sub.hints && sub.hints.length > 0) {
      lines.push('  - ' + key + ' 识别：' + sub.hints.join('；'));
    }
  }

  return lines.join('\n');
}

/**
 * Build attribute extraction instructions for clarification parsing prompts.
 * Now subtype-aware: uses getAttributesByPriority(cardType, subtype) from schema.
 */
export function buildClarificationAttributeGuide(entityType: string, subtype?: string): string {
  const schema = getEntitySchema(entityType as any);
  if (!schema) return '';

  const priority = getAttributesByPriority(entityType as any, subtype);
  const allKeys = [...priority.p0, ...priority.p1];

  // Build label lookup from schema
  const labelMap: Record<string, string> = {};
  for (const attr of schema.commonAttributes) {
    labelMap[attr.key] = attr.label;
  }
  if (subtype && schema.subtypes?.[subtype]) {
    for (const attr of schema.subtypes[subtype].attributes) {
      if (!labelMap[attr.key]) labelMap[attr.key] = attr.label;
    }
  }

  const lines: string[] = [];
  lines.push('可用属性：' + allKeys.map(k => {
    const label = labelMap[k] || k;
    return k + '（' + label + '）';
  }).join('、'));

  if (schema.subtypes) {
    const choices = Object.entries(schema.subtypes)
      .map(([key, sub]) => key + ':' + sub.label)
      .join('/');
    lines.push('- subtype 可选值：' + choices);
  }

  return lines.join('\n');
}

/**
 * Build a compact Vault schema guide for chat/system and local agent prompts.
 * Derived from entity-schema.ts.
 */
export function buildVaultSchemaGuide(): string {
  const lines: string[] = [];
  lines.push('Vault 结构：');

  // Person
  const person = getEntitySchema('person');
  const personKeys = person.commonAttributes.filter(a => a.priority !== 'P2').map(a => a.key);
  lines.push(`- Person/{name}.md — 人物档案（属性: ${personKeys.join(', ')}）`);

  // Object
  const obj = getEntitySchema('object');
  const objSubs = obj.subtypes ? Object.keys(obj.subtypes).join('/') : '';
  const objSubExamples: string[] = [];
  if (obj.subtypes) {
    if (obj.subtypes.project) {
      const projKeys = obj.subtypes.project.attributes.filter(a => a.priority !== 'P2').map(a => a.key);
      objSubExamples.push(`project: ${projKeys.join(', ')}`);
    }
    if (obj.subtypes.task) {
      const taskKeys = obj.subtypes.task.attributes.filter(a => a.priority !== 'P2').map(a => a.key);
      objSubExamples.push(`task: ${taskKeys.join(', ')}`);
    }
    if (obj.subtypes.technology) {
      const techKeys = obj.subtypes.technology.attributes.filter(a => a.priority !== 'P2').map(a => a.key);
      objSubExamples.push(`technology: ${techKeys.join(', ')}`);
    }
  }
  lines.push(`- Object/{name}.md — 客体档案（属性: subtype=${objSubs}）`);
  if (objSubExamples.length > 0) {
    lines.push(`  subtype 示例: ${objSubExamples.join('；')}`);
  }

  // Theme
  const theme = getEntitySchema('theme');
  const themeSubs = theme.subtypes ? Object.keys(theme.subtypes).join('/') : '';
  const themeSubExamples: string[] = [];
  if (theme.subtypes) {
    if (theme.subtypes.friction) {
      const fricKeys = theme.subtypes.friction.attributes.filter(a => a.priority !== 'P2').map(a => a.key);
      themeSubExamples.push(`friction: ${fricKeys.join(', ')}`);
    }
    if (theme.subtypes.judgment) {
      const judgKeys = theme.subtypes.judgment.attributes.filter(a => a.priority !== 'P2').map(a => a.key);
      themeSubExamples.push(`judgment: ${judgKeys.join(', ')}`);
    }
  }
  lines.push(`- Theme/{name}.md — 主题档案（属性: subtype=${themeSubs}）`);
  if (themeSubExamples.length > 0) {
    lines.push(`  subtype 示例: ${themeSubExamples.join('；')}`);
  }

  lines.push(`- Daily/YYYY-MM-DD.md — 日记`);

  return lines.join('\n');
}
