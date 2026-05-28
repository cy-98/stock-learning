import type { LayerEvent, LayerTrend } from '../config/layers';

export interface LayerFeedPayload {
  updated: string;
  source?: string;
  layers: Record<string, { events: LayerEvent[]; trends: LayerTrend[] }>;
}

export type LayerFeedStatus = 'loading' | 'live' | 'fallback';

const CACHE_KEY = 'stock-learning-layer-feed-v1';

/** 构建时随站点发布的 feed（改 JSON 后重新部署即可更新） */
function bundledFeedUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}data/layer-feed.json`.replace(/\/+/g, '/');
}

/** 可选：直接读 GitHub 上 main 分支的 feed，无需等前端重新 build（受 CORS / 网络影响） */
const REMOTE_FEED_URL =
  'https://raw.githubusercontent.com/cy-98/stock-learning/main/web/public/data/layer-feed.json';

function readCache(): LayerFeedPayload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LayerFeedPayload;
  } catch {
    return null;
  }
}

function writeCache(data: LayerFeedPayload) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

async function fetchJson(url: string): Promise<LayerFeedPayload | null> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) return null;
  const data = (await res.json()) as LayerFeedPayload;
  if (!data?.layers) return null;
  return data;
}

/**
 * 拉取动态大事件 / 趋势数据。
 * 优先同源 layer-feed.json，其次 GitHub raw，最后 session 缓存。
 */
export async function fetchLayerFeed(): Promise<{
  data: LayerFeedPayload | null;
  status: LayerFeedStatus;
}> {
  const urls = [bundledFeedUrl(), REMOTE_FEED_URL];

  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      if (data) {
        writeCache(data);
        return { data, status: 'live' };
      }
    } catch {
      /* try next */
    }
  }

  const cached = readCache();
  if (cached) return { data: cached, status: 'live' };

  return { data: null, status: 'fallback' };
}

export function getLayerFeedSlice(
  feed: LayerFeedPayload | null,
  layerId: number,
): { events: LayerEvent[]; trends: LayerTrend[] } | null {
  if (!feed) return null;
  const slice = feed.layers[String(layerId)];
  if (!slice) return null;
  return { events: slice.events ?? [], trends: slice.trends ?? [] };
}
