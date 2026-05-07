import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

function readJSON(filename: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf-8'));
}

describe('Version consistency', () => {
  it('package.json.version === manifest.json.version', () => {
    const pkg = readJSON('package.json');
    const manifest = readJSON('manifest.json');
    assert.equal(pkg.version, manifest.version);
  });

  it('package-lock.json.version === package.json.version', () => {
    const pkg = readJSON('package.json');
    const lock = readJSON('package-lock.json');
    assert.equal(lock.version, pkg.version);
  });

  it('package-lock.json.packages[""].version === package.json.version', () => {
    const pkg = readJSON('package.json');
    const lock = readJSON('package-lock.json');
    assert.equal(lock.packages?.['']?.version, pkg.version);
  });

  it('manifest.json.id === "tracemind"', () => {
    const manifest = readJSON('manifest.json');
    assert.equal(manifest.id, 'tracemind');
  });

  it('manifest.json.js === "main.js"', () => {
    const manifest = readJSON('manifest.json');
    assert.equal(manifest.js, 'main.js');
  });
});

describe('Release artifacts', () => {
  it('main.js exists and is non-empty', () => {
    const s = fs.statSync(path.join(ROOT, 'main.js'));
    assert.ok(s.size > 0, 'main.js should be non-empty');
  });

  it('manifest.json exists and is valid JSON', () => {
    const manifest = readJSON('manifest.json');
    assert.ok(manifest.id);
    assert.ok(manifest.version);
  });

  it('styles.css is optional: pass either way', () => {
    const cssPath = path.join(ROOT, 'styles.css');
    if (fs.existsSync(cssPath)) {
      const s = fs.statSync(cssPath);
      assert.ok(s.size > 0, 'styles.css exists but is empty');
    }
    // No styles.css is not a failure — it's optional.
  });
});
