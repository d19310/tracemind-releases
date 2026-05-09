import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { clipWechatWithOpenCli, type SpawnRunner } from '../../src/utils/opencli-web-clipper';

function fakeRunner(code: number | null, stdout: string, stderr: string): SpawnRunner {
  return {
    run: () => Promise.resolve({ code, stdout, stderr }),
  };
}

describe('clipWechatWithOpenCli', () => {
  it('returns ok:false when exit code is non-zero', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'tracemind-test-'));
    try {
      const result = await clipWechatWithOpenCli('https://mp.weixin.qq.com/s/test', tmp, fakeRunner(1, '', 'error'));
      assert.equal(result.ok, false);
      assert.ok(result.error);
    } finally { rmSync(tmp, { recursive: true }); }
  });

  it('returns ok:false when no .md file produced', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'tracemind-test-'));
    try {
      const result = await clipWechatWithOpenCli('https://mp.weixin.qq.com/s/test', tmp, fakeRunner(0, 'done', ''));
      assert.equal(result.ok, false);
      assert.ok(result.error?.includes('did not produce markdown'));
    } finally { rmSync(tmp, { recursive: true }); }
  });

  it('returns ok:true and reads markdown when .md file exists', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'tracemind-test-'));
    try {
      writeFileSync(join(tmp, 'article.md'), '# Test Title\n\nContent');
      const result = await clipWechatWithOpenCli('https://mp.weixin.qq.com/s/test', tmp, fakeRunner(0, '', ''));
      assert.equal(result.ok, true);
      assert.ok(result.markdown?.includes('# Test Title'));
      assert.equal(result.title, 'Test Title');
    } finally { rmSync(tmp, { recursive: true }); }
  });
});
