/**
 * Entity Schema — single source of truth for entity type metadata.
 *
 * Defines card types, subtype lists, attribute priorities, labels, and hints.
 * Used by context-card.ts (subtype validation, maturity) and
 * entity-type-config.ts (LLM prompt guide generation).
 *
 * Phase 1: schema source of truth only.
 * Phase 2A: reserved key guard, field rename for frontmatter safety, subtype-aware maturity.
 */

import type { CardType } from './context-card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttributePriority = 'P0' | 'P1' | 'P2';

export interface AttributeSchema {
  key: string;
  label: string;
  priority: AttributePriority;
  description?: string;
  /** Legacy key aliases for backward-compatible attribute reading in maturity */
  aliases?: string[];
}

export interface SubtypeSchema {
  key: string;
  label: string;
  priority: AttributePriority;
  hints?: string[];
  attributes: AttributeSchema[];
}

export interface EntityTypeSchema {
  type: CardType;
  label: string;
  commonAttributes: AttributeSchema[];
  subtypes?: Record<string, SubtypeSchema>;
  defaultSubtype?: string;
}

// ---------------------------------------------------------------------------
// Reserved keys — must not be used as attribute keys
// ---------------------------------------------------------------------------

export const RESERVED_ATTRIBUTE_KEYS = new Set([
  'id', 'name', 'type', 'maturity', 'confidence', 'status',
  'aliases', 'createdAt', 'lastUpdated', 'lifecycle', 'importance',
  'userId', 'relatedPeople', 'relatedObjects', 'relatedThemes',
  'evidenceEntryIds',
]);

/**
 * Validate that no attribute key in the entire schema collides with
 * reserved ContextCard / frontmatter keys.
 * Returns array of error messages; empty means valid.
 */
