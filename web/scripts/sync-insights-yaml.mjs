import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRepoRoot } from './repo-root.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRoot(webRoot);
const insightsSrc = path.join(repoRoot, 'insights');
const insightsOut = path.join(webRoot, 'public', 'insights');

fs.mkdirSync(insightsOut, { recursive: true });

if (!fs.existsSync(insightsSrc)) {
  console.warn('[sync-insights-yaml] insights/ not found, skip');
  process.exit(0);
}

let n = 0;
for (const name of fs.readdirSync(insightsSrc)) {
  if (/^layer-\d+\.ya?ml$/i.test(name)) {
    fs.copyFileSync(path.join(insightsSrc, name), path.join(insightsOut, name));
    n++;
  }
}

console.log(`[sync-insights-yaml] copied ${n} layer insights → web/public/insights`);
