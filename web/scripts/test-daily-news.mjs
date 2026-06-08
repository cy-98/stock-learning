#!/usr/bin/env node
/**
 * 每日新闻目录解析单元测试（node scripts/test-daily-news.mjs）
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function latestDayWithItems(catalog) {
  const dates = Object.keys(catalog.days)
    .filter((d) => (catalog.days[d]?.items?.length ?? 0) > 0)
    .sort((a, b) => b.localeCompare(a));
  return dates[0] ?? null;
}

function resolveTodayBundle(catalog) {
  if (!catalog) return null;

  const today = catalog.today;
  const todayBundle = catalog.days[today];
  if (todayBundle?.items?.length) {
    return { bundle: todayBundle, displayDate: today, isFallback: false };
  }

  const latest = latestDayWithItems(catalog);
  if (!latest) return null;

  const bundle = catalog.days[latest];
  if (!bundle?.items?.length) return null;

  return { bundle, displayDate: latest, isFallback: latest !== today };
}

const catalog = JSON.parse(
  readFileSync(join(webRoot, 'public/data/daily-news.json'), 'utf8'),
);

const resolved = resolveTodayBundle(catalog);
assert.ok(resolved, 'should resolve a bundle from catalog');
assert.equal(resolved.isFallback, true, 'today without items should fallback');
assert.equal(resolved.displayDate, '2026-06-03', 'should pick latest day with items');
assert.ok(resolved.bundle.items.length > 0, 'fallback bundle should have items');

const exact = resolveTodayBundle({
  today: '2026-06-03',
  days: catalog.days,
});
assert.equal(exact.isFallback, false, 'exact day match should not fallback');

console.log('test-daily-news: ok');
