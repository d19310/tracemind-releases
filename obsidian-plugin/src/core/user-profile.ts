/**
 * User Profile - User's personal background for AI context injection
 * Stored as PROFILE.md in the TraceMind directory.
 */

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

/**
 * Serialize user profile to markdown format
 */
export function profileToMarkdown(profile: UserProfile): string {
  const sections: string[] = [
    '# 用户档案',
    '',
    '## 基本信息',
    `- 姓名：${profile.name || '未填写'}`,
    `- 职业：${profile.occupation || '未填写'}`,
    `- 公司/组织：${profile.company || '未填写'}`,
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

  return sections.join('\n');
}

/**
 * Parse user profile from markdown format
 */
export function parseProfileMarkdown(markdown: string): UserProfile {
  const profile: UserProfile = {
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
      if (key === '职业') profile.occupation = value;
      if (key === '公司/组织') profile.company = value;
      if (key === '城市') profile.city = value;
    }

    if (trimmed.startsWith('- ') && !trimmed.includes('：')) {
      const item = trimmed.slice(2);
      if (item === '_暂无_') continue; // Skip placeholder
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
