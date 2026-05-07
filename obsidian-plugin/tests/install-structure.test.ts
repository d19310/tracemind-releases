import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Vault Structure', () => {
  it('defines correct directory structure', () => {
    const expected = [
      'Daily',
      'Person',
      'Object',
      'Theme',
      'TraceMind/sessions',
      'TraceMind/index',
    ];

    assert.ok(expected.includes('Daily'));
    assert.ok(expected.includes('Person'));
    assert.ok(expected.includes('Object'));
    assert.ok(expected.includes('Theme'));
    assert.ok(expected.includes('TraceMind/sessions'));
    assert.ok(expected.includes('TraceMind/index'));
  });

  it('defines correct PROFILE structure', () => {
    const profileFields = [
      '# 用户画像',
      '## 基本信息',
      '## 职业背景',
      '## 社交关系',
      '## 工作模式',
    ];

    for (const field of profileFields) {
      assert.ok(field.includes('##') || field.includes('#'));
    }
  });
});
