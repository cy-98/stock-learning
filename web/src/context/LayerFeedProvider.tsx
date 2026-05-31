import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchLayerFeed,
  type LayerFeedPayload,
  type LayerFeedStatus,
} from '../services/layerFeed';
import { LayerFeedContext, type LayerFeedContextValue } from './feedContext';

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
    void load();
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
