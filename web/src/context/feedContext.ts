import { createContext } from 'react';
import type { LayerEvent, LayerTrend } from '../config/layers';
import type { LayerFeedStatus } from '../services/layerFeed';

export interface LayerFeedContextValue {
  status: LayerFeedStatus;
  updated: string | null;
  source: string | null;
  refresh: () => void;
  getEvents: (layerId: number) => LayerEvent[];
  getTrends: (layerId: number) => LayerTrend[];
}

export const LayerFeedContext = createContext<LayerFeedContextValue | null>(null);
