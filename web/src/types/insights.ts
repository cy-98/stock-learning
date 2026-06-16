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

/** 紫苏叶理论：每层一个「隐形瓶颈」标的簇 */
export interface ShisoLeafPick {
  code: string;
  name: string;
  /** A股 / 美股 / 港股 */
  market: 'A股' | '美股' | '港股';
  /** primary = 首选紫苏叶；alternate = 同层备选 */
  tier: 'primary' | 'alternate';
  note: string;
}

export interface ShisoLeafSection {
  /** 瓶颈环节名称，如「磷化铟衬底」 */
  title: string;
  /** 本层「金枪鱼」对照，帮助理解层级 */
  tunaContrast: string;
  /** 为何不可或缺、为何稀缺（2–4 句） */
  description: string;
  scarcity:
    | string
    | {
        suppliers?: string;
        leadTime?: string;
        replaceability?: string;
      };
  picks: ShisoLeafPick[];
}

export interface LayerInsightsDocument {
  layerId: number;
  slug: string;
  updated: string;
  source: string;
  summary: string;
  shisoLeaf?: ShisoLeafSection;
  picks: InsightPick[];
}
