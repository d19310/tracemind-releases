import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserProfile,
  profileToMarkdown,
  parseProfileMarkdown,
} from '../../src/core/user-profile';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: '',
    occupation: '',
    company: '',
    city: '',
    skills: [],
    roles: [],
    relationships: [],
    goals: [],
    focusAreas: [],
    lastUpdated: '',
    ...overrides,
  };
}

describe('User Profile - Markdown Serialization', () => {
  it('serializes profile to markdown', () => {
    const profile = makeProfile({
      name: '张三',
      occupation: '工程师',
      company: '某科技公司',
      city: '北京',
      skills: ['TypeScript', 'Python', '架构设计'],
      roles: ['技术负责人', '导师'],
      relationships: ['与李四是合作伙伴'],
      goals: ['Q2完成产品上线', '建立技术影响力'],
      focusAreas: ['AI技术', '知识管理', '团队建设'],
      lastUpdated: '2026-05-02',
    });

    const md = profileToMarkdown(profile);

    assert.ok(md.includes('# 用户档案'));
    assert.ok(md.includes('张三'));
    assert.ok(md.includes('北京'));
    assert.ok(md.includes('TypeScript'));
    assert.ok(md.includes('Q2完成产品上线'));
  });

  it('parses profile from markdown', () => {
    const markdown = `# 用户档案

## 基本信息
- 姓名：张三
- 职业：工程师
- 公司/组织：某科技公司
- 城市：北京

## 技能与专业
- TypeScript
- Python
- 架构设计

## 角色与关系
- 技术负责人
- 导师
- 关系：与李四是合作伙伴

## 目标与计划
- Q2完成产品上线
- 建立技术影响力

## 关注领域
- AI技术
- 知识管理
- 团队建设
`;

    const profile = parseProfileMarkdown(markdown);

    assert.equal(profile.name, '张三');
    assert.equal(profile.occupation, '工程师');
    assert.equal(profile.company, '某科技公司');
    assert.equal(profile.city, '北京');
    assert.deepEqual(profile.skills, ['TypeScript', 'Python', '架构设计']);
    assert.deepEqual(profile.roles, ['技术负责人', '导师']);
    assert.deepEqual(profile.relationships, ['与李四是合作伙伴']);
    assert.deepEqual(profile.goals, ['Q2完成产品上线', '建立技术影响力']);
    assert.deepEqual(profile.focusAreas, ['AI技术', '知识管理', '团队建设']);
  });

  it('roundtrips through serialize -> parse', () => {
    const original = makeProfile({
      name: '李四',
      occupation: '产品经理',
      skills: ['产品规划', '用户研究'],
      goals: ['提升用户体验'],
    });

    const md = profileToMarkdown(original);
    const parsed = parseProfileMarkdown(md);

    assert.equal(parsed.name, original.name);
    assert.equal(parsed.occupation, original.occupation);
    assert.deepEqual(parsed.skills, original.skills);
    assert.deepEqual(parsed.goals, original.goals);
  });

  it('handles empty sections', () => {
    const profile = makeProfile({
      name: '王五',
    });

    const md = profileToMarkdown(profile);
    const parsed = parseProfileMarkdown(md);

    assert.equal(parsed.name, '王五');
    assert.deepEqual(parsed.skills, []);
  });
});
