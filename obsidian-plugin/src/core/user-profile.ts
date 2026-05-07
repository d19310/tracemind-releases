/**
 * User Profile - User's personal background for AI context injection
 * Stored as PROFILE.md in the TraceMind directory.
 * Profile data lives in YAML frontmatter for reliable machine parsing.
 */

import yaml from 'js-yaml';

export interface UserProfile {
  name: string;
  occupation: string;
  company: string;
  city: string;
  skills: string[];
  roles: string[];
  relationships: string[];
  goals: string[];
  focusAreas: string[];
  lastUpdated: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  occupation: '',
  company: '',
  city: '',
  skills: [],
  roles: [],
  relationships: [],
  goals: [],
  focusAreas: [],
  lastUpdated: new Date().toISOString().split('T')[0],
};

/** Frontmatter keys that map to UserProfile fields */
const PROFILE_FRONTMATTER_KEYS = [
  'name', 'occupation', 'company', 'city',
  'skills', 'roles', 'relationships', 'goals', 'focusAreas',
];

/**
 * Serialize user profile to markdown with YAML frontmatter.
 */
export function profileToMarkdown(profile: UserProfile): string {
  const frontmatter: Record<string, unknown> = {};
  for (const key of PROFILE_FRONTMATTER_KEYS) {
    const value = (profile as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      frontmatter[key] = value.length > 0 ? value : [];
    } else if (value) {
      frontmatter[key] = value;
    }
  }

  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1 }).trim();

  const bodySections: string[] = [
    '# 用户档案',
    '',
    '## 基本信息',
    `- 姓名：${profile.name || '未填写'}`,
    `- 公司/组织：${profile.company || '未填写'}`,
    `- 职位/职业：${profile.occupation || '未填写'}`,
    `- 城市：${profile.city || '未填写'}`,
    '',
    '## 技能与专业',
    ...formatList(profile.skills),
    '',
    '## 角色与关系',
    ...formatList(profile.roles),
    ...formatList(profile.relationships.map(r => `关系：${r}`)),
    '',
    '## 目标与计划',
    ...formatList(profile.goals),
    '',
    '## 关注领域',
    ...formatList(profile.focusAreas),
    '',
  ];

  return `---\n${yamlStr}\n---\n\n${bodySections.join('\n')}`;
}

/**
 * Parse user profile from markdown YAML frontmatter.
 */
export function parseProfileMarkdown(markdown: string): UserProfile {
  const profile: UserProfile = { ...DEFAULT_PROFILE };

  // Extract YAML frontmatter
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    try {
      const parsed = yaml.load(match[1]) as Record<string, unknown>;
      if (parsed) {
        if (typeof parsed.name === 'string') profile.name = parsed.name;
        if (typeof parsed.occupation === 'string') profile.occupation = parsed.occupation;
        if (typeof parsed.company === 'string') profile.company = parsed.company;
        if (typeof parsed.city === 'string') profile.city = parsed.city;
        if (Array.isArray(parsed.skills)) profile.skills = parsed.skills.map(String);
        if (Array.isArray(parsed.roles)) profile.roles = parsed.roles.map(String);
        if (Array.isArray(parsed.relationships)) profile.relationships = parsed.relationships.map(String);
        if (Array.isArray(parsed.goals)) profile.goals = parsed.goals.map(String);
        if (Array.isArray(parsed.focusAreas)) profile.focusAreas = parsed.focusAreas.map(String);
      }
    } catch {
      // Fall through to legacy markdown parsing
    }
  }

  // If YAML parsing gave us nothing, try legacy markdown body parsing
  if (!profile.name && !profile.company) {
    return parseLegacyProfileMarkdown(markdown);
  }

  return profile;
}

/**
 * Legacy fallback: parse old-style markdown list format.
 */
function parseLegacyProfileMarkdown(markdown: string): UserProfile {
  const profile = { ...DEFAULT_PROFILE };
  const lines = markdown.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      currentSection = trimmed.slice(3);
      continue;
    }

    if (currentSection === '基本信息' && trimmed.startsWith('- ')) {
      const content = trimmed.slice(2);
      const [key, ...valueParts] = content.split('：');
      const value = valueParts.join('：');
      if (key === '姓名') profile.name = value;
      if (key === '职业' || key === '职位') profile.occupation = value;
      if (key === '公司/组织' || key === '公司') profile.company = value;
      if (key === '城市') profile.city = value;
    }

    if (trimmed.startsWith('- ') && !trimmed.includes('：')) {
      const item = trimmed.slice(2);
      if (item === '_暂无_') continue;
      if (currentSection === '技能与专业') profile.skills.push(item);
      if (currentSection === '角色与关系') profile.roles.push(item);
      if (currentSection === '目标与计划') profile.goals.push(item);
      if (currentSection === '关注领域') profile.focusAreas.push(item);
    }

    if (trimmed.startsWith('- 关系：') && currentSection === '角色与关系') {
      const rel = trimmed.slice(5);
      if (rel !== '_暂无_') profile.relationships.push(rel);
    }
  }

  return profile;
}

function formatList(items: string[]): string[] {
  if (items.length === 0) return ['- _暂无_'];
  return items.map(item => `- ${item}`);
}
