import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRepoRoot } from './repo-root.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRoot(webRoot);
const specSrc = path.join(repoRoot, 'spec');
const specOut = path.join(webRoot, 'public', 'spec');

fs.mkdirSync(specOut, { recursive: true });

if (!fs.existsSync(specSrc)) {
  console.warn('[sync-spec-yaml] spec/ not found, skip');
  process.exit(0);
}

for (const name of fs.readdirSync(specSrc)) {
  if (/\.ya?ml$/i.test(name)) {
    fs.copyFileSync(path.join(specSrc, name), path.join(specOut, name));
  }
}

console.log('[sync-spec-yaml] copied spec/*.yaml → web/public/spec');
