import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldSilentUpdate,
  shouldAutoAnalyze,
} from '../../src/ai/analysis-orchestrator';
import { CardType } from '../../src/core/context-card';

describe('Analysis Orchestrator - Silent Update Rules', () => {
  it('returns false for L0 candidates', () => {
    assert.equal(shouldSilentUpdate('L0'), false);
  });

  it('returns false for L1 candidates', () => {
    assert.equal(shouldSilentUpdate('L1'), false);
  });

  it('returns true for L2 observing entities', () => {
    assert.equal(shouldSilentUpdate('L2'), true);
  });

  it('returns true for L3 archived entities', () => {
    assert.equal(shouldSilentUpdate('L3'), true);
  });

  it('returns true for confirmed status', () => {
    assert.equal(shouldSilentUpdate('L2'), true);
  });

  it('returns true for archived status', () => {
    assert.equal(shouldSilentUpdate('L3'), true);
  });
});

describe('Analysis Orchestrator - Auto-Analysis Rules', () => {
  it('returns true for non-empty diary text', () => {
    assert.equal(shouldAutoAnalyze('今天和张三讨论了项目。'), true);
  });

  it('returns false for very short text (below threshold)', () => {
    assert.equal(shouldAutoAnalyze('嗯'), false);
  });

  it('returns false for whitespace-only text', () => {
    assert.equal(shouldAutoAnalyze('   \n  \t  '), false);
  });

  it('returns false for empty text', () => {
    assert.equal(shouldAutoAnalyze(''), false);
  });

  it('returns true for text just above minimum length', () => {
    assert.equal(shouldAutoAnalyze('今天开会了。'), true);
  });
});