export function validateEntitySchema(): string[] {
  const errors: string[] = [];
  const cardTypes: CardType[] = ['person', 'object', 'theme'];

  for (const cardType of cardTypes) {
    const schema = SCHEMA_REGISTRY[cardType];

    for (const attr of schema.commonAttributes) {
      if (RESERVED_ATTRIBUTE_KEYS.has(attr.key)) {
        errors.push(`${cardType}.${attr.key} uses reserved key ${attr.key}`);
      }
    }

    if (schema.subtypes) {
      for (const [subKey, sub] of Object.entries(schema.subtypes)) {
        for (const attr of sub.attributes) {
          if (RESERVED_ATTRIBUTE_KEYS.has(attr.key)) {
            errors.push(`${cardType}.${subKey}.${attr.key} uses reserved key ${attr.key}`);
          }
        }
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Person schema (no subtypes)
// ---------------------------------------------------------------------------

const PERSON_SCHEMA: EntityTypeSchema = {
  type: 'person',
  label: '人物',
  commonAttributes: [
    { key: 'company', label: '公司/组织', priority: 'P0' },
    { key: 'role', label: '职位/角色', priority: 'P0' },
    { key: 'relationship_to_user', label: '与你的关系', priority: 'P0' },
    { key: 'responsibility', label: '职责', priority: 'P1' },
    { key: 'workingStyle', label: '协作风格', priority: 'P1', aliases: ['communicationStyle'], description: '比 communicationStyle 更贴近日记洞察' },
    { key: 'personality', label: '性格', priority: 'P2' },
    { key: 'preferences', label: '偏好', priority: 'P2' },
    { key: 'skills', label: '技能', priority: 'P2' },
  ],
};

// ---------------------------------------------------------------------------
// Object schema
// ---------------------------------------------------------------------------

const OBJECT_SUBTYPES: Record<string, SubtypeSchema> = {
  company: {
    key: 'company',
    label: '公司/组织',
    priority: 'P0',
    hints: [
      '公司、客户、供应商、合作伙伴、机构等有专有名称的组织',
      '如：穹彻智能、字节跳动、某供应商',
    ],
    attributes: [
      { key: 'relationship', label: '与我的关系', priority: 'P0' },
      { key: 'roleInContext', label: '相关角色', priority: 'P0' },
      { key: 'industry', label: '行业', priority: 'P1' },
      { key: 'contactPeople', label: '联系人', priority: 'P1' },
      { key: 'currentStatus', label: '当前状态', priority: 'P1' },
      { key: 'notes', label: '备注', priority: 'P2' },
    ],
  },
  project: {
    key: 'project',
    label: '项目',
    priority: 'P0',
    attributes: [
      { key: 'stage', label: '阶段', priority: 'P0' },
      { key: 'owner', label: '负责人', priority: 'P0' },
      { key: 'deadline', label: '截止日期', priority: 'P1' },
      { key: 'stakeholders', label: '利益相关者', priority: 'P1' },
      { key: 'blockers', label: '阻碍', priority: 'P1' },
      { key: 'successCriteria', label: '成功标准', priority: 'P1' },
      { key: 'priority', label: '优先级', priority: 'P2' },
      { key: 'budget', label: '预算', priority: 'P2' },
    ],
  },
  task: {
    key: 'task',
    label: '任务',
    priority: 'P0',
    hints: [
      '待办事项、交付物、有明确截止日期的行动项',
      '"XX分析"、"XX报告"、"XX方案"、"XX评估" 都是 task',
      '命名建议：归属项目名+任务描述（如"910C项目投资分析"）',
    ],
    attributes: [
      { key: 'taskStatus', label: '状态', priority: 'P0', aliases: ['status'] },
      { key: 'nextAction', label: '下一步', priority: 'P0' },
      { key: 'dueDate', label: '截止日期', priority: 'P1', aliases: ['deadline'] },
      { key: 'assignee', label: '经办人', priority: 'P1' },
      { key: 'parentProject', label: '所属项目', priority: 'P1' },
      { key: 'priority', label: '优先级', priority: 'P2' },
      { key: 'effort', label: '工作量', priority: 'P2' },
    ],
  },
  product: {
    key: 'product',
    label: '产品',
    priority: 'P1',
    attributes: [
      { key: 'purpose', label: '用途', priority: 'P0' },
      { key: 'productStatus', label: '状态', priority: 'P0', aliases: ['status'] },
      { key: 'users', label: '用户', priority: 'P1' },
      { key: 'keyFeatures', label: '关键功能', priority: 'P1' },
      { key: 'relatedProjects', label: '相关项目', priority: 'P1' },
      { key: 'metrics', label: '指标', priority: 'P2' },
    ],
  },
  technology: {
    key: 'technology',
    label: '技术',
    priority: 'P1',
    attributes: [
      { key: 'useCase', label: '用途', priority: 'P0' },
      { key: 'adoptionStatus', label: '采用状态', priority: 'P0' },
      { key: 'techMaturity', label: '成熟度', priority: 'P1', aliases: ['maturity'] },
      { key: 'risks', label: '风险', priority: 'P1' },
      { key: 'relatedProjects', label: '相关项目', priority: 'P1' },
      { key: 'alternatives', label: '替代方案', priority: 'P2' },
    ],
  },
  document: {
    key: 'document',
    label: '文档',
    priority: 'P2',
    attributes: [
      { key: 'purpose', label: '用途', priority: 'P0' },
      { key: 'documentStatus', label: '状态', priority: 'P0', aliases: ['status'] },
      { key: 'source', label: '来源', priority: 'P1' },
      { key: 'linkedProject', label: '关联项目', priority: 'P1' },
      { key: 'latestVersion', label: '最新版本', priority: 'P1' },
      { key: 'owner', label: '负责人', priority: 'P2' },
    ],
  },
  location: {
    key: 'location',
    label: '地点',
    priority: 'P2',
    attributes: [
      { key: 'where', label: '地点', priority: 'P0' },
      { key: 'whyRelevant', label: '为何关注', priority: 'P0' },
      { key: 'associatedPeople', label: '关联人物', priority: 'P1' },
      { key: 'associatedEvents', label: '关联事件', priority: 'P1' },
      { key: 'notes', label: '备注', priority: 'P2' },
    ],
  },
  other: {
    key: 'other',
    label: '其他',
    priority: 'P2',
    attributes: [
      { key: 'description', label: '描述', priority: 'P0' },
      { key: 'objectStatus', label: '状态', priority: 'P1', aliases: ['status'] },
      { key: 'notes', label: '备注', priority: 'P2' },
    ],
  },
};

const OBJECT_SCHEMA: EntityTypeSchema = {
  type: 'object',
  label: '客体',
  commonAttributes: [
    { key: 'subtype', label: '类型', priority: 'P0' },
    { key: 'summary', label: '摘要', priority: 'P1' },
    { key: 'tags', label: '标签', priority: 'P2' },
  ],
  subtypes: OBJECT_SUBTYPES,
  defaultSubtype: 'other',
};

// ---------------------------------------------------------------------------
// Theme schema
// ---------------------------------------------------------------------------

const THEME_SUBTYPES: Record<string, SubtypeSchema> = {
  friction: {
    key: 'friction',
    label: '摩擦',
    priority: 'P0',
    hints: [
      '反复遇到的阻力、卡点、返工、低效、冲突',
      '如：方向反复变化、需求边界不清、会议没有结论',
    ],
    attributes: [
      { key: 'trigger', label: '触发条件', priority: 'P0' },
      { key: 'impact', label: '影响', priority: 'P0' },
      { key: 'frequency', label: '频率', priority: 'P1' },
      { key: 'possibleCause', label: '可能原因', priority: 'P1' },
      { key: 'relatedEntities', label: '相关实体', priority: 'P1' },
      { key: 'candidateResolution', label: '候选解决方案', priority: 'P2' },
    ],
  },
  goal: {
    key: 'goal',
    label: '目标',
    priority: 'P0',
    hints: [
      '持续想推进、达成、改善或建立的方向',
      '如：提升表达能力、减少无效会议、建立个人记忆系统',
    ],
    attributes: [
      { key: 'desiredOutcome', label: '期望结果', priority: 'P0' },
      { key: 'currentState', label: '当前状态', priority: 'P0' },
      { key: 'nextStep', label: '下一步', priority: 'P1' },
      { key: 'blockers', label: '阻碍', priority: 'P1' },
      { key: 'deadline', label: '截止日期', priority: 'P1' },
      { key: 'successMetric', label: '成功指标', priority: 'P2' },
    ],
  },
  judgment: {
    key: 'judgment',
    label: '判断',
    priority: 'P0',
    hints: [
      '对人或事形成的看法、评价、立场',
      '如：当前项目价值不清晰、Markdown-first 更适合 MVP',
    ],
    attributes: [
      { key: 'claim', label: '主张', priority: 'P0' },
      { key: 'judgmentConfidence', label: '确信度', priority: 'P0', aliases: ['confidence'] },
      { key: 'evidence', label: '证据', priority: 'P1' },
      { key: 'counterEvidence', label: '反证', priority: 'P1' },
      { key: 'updatedAt', label: '更新时间', priority: 'P2' },
    ],
  },
  idea: {
    key: 'idea',
    label: '想法',
    priority: 'P0',
    hints: [
      '灵感、兴趣、探索欲、反复思考的问题',
      '如：AI记忆系统设计、如何让碎片记录获得洞察',
    ],
    attributes: [
      { key: 'coreIdea', label: '核心想法', priority: 'P0' },
      { key: 'useCase', label: '应用场景', priority: 'P0' },
      { key: 'nextExperiment', label: '下一步实验', priority: 'P1' },
      { key: 'linkedObjects', label: '相关对象', priority: 'P1' },
      { key: 'openQuestions', label: '开放问题', priority: 'P2' },
    ],
  },
};

const THEME_SCHEMA: EntityTypeSchema = {
  type: 'theme',
  label: '主题',
  commonAttributes: [
    { key: 'subtype', label: '类型', priority: 'P0' },
    { key: 'summary', label: '摘要', priority: 'P1', aliases: ['context'] },
    { key: 'relatedEntities', label: '相关实体', priority: 'P1' },
    { key: 'trend', label: '趋势', priority: 'P2' },
  ],
  subtypes: THEME_SUBTYPES,
  defaultSubtype: 'friction',
};

// ---------------------------------------------------------------------------
// Master registry
// ---------------------------------------------------------------------------

const SCHEMA_REGISTRY: Record<CardType, EntityTypeSchema> = {
  person: PERSON_SCHEMA,
  object: OBJECT_SCHEMA,
  theme: THEME_SCHEMA,
};

// ---------------------------------------------------------------------------
// Legacy alias maps (generated from schema)
// ---------------------------------------------------------------------------

/**
 * Build a map: canonical key → all its aliases (if any), only for keys that have aliases.
 * Also builds reverse map: alias → canonical key.
 */
function buildAliasMaps(): { canonicalToAliases: Map<string, string[]>; aliasToCanonical: Map<string, string> } {
  const canonicalToAliases = new Map<string, string[]>();
  const aliasToCanonical = new Map<string, string>();

  const cardTypes: CardType[] = ['person', 'object', 'theme'];
  for (const cardType of cardTypes) {
    const schema = SCHEMA_REGISTRY[cardType];
    const allAttrs = [...schema.commonAttributes];
    if (schema.subtypes) {
      for (const sub of Object.values(schema.subtypes)) {
        allAttrs.push(...sub.attributes);
      }
    }
    for (const attr of allAttrs) {
      if (attr.aliases && attr.aliases.length > 0) {
        canonicalToAliases.set(attr.key, attr.aliases);
        for (const alias of attr.aliases) {
          aliasToCanonical.set(alias, attr.key);
        }
      }
    }
  }
  return { canonicalToAliases, aliasToCanonical };
}

const { canonicalToAliases, aliasToCanonical } = buildAliasMaps();

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function getEntitySchema(cardType: CardType): EntityTypeSchema {
  return SCHEMA_REGISTRY[cardType];
}

export function getSubtypeSchema(cardType: CardType, subtype?: string): SubtypeSchema | undefined {
  const schema = SCHEMA_REGISTRY[cardType];
  if (!schema.subtypes || !subtype) return undefined;
  return schema.subtypes[subtype];
}

export function getEffectiveAttributes(cardType: CardType, subtype?: string): AttributeSchema[] {
  const schema = SCHEMA_REGISTRY[cardType];
  if (subtype && schema.subtypes?.[subtype]) {
    return [...schema.commonAttributes, ...schema.subtypes[subtype].attributes];
  }
  return [...schema.commonAttributes];
}

/**
 * Group attribute keys by priority, now subtype-aware.
 * If subtype is invalid or missing, falls back to default subtype or common-only.
 * Includes legacy alias support: an attribute is considered filled if
 * its canonical key OR any of its aliases has a value.
 */
export function getAttributesByPriority(cardType: CardType, subtype?: string): {
  p0: string[];
  p1: string[];
  p2: string[];
} {
  const schema = SCHEMA_REGISTRY[cardType];

  // Resolve subtype: use default if missing or invalid
  let effectiveSubtype = subtype;
  if (schema.subtypes) {
    if (!effectiveSubtype || !schema.subtypes[effectiveSubtype]) {
      effectiveSubtype = schema.defaultSubtype;
    }
  }

  // Collect all attributes for this card type + subtype
  const attrKeys = new Set<string>();
  const p0: string[] = [];
  const p1: string[] = [];
  const p2: string[] = [];

  for (const attr of schema.commonAttributes) {
    attrKeys.add(attr.key);
    if (attr.priority === 'P0') p0.push(attr.key);
    else if (attr.priority === 'P1') p1.push(attr.key);
    else p2.push(attr.key);
  }

  if (effectiveSubtype && schema.subtypes?.[effectiveSubtype]) {
    for (const attr of schema.subtypes[effectiveSubtype].attributes) {
      if (attrKeys.has(attr.key)) continue; // dedup
      attrKeys.add(attr.key);
      if (attr.priority === 'P0') p0.push(attr.key);
      else if (attr.priority === 'P1') p1.push(attr.key);
      else p2.push(attr.key);
    }
  }

  return { p0, p1, p2 };
}

/**
 * Check if an attribute is "filled" — either by its canonical key or any alias.
 */
export function hasAttribute(attributes: Record<string, unknown>, key: string): boolean {
  if (attributes[key] != null) return true;
  const aliases = canonicalToAliases.get(key);
  if (aliases) {
    for (const alias of aliases) {
      if (attributes[alias] != null) return true;
    }
  }
  return false;
}

export function getSubtypeLabel(cardType: CardType, subtype?: string): string {
  if (!subtype) return '';
  const sub = getSubtypeSchema(cardType, subtype);
  return sub?.label || '';
}

export function validateSubtype(cardType: CardType, subtype?: string): boolean {
  if (!subtype) return false;
  const schema = SCHEMA_REGISTRY[cardType];
  return schema.subtypes ? subtype in schema.subtypes : false;
}

export function getDefaultSubtype(cardType: CardType): string | undefined {
  return SCHEMA_REGISTRY[cardType].defaultSubtype;
}

export function validateObjectSubtype(subtype: string): boolean {
  return validateSubtype('object', subtype);
}

export function validateThemeSubtype(subtype: string): boolean {
  return validateSubtype('theme', subtype);
}

/**
 * Get the canonical key for a given attribute key.
 * If `key` is an alias, returns the canonical version; otherwise returns key unchanged.
 */
export function canonicalAttributeKey(key: string): string {
  return aliasToCanonical.get(key) || key;
}

/**
 * Check whether `key` is a subtype-aware alias for the given cardType + subtype.
 * E.g. `isSubtypeAlias('object', 'technology', 'maturity')` → true (alias of techMaturity).
 */
export function isSubtypeAlias(cardType: CardType, subtype: string | undefined, key: string): boolean {
  const canonical = aliasToCanonical.get(key);
  if (!canonical) return false;

  const schema = SCHEMA_REGISTRY[cardType];
  let effectiveSubtype = subtype;
  if (schema.subtypes) {
    if (!effectiveSubtype || !schema.subtypes[effectiveSubtype]) {
      effectiveSubtype = schema.defaultSubtype;
    }
  }

  // Check commonAttributes
  for (const attr of schema.commonAttributes) {
    if (attr.key === canonical) return true;
  }
  // Check subtype-specific attributes
  if (effectiveSubtype && schema.subtypes?.[effectiveSubtype]) {
    for (const attr of schema.subtypes[effectiveSubtype].attributes) {
      if (attr.key === canonical) return true;
    }
  }
  return false;
}

/**
 * Copy reserved frontmatter values into attributes when they serve as
 * subtype-aware aliases. e.g. frontmatter `maturity: 成熟` on a technology
 * card → attributes.maturity = '成熟' → normalize → attributes.techMaturity.
 */
export function copyReservedAliases(
  cardType: CardType,
  subtype: string | undefined,
  frontmatter: Record<string, unknown>,
  attributes: Record<string, unknown>,
): void {
  for (const key of ['maturity', 'confidence']) {
    const value = frontmatter[key];
    if (value == null) continue;
    if (key in attributes) continue; // already present from non-reserved pass
    if (isSubtypeAlias(cardType, subtype, key)) {
      attributes[key] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// Legacy alias normalization
// ---------------------------------------------------------------------------

export interface NormalizeEntityAttributesOptions {
  /** If false, strip old alias fields (defaults to true for backward compat). */
  preserveAliases?: boolean;
}

/**
 * Normalize entity attributes: copy alias values to canonical keys.
 *
 * - Returns a new object, never mutates the input.
 * - Canonical key has priority — aliases never overwrite existing values.
 * - Empty values (null/undefined/'') are not copied.
 * - Only normalizes aliases defined in the schema for the given cardType + subtype.
 * - When subtype is missing or invalid, uses the default subtype fallback.
 */
export function normalizeEntityAttributes(
  cardType: CardType,
  subtype: string | undefined,
  attributes: Record<string, unknown>,
  options?: NormalizeEntityAttributesOptions,
): Record<string, unknown> {
  const preserveAliases = options?.preserveAliases !== false;
  const result: Record<string, unknown> = { ...attributes };

  // Resolve effective schema
  const schema = SCHEMA_REGISTRY[cardType];
  let effectiveSubtype = subtype;
  if (schema.subtypes) {
    if (!effectiveSubtype || !schema.subtypes[effectiveSubtype]) {
      effectiveSubtype = schema.defaultSubtype;
    }
  }

  // Collect all attribute schemas for this cardType + subtype
  const allSchemas = new Map<string, AttributeSchema>();
  for (const attr of schema.commonAttributes) {
    allSchemas.set(attr.key, attr);
  }
  if (effectiveSubtype && schema.subtypes?.[effectiveSubtype]) {
    for (const attr of schema.subtypes[effectiveSubtype].attributes) {
      if (!allSchemas.has(attr.key)) {
        allSchemas.set(attr.key, attr);
      }
    }
  }

  // For each attribute that has aliases, copy alias value to canonical key
  for (const [, attrSchema] of allSchemas) {
    if (!attrSchema.aliases || attrSchema.aliases.length === 0) continue;

    const canonicalValue = result[attrSchema.key];
    const hasCanonical = canonicalValue != null && canonicalValue !== '';

    for (const alias of attrSchema.aliases) {
      const aliasValue = result[alias];
      const hasAliasValue = aliasValue != null && aliasValue !== '';

      if (!hasCanonical && hasAliasValue) {
        // Copy alias → canonical (canonical is missing)
        result[attrSchema.key] = aliasValue;
      }

      // Strip alias field if preserveAliases is false
      if (!preserveAliases) {
        delete result[alias];
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Derived constants
// ---------------------------------------------------------------------------

export const VALID_OBJECT_SUBTYPES = Object.keys(OBJECT_SUBTYPES);
export const VALID_THEME_SUBTYPES = Object.keys(THEME_SUBTYPES);

export const OBJECT_SUBTYPE_PRIORITY: Record<string, AttributePriority> = {};
for (const [key, sub] of Object.entries(OBJECT_SUBTYPES)) {
  OBJECT_SUBTYPE_PRIORITY[key] = sub.priority;
}

/**
 * Phase 1 backward-compatible ATTRIBUTE_PRIORITY (common-only, no subtype).
 * Kept for backward-compatible export. calculatePriorityScore() and
 * detectKnowledgeGaps() now use getAttributesByPriority() directly.
 * This constant is separate from getAttributesByPriority()
 * which IS subtype-aware and used by calculateMaturity().
 */
export const ATTRIBUTE_PRIORITY: Record<CardType, { p0: string[]; p1: string[]; p2: string[] }> = {
  person: {
    p0: ['company', 'role', 'relationship_to_user'],
    p1: ['responsibility', 'communicationStyle'],
    p2: ['personality', 'preferences', 'skills'],
  },
  object: {
    p0: ['subtype', 'status'],
    p1: ['deadline', 'description'],
    p2: ['priority', 'goals'],
  },
  theme: {
    p0: ['subtype'],
    p1: ['occurrenceCount', 'context'],
    p2: ['context'],
  },
};
