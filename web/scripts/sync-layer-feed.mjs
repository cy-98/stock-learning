#!/usr/bin/env node
/**
 * 从 docs/data/layers.json 同步大事件/趋势到 web/public/data/layer-feed.json
 * 用法: npm run sync:feed
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRepoRoot } from './repo-root.mjs';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRoot(webRoot);
const src = join(repoRoot, 'docs', 'data', 'layers.json');
const out = join(webRoot, 'public', 'data', 'layer-feed.json');

const data = JSON.parse(readFileSync(src, 'utf8'));
const feed = {
  updated: data.meta?.updated ?? new Date().toISOString().slice(0, 10),
  source: 'docs/data/layers.json',
  layers: Object.fromEntries(
    data.layers.map((L) => [
      String(L.id),
      { events: L.events ?? [], trends: L.trends ?? [] },
    ]),
  ),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(feed, null, 2) + '\n', 'utf8');
console.log('Synced', out);
