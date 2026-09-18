import { cpSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const output = path.join(root, 'dist');
const files = ['index.html', 'styles.css', 'force-assets.css', 'script.js', 'asset-hotfix.js'];

rmSync(output, { force: true, recursive: true });
mkdirSync(output, { recursive: true });

for (const file of files) {
  copyFileSync(path.join(root, file), path.join(output, file));
}
cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });

console.log(`Static slot build created at ${output}`);
