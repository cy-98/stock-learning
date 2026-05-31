/** 与 insights/layer-*.yaml 对应，供 Automation / 人工维护 */

export type InsightBias = 'cheap' | 'fair' | 'rich' | 'extreme';
export type InsightHorizon = 'short' | 'medium' | 'long';

export interface InsightTermView {
  bias: InsightBias;
  label: string;
  note: string;
}

export interface InsightPick {
  code: string;
  name: string;
  rank: number;
  priceBias: InsightBias;
  shortTerm: InsightTermView;
  longTerm: InsightTermView;
  holdPeriod: string;
  expectedReturnPct: string;
  horizon: InsightHorizon;
  linkedEventTitles: string[];
  aiSummary: string;
}

export interface LayerInsightsDocument {
  layerId: number;
  slug: string;
  updated: string;
  source: string;
  summary: string;
  picks: InsightPick[];
}
