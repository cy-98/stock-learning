import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LayerEvent, LayerTrend } from '../config/layers';
import {
  fetchLayerFeed,
  type LayerFeedPayload,
  type LayerFeedStatus,
} from '../services/layerFeed';

interface LayerFeedContextValue {
  status: LayerFeedStatus;
  updated: string | null;
  source: string | null;
  refresh: () => void;
  getEvents: (layerId: number) => LayerEvent[];
  getTrends: (layerId: number) => LayerTrend[];
}

const LayerFeedContext = createContext<LayerFeedContextValue | null>(null);

export function LayerFeedProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<LayerFeedPayload | null>(null);
  const [status, setStatus] = useState<LayerFeedStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    const { data, status: st } = await fetchLayerFeed();
    setFeed(data);
    setStatus(data ? 'live' : 'fallback');
    if (!data && st === 'fallback') setStatus('fallback');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<LayerFeedContextValue>(
    () => ({
      status,
      updated: feed?.updated ?? null,
      source: feed?.source ?? null,
      refresh: load,
      getEvents: (layerId) => feed?.layers[String(layerId)]?.events ?? [],
      getTrends: (layerId) => feed?.layers[String(layerId)]?.trends ?? [],
    }),
    [feed, status, load],
  );

  return (
    <LayerFeedContext.Provider value={value}>{children}</LayerFeedContext.Provider>
  );
}

export function useLayerFeed() {
  const ctx = useContext(LayerFeedContext);
  if (!ctx) throw new Error('useLayerFeed must be used within LayerFeedProvider');
  return ctx;
}

export function useLayerEventsAndTrends(
  layerId: number,
  fallback: { events: LayerEvent[]; trends: LayerTrend[] },
) {
  const feed = useLayerFeed();
  const feedEvents = feed.getEvents(layerId);
  const feedTrends = feed.getTrends(layerId);
  const isDynamic =
    feed.status === 'live' && (feedEvents.length > 0 || feedTrends.length > 0);

  return {
    events: isDynamic ? feedEvents : fallback.events,
    trends: isDynamic ? feedTrends : fallback.trends,
    feedStatus: feed.status,
    feedUpdated: feed.updated,
    feedSource: feed.source,
    refreshFeed: feed.refresh,
    isDynamic,
  };
}
