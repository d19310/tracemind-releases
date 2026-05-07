import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { profileToContext } from '../../src/core/profile-loader';

describe('Profile Loader - Context Generation', () => {
  it('builds context string from profile', () => {
    const ctx = profileToContext({
      name: '张三',
      occupation: '工程师',
      company: '某科技公司',
      city: '北京',
      skills: ['TypeScript', 'Python'],
      roles: [],
      relationships: [],
      goals: [],
      focusAreas: ['AI技术'],
      lastUpdated: '2026-05-02',
    });

    assert.ok(ctx.includes('## 用户背景'));
    assert.ok(ctx.includes('用户姓名：张三'));
    assert.ok(ctx.includes('职业：工程师'));
    assert.ok(ctx.includes('技能：TypeScript、Python'));
    assert.ok(ctx.includes('关注领域：AI技术'));
  });

  it('returns empty string for empty profile', () => {
    const ctx = profileToContext({
      name: '',
      occupation: '',
      company: '',
      city: '',
      skills: [],
      roles: [],
      relationships: [],
      goals: [],
      focusAreas: [],
      lastUpdated: '2026-05-02',
    });
    assert.equal(ctx, '');
  });
});
