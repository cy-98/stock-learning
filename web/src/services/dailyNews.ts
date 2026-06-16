import type { DailyNewsCatalog, DailyNewsDayBundle, DailyNewsItem } from '../types/dailyNews';

export type DailyNewsStatus = 'loading' | 'live' | 'empty';

const CACHE_KEY = 'stock-learning-daily-news-v1';

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

async function fetchCatalog(): Promise<DailyNewsCatalog | null> {
  const urls = [bundledCatalogUrl(), REMOTE_CATALOG_URL];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) continue;
      const data = (await res.json()) as DailyNewsCatalog;
      if (!data?.days || !data?.byId) continue;
      writeCache(data);
      return data;
    } catch {
      /* next */
    }
  }
  return readCache();
}

export async function fetchDailyNewsCatalog(): Promise<{
  catalog: DailyNewsCatalog | null;
  status: DailyNewsStatus;
}> {
  const catalog = await fetchCatalog();
  if (!catalog) return { catalog: null, status: 'empty' };
  return { catalog, status: 'live' };
}

export function getTodayBundle(catalog: DailyNewsCatalog | null): DailyNewsDayBundle | null {
  return getDisplayBundle(catalog).bundle;
}

/** 今日无数据时回退到最近一日，避免 Automation 空档导致首页空白 */
export function getDisplayBundle(catalog: DailyNewsCatalog | null): {
  bundle: DailyNewsDayBundle | null;
  displayDate: string;
  isFallback: boolean;
} {
  if (!catalog) return { bundle: null, displayDate: '', isFallback: false };

  const today = catalog.today;
  const todayBundle = catalog.days[today];
  if (todayBundle?.items?.length) {
    return { bundle: todayBundle, displayDate: today, isFallback: false };
  }

  const latestDate = Object.keys(catalog.days)
    .sort()
    .reverse()
    .find((d) => (catalog.days[d]?.items?.length ?? 0) > 0);

  if (latestDate) {
    return {
      bundle: catalog.days[latestDate],
      displayDate: latestDate,
      isFallback: true,
    };
  }

  return { bundle: null, displayDate: today, isFallback: false };
}

export function getNewsItemById(
  catalog: DailyNewsCatalog | null,
  id: string | undefined,
): (DailyNewsItem & { date: string }) | null {
  if (!catalog || !id) return null;
  return catalog.byId[id] ?? null;
}
