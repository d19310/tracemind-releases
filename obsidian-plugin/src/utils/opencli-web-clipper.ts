import { spawn, execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

function resolveOpenCli(): string {
  // Check common install locations (Electron may not inherit full shell PATH)
  const candidates = [
    '/opt/homebrew/bin/opencli',
    '/usr/local/bin/opencli',
    '/usr/bin/opencli',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Fall back to PATH resolution
  try {
    return execSync('which opencli', { encoding: 'utf-8' }).trim();
  } catch {
    return 'opencli'; // last resort — will fail with ENOENT
  }
}

export interface OpenCliRunResult {
  ok: boolean;
  markdown?: string;
  title?: string;
  baseDir?: string; // root of OpenCLI output (contains images/ subdir)
  error?: string;
}

export interface SpawnRunner {
  run(args: string[], timeoutMs: number): Promise<{ code: number | null; stdout: string; stderr: string }>;
}

const defaultSpawnRunner: SpawnRunner = {
  run(args: string[], timeoutMs: number): Promise<{ code: number | null; stdout: string; stderr: string }> {
    const bin = resolveOpenCli();
    return new Promise((resolve, reject) => {
      const proc = spawn(bin, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: timeoutMs,
        env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:${process.env.PATH || ''}` },
      });
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
    // Find the output .md file (OpenCLI creates a subdirectory)
    const findMd = (dir: string): string | null => {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = join(dir, e.name);
        if (e.isFile() && e.name.endsWith('.md')) return full;
        if (e.isDirectory()) {
          const found = findMd(full);
          if (found) return found;
        }
      }
      return null;
    };
    const mdPath = findMd(outputDir);
    if (!mdPath) {
      return { ok: false, error: 'OpenCLI did not produce markdown' };
    }
    const md = readFileSync(mdPath, 'utf-8');
    const titleMatch = md.match(/^#\s*(.+)/m);
    return { ok: true, markdown: md, title: titleMatch?.[1], baseDir: dirname(mdPath) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function clipWechatWithOpenCliToTemp(url: string): Promise<OpenCliRunResult> {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tracemind-wx-'));
  return clipWechatWithOpenCli(url, tmpDir).then(r => {
    // Don't clean up here — caller needs images/ from baseDir
    return r;
  });
}
