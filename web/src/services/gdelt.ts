import type { LayerGdeltConfig } from '../config/layerGdelt';

const API_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
/** GDELT 公开接口建议 ≥5 秒/次 */
const MIN_INTERVAL_MS = 5200;

export interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
}

export interface GdeltFetchResult {
  articles: GdeltArticle[];
  fetchedAt: string;
  query: string;
  fromCache: boolean;
}

interface CacheEntry {
  at: number;
  data: GdeltFetchResult;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const SESSION_PREFIX = 'gdelt-cache:';

let lastRequestAt = 0;
let queue: Promise<void> = Promise.resolve();

function cacheKey(cfg: LayerGdeltConfig): string {
  return `${cfg.query}|${cfg.timespan}|${cfg.maxRecords}`;
}

function readSession(key: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.at > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeSession(key: string, entry: CacheEntry) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

function throttle(): Promise<void> {
  const run = async () => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
  };
  queue = queue.then(run, run);
  return queue;
}

function parseArticles(raw: unknown): GdeltArticle[] {
  if (!raw || typeof raw !== 'object') return [];
  const articles = (raw as { articles?: unknown }).articles;
  if (!Array.isArray(articles)) return [];
  const out: GdeltArticle[] = [];
  for (const a of articles) {
    if (!a || typeof a !== 'object') continue;
    const o = a as Record<string, unknown>;
    const url = String(o.url ?? '');
    const title = String(o.title ?? '').trim();
    if (!url || !title) continue;
    const item: GdeltArticle = {
      url,
      title,
      seendate: String(o.seendate ?? ''),
      domain: String(o.domain ?? ''),
      language: String(o.language ?? ''),
      sourcecountry: String(o.sourcecountry ?? ''),
    };
    if (o.socialimage) item.socialimage = String(o.socialimage);
    out.push(item);
  }
  return out;
}

/** 将 GDELT seendate (20260526T003000Z) 格式化为本地可读时间 */
export function formatGdeltSeen(seendate: string): string {
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return seendate;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return seendate;
  }
}

export async function fetchGdeltArticles(
  cfg: LayerGdeltConfig,
  options?: { force?: boolean },
): Promise<GdeltFetchResult> {
  const key = cacheKey(cfg);
  const now = Date.now();

  if (!options?.force) {
    const mem = memoryCache.get(key);
    if (mem && now - mem.at < CACHE_TTL_MS) {
      return { ...mem.data, fromCache: true };
    }
    const ses = readSession(key);
    if (ses) {
      memoryCache.set(key, ses);
      return { ...ses.data, fromCache: true };
    }
  }

  await throttle();

  const params = new URLSearchParams({
    query: cfg.query,
    mode: 'ArtList',
    format: 'json',
    maxrecords: String(cfg.maxRecords),
    timespan: cfg.timespan,
  });

  const url = `${API_BASE}?${params.toString()}`;
  const res = await fetch(url);

  if (res.status === 429) {
    throw new Error('GDELT 请求过于频繁，请约 5 秒后再试');
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text.slice(0, 120) || `GDELT 请求失败 (${res.status})`);
  }

  if (text.includes('Please limit requests')) {
    throw new Error('GDELT 限流：请约 5 秒后再刷新');
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('GDELT 返回非 JSON 数据');
  }

  const articles = parseArticles(json);
  const result: GdeltFetchResult = {
    articles,
    fetchedAt: new Date().toISOString(),
    query: cfg.query,
    fromCache: false,
  };

  const entry: CacheEntry = { at: now, data: result };
  memoryCache.set(key, entry);
  writeSession(key, entry);

  return result;
}
