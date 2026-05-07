/**
 * Profile Loader - Loads/saves user profile from vault PROFILE.md
 * Stored at TraceMind/PROFILE.md
 */

import { App } from 'obsidian';
import { UserProfile, DEFAULT_PROFILE, profileToMarkdown, parseProfileMarkdown } from '../core/user-profile';

const PROFILE_PATH = 'TraceMind/PROFILE.md';

/**
 * Load user profile from vault, or return defaults if not found
 */
export async function loadProfile(app: App): Promise<UserProfile> {
  const file = app.vault.getFileByPath(PROFILE_PATH);
  if (!file) {
    return { ...DEFAULT_PROFILE };
  }
  try {
    const content = await app.vault.read(file);
    return parseProfileMarkdown(content);
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Save user profile to vault as PROFILE.md
 */
export async function saveProfile(app: App, profile: UserProfile): Promise<void> {
  const md = profileToMarkdown(profile);
  const file = app.vault.getFileByPath(PROFILE_PATH);
  if (file) {
    await app.vault.modify(file, md);
  } else {
    await app.vault.create(PROFILE_PATH, md);
  }
}

/**
 * Build profile context string for AI prompt injection
 */
export function profileToContext(profile: UserProfile): string {
  const parts: string[] = [];
  if (profile.name) parts.push(`用户姓名：${profile.name}`);
  if (profile.occupation) parts.push(`职业：${profile.occupation}`);
  if (profile.company) parts.push(`公司/组织：${profile.company}`);
  if (profile.city) parts.push(`所在城市：${profile.city}`);
  if (profile.skills.length > 0) parts.push(`技能：${profile.skills.join('、')}`);
  if (profile.focusAreas.length > 0) parts.push(`关注领域：${profile.focusAreas.join('、')}`);
  if (parts.length === 0) return '';
  return `## 用户背景\n${parts.join('\n')}\n`;
}
