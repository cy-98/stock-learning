/** 每日时事（news/new-YYYY-MM-DD*.json，由 automation 维护） */

export interface DailyNewsStockBeneficiary {
  code: string;
  name: string;
  reason?: string;
}

export interface DailyNewsBeneficiaries {
  industries?: string[];
  companies?: string[];
  stocks?: DailyNewsStockBeneficiary[];
}

export interface DailyNewsItem {
  /** 详情页路由用，文件内唯一 */
  id: string;
  title: string;
  /** 主要信息 */
  summary: string;
  /** 原文链接 */
  sourceUrl?: string;
  publishedAt?: string;
  /** 五层模型 id 1–5 */
  layerIds?: number[];
  /** 相关行业标签 */
  industries?: string[];
  beneficiaries: DailyNewsBeneficiaries;
}

/** 单文件可为一条或多条 */
export type DailyNewsFilePayload =
  | DailyNewsItem
  | { date?: string; items: DailyNewsItem[] };

export interface DailyNewsDayBundle {
  date: string;
  sourceFiles: string[];
  items: DailyNewsItem[];
}

export interface DailyNewsCatalog {
  updated: string;
  today: string;
  days: Record<string, DailyNewsDayBundle>;
  /** id → 条目（含 date，供详情页） */
  byId: Record<string, DailyNewsItem & { date: string }>;
}
