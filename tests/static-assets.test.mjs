import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, '..');

function assertStaticSite(siteRoot) {
  const html = readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map((match) => match[1].split('?')[0])
    .filter((source) => !/^https?:/i.test(source));

  assert.ok(scripts.length > 0, 'expected local scripts in index.html');
  for (const source of scripts) {
    const filePath = path.resolve(siteRoot, source.replace(/^\.\//, '').replace(/^\/+/, ''));
    assert.equal(existsSync(filePath), true, `missing script: ${source}`);
    const content = readFileSync(filePath, 'utf8').trimStart();
    assert.equal(/^<!doctype|^<html/i.test(content), false, `${source} contains HTML instead of JavaScript`);
  }
}

test('every local script referenced by index.html exists and contains JavaScript', () => {
  assertStaticSite(root);
  const dist = path.join(root, 'dist');
  if (existsSync(dist)) assertStaticSite(dist);
});

test('Vercel is configured to deploy the repository root as static output', () => {
  const configPath = path.join(root, 'vercel.json');
  assert.equal(existsSync(configPath), true, 'vercel.json is required to prevent SPA fallback routing');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(Object.hasOwn(config, 'rewrites'), false, 'static scripts must not be rewritten to index.html');

  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(packageJson.scripts.build, 'node scripts/build-static.mjs');
});
