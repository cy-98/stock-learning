import { useContext } from 'react';
import type { LayerEvent, LayerTrend } from '../config/layers';
import { LayerFeedContext } from '../context/feedContext';

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
