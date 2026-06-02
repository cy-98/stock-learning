#!/usr/bin/env node
/**
 * 从仓库 news/new-*.json 同步每日时事到 web/public/data/daily-news.json
 * 用法: npm run sync:news
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRepoRoot } from './repo-root.mjs';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRoot(webRoot);
const newsDir = join(repoRoot, 'news');
const out = join(webRoot, 'public', 'data', 'daily-news.json');

const FILE_RE = /^new-(\d{4}-\d{2}-\d{2})(?:-.+)?\.json$/i;

function parseDateFromFilename(name) {
  const m = name.match(FILE_RE);
  return m?.[1] ?? null;
}

function normalizeItems(payload, fileDate) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.items)) {
    return payload.items.filter((x) => x?.id && x?.title);
  }
  if (payload.id && payload.title) {
    return [payload];
  }
  return [];
}

function readNewsFiles() {
  let names = [];
  try {
    names = readdirSync(newsDir).filter((n) => FILE_RE.test(n));
  } catch {
    names = [];
  }

  const days = {};
  const byId = {};
  const today = new Date().toISOString().slice(0, 10);

  for (const name of names.sort()) {
    const fileDate = parseDateFromFilename(name);
    if (!fileDate) continue;

    const raw = readFileSync(join(newsDir, name), 'utf8');
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.warn('Skip invalid JSON:', name, e.message);
      continue;
    }

    const items = normalizeItems(payload, fileDate).map((item) => ({
      ...item,
      beneficiaries: item.beneficiaries ?? {},
    }));

    if (!days[fileDate]) {
      days[fileDate] = { date: fileDate, sourceFiles: [], items: [] };
    }
    days[fileDate].sourceFiles.push(`news/${name}`);

    for (const item of items) {
      if (byId[item.id]) {
        console.warn(`Duplicate news id "${item.id}" in ${name}, skipping`);
        continue;
      }
      days[fileDate].items.push(item);
      byId[item.id] = { ...item, date: fileDate };
    }
  }

  const catalog = {
    updated: today,
    today,
    days,
    byId,
  };

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(
    'Synced',
    out,
    `(${Object.keys(days).length} day(s), ${Object.keys(byId).length} item(s))`,
  );
}

readNewsFiles();
