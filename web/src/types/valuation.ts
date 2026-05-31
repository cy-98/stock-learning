/** 与 section-3 估值方法分类对应 */
export type ValuationProfile =
  | 'cyclical_pb'
  | 'growth_pe'
  | 'ps_unprofitable'
  | 'equipment_pe'
  | 'utility_pe'
  | 'rare_earth_pe';

export type ValuationVerdict = 'cheap' | 'fair' | 'rich' | 'extreme' | 'unknown';

export interface ValuationRecord {
  name: string;
  layerId: number;
  profile: ValuationProfile;
  fairLow: number;
  fairHigh: number;
  /** 超过视为极端偏贵；可选 */
  expensiveAbove?: number;
  currency: 'CNY' | 'USD' | 'HKD';
  thesisVersion: string;
  assumptions?: string[];
  /** section-3 锚点标题，便于个股页跳转说明 */
  sectionAnchor?: string;
}

export interface ValuationsFile {
  meta: {
    thesisVersion: string;
    updated: string;
    source: string;
  };
  stocks: Record<string, ValuationRecord>;
}

export interface ValuationSnapshot {
  verdict: ValuationVerdict;
  /** 相对区间中值的偏离 % */
  deviationPct: number | null;
  fairMid: number;
  fairLow: number;
  fairHigh: number;
  expensiveAbove?: number;
  record: ValuationRecord;
}

export interface RankedStockValuation {
  snapshot: ValuationSnapshot | null;
}
