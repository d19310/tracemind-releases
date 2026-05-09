import { spawn } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface OpenCliRunResult {
  ok: boolean;
  markdown?: string;
  title?: string;
  error?: string;
}

export interface SpawnRunner {
  run(args: string[], timeoutMs: number): Promise<{ code: number | null; stdout: string; stderr: string }>;
}

const defaultSpawnRunner: SpawnRunner = {
  run(args: string[], timeoutMs: number): Promise<{ code: number | null; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn('opencli', args, { stdio: ['pipe', 'pipe', 'pipe'], timeout: timeoutMs });
      let stdout = '';
      let stderr = '';
      proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('error', reject);
      proc.on('close', (code) => resolve({ code, stdout, stderr }));
    });
  },
};

export async function clipWechatWithOpenCli(
  url: string,
  outputDir: string,
  runner: SpawnRunner = defaultSpawnRunner,
): Promise<OpenCliRunResult> {
  try {
    const { code, stderr } = await runner.run(
      ['weixin', 'download', '--url', url, '--output', outputDir, '--download-images', 'true', '--format', 'md'],
      60_000,
    );
    if (code !== 0) {
      return { ok: false, error: stderr || `opencli exited with code ${code}` };
    }
    // Find the output .md file
    const files = readdirSync(outputDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      return { ok: false, error: 'OpenCLI did not produce markdown' };
    }
    const md = readFileSync(join(outputDir, files[0]), 'utf-8');
    const titleMatch = md.match(/^#\s*(.+)/m);
    return { ok: true, markdown: md, title: titleMatch?.[1] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function clipWechatWithOpenCliToTemp(url: string): Promise<OpenCliRunResult> {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tracemind-wx-'));
  return clipWechatWithOpenCli(url, tmpDir).then(r => {
    try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
    return r;
  });
}
