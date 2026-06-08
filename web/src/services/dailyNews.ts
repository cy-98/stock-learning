import type { DailyNewsCatalog, DailyNewsDayBundle, DailyNewsItem } from '../types/dailyNews';

export type DailyNewsStatus = 'loading' | 'live' | 'empty';

export interface TodayBundleResult {
  bundle: DailyNewsDayBundle;
  /** 实际展示的新闻日期 */
  displayDate: string;
  /** 当日无新闻、回退到最近一期 */
  isFallback: boolean;
}

const CACHE_KEY = 'stock-learning-daily-news-v1';
const FETCH_TIMEOUT_MS = 8_000;

const REMOTE_CATALOG_URL =
  'https://raw.githubusercontent.com/cy-98/stock-learning/main/web/public/data/daily-news.json';

function bundledCatalogUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}data/daily-news.json`.replace(/\/+/g, '/');
}

function readCache(): DailyNewsCatalog | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyNewsCatalog;
  } catch {
    return null;
  }
}

function writeCache(data: DailyNewsCatalog) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

function isValidCatalog(data: unknown): data is DailyNewsCatalog {
  if (!data || typeof data !== 'object') return false;
  const c = data as DailyNewsCatalog;
  return Boolean(c.days && c.byId);
}

async function fetchJson(url: string): Promise<DailyNewsCatalog | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { cache: 'no-cache', signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!isValidCatalog(data)) return null;
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchCatalog(): Promise<DailyNewsCatalog | null> {
  const urls = [bundledCatalogUrl(), REMOTE_CATALOG_URL];
  for (const url of urls) {
    const data = await fetchJson(url);
    if (!data) continue;
    writeCache(data);
    return data;
  }
  return readCache();
}

export async function fetchDailyNewsCatalog(): Promise<{
  catalog: DailyNewsCatalog | null;
  status: DailyNewsStatus;
}> {
  try {
    const catalog = await fetchCatalog();
    if (!catalog) return { catalog: null, status: 'empty' };
    return { catalog, status: 'live' };
  } catch {
    const cached = readCache();
    if (cached) return { catalog: cached, status: 'live' };
    return { catalog: null, status: 'empty' };
  }
}

function latestDayWithItems(catalog: DailyNewsCatalog): string | null {
  const dates = Object.keys(catalog.days)
    .filter((d) => (catalog.days[d]?.items?.length ?? 0) > 0)
    .sort((a, b) => b.localeCompare(a));
  return dates[0] ?? null;
}

/** 优先当日；无当日数据时回退到最近一期有内容的日期 */
export function resolveTodayBundle(catalog: DailyNewsCatalog | null): TodayBundleResult | null {
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

/** @deprecated 使用 resolveTodayBundle */
export function getTodayBundle(catalog: DailyNewsCatalog | null): DailyNewsDayBundle | null {
  return resolveTodayBundle(catalog)?.bundle ?? null;
}

export function getNewsItemById(
  catalog: DailyNewsCatalog | null,
  id: string | undefined,
): (DailyNewsItem & { date: string }) | null {
  if (!catalog || !id) return null;
  return catalog.byId[id] ?? null;
}
