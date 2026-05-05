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
  /** Optional LLM recognition hints for extraction prompt */
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

const DEFAULT_CONFIG: EntityTypeConfigFile = {
  entityTypes: {
    person: {
      label: '人物',
      p0: ['company', 'role', 'relationship_to_user'],
      p1: ['responsibility', 'communicationStyle'],
      p2: ['personality', 'preferences', 'skills'],
    },
    object: {
      label: '客体',
      subtypes: {
        project: { priority: 'P0', label: '项目' },
        task: { priority: 'P0', label: '任务', hints: [
          '待办事项、交付物、有明确截止日期的行动项',
          '"XX分析"、"XX报告"、"XX方案"、"XX评估" 都是 task',
          '命名建议：归属项目名+任务描述（如"910C项目投资分析"）',
        ] },
        product: { priority: 'P1', label: '产品' },
        technology: { priority: 'P1', label: '技术' },
        document: { priority: 'P2', label: '文档' },
        location: { priority: 'P2', label: '地点' },
        other: { priority: 'P2', label: '其他' },
      },
      p0: ['subtype', 'status'],
      p1: ['deadline', 'description'],
      p2: ['priority', 'goals'],
    },
    theme: {
      label: '主题',
      subtypes: {
        friction:  { priority: 'P0', label: '摩擦', hints: ['反复遇到的阻力、卡点、返工、低效、冲突', '如：方向反复变化、需求边界不清、会议没有结论'] },
        goal:      { priority: 'P0', label: '目标', hints: ['持续想推进、达成、改善或建立的方向', '如：提升表达能力、减少无效会议、建立个人记忆系统'] },
        judgment:  { priority: 'P0', label: '判断', hints: ['对人或事形成的看法、评价、立场', '如：当前项目价值不清晰、Markdown-first 更适合 MVP'] },
        idea:      { priority: 'P0', label: '想法', hints: ['灵感、兴趣、探索欲、反复思考的问题', '如：AI记忆系统设计、如何让碎片记录获得洞察'] },
      },
      p0: ['subtype'],
      p1: ['occurrenceCount', 'context'],
      p2: ['context'],
    },
  },
  attributeLabels: {
    company: '公司/组织',
    role: '职位/角色',
    relationship_to_user: '与你的关系',
    responsibility: '职责',
    communicationStyle: '沟通风格',
    personality: '性格',
    preferences: '偏好',
    skills: '技能',
    subtype: '类型',
    status: '状态',
    deadline: '截止日期',
    description: '描述',
    priority: '优先级',
    goals: '目标',
    occurrenceCount: '出现次数',
    context: '背景',
  },
};

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
 */
export function buildClarificationAttributeGuide(entityType: string): string {
  const config = getEntityTypeConfig().entityTypes;
  const labels = getEntityTypeConfig().attributeLabels;
  const typeConfig = config[entityType];
  if (!typeConfig) return '';

  const allAttrs: { key: string; label: string }[] = [];
  for (const attr of typeConfig.p0) allAttrs.push({ key: attr, label: labels[attr] || attr });
  for (const attr of typeConfig.p1) allAttrs.push({ key: attr, label: labels[attr] || attr });

  const lines: string[] = [];
  lines.push('可用属性：' + allAttrs.map(a => a.key + '（' + a.label + '）').join('、'));

  if (typeConfig.subtypes) {
    const choices = Object.entries(typeConfig.subtypes)
      .map(([key, sub]) => key + ':' + sub.label)
      .join('/');
    lines.push('- subtype 可选值：' + choices);
  }

  return lines.join('\n');
}
