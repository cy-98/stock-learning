import type { RankedStock } from './stock';
import { fetchCnQuotes } from './stock';
import type { ValuationRecord, ValuationsFile, ValuationSnapshot } from '../types/valuation';
import { computeVerdict } from '../utils/computeVerdict';

const BASE = import.meta.env.BASE_URL;

let cache: ValuationsFile | null = null;

function valuationsUrl() {
  return `${BASE}data/valuations.json`.replace(/\/+/g, '/');
}

export async function fetchValuations(): Promise<{
  stocks: Record<string, ValuationRecord>;
  meta: ValuationsFile['meta'] | null;
}> {
  if (cache) {
    return { stocks: cache.stocks, meta: cache.meta };
  }
  try {
    const res = await fetch(valuationsUrl());
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as ValuationsFile;
    cache = data;
    return { stocks: data.stocks ?? {}, meta: data.meta ?? null };
  } catch (e) {
    console.warn('valuations.json load failed', e);
    return { stocks: {}, meta: null };
  }
}

export function attachValuation(
  stock: RankedStock,
  stocks: Record<string, ValuationRecord>,
): RankedStock & { valuation: ValuationSnapshot | null } {
  const record = stocks[stock.code];
  if (!record || stock.price <= 0) {
    return { ...stock, valuation: null };
  }
  return { ...stock, valuation: computeVerdict(stock.price, record) };
}

export function enrichRankedStocks(
  list: RankedStock[],
  stocks: Record<string, ValuationRecord>,
) {
  return list.map((s) => attachValuation(s, stocks));
}

export function countRichInPool(
  quotes: { code: string; price: number }[],
  stocks: Record<string, ValuationRecord>,
): number {
  return quotes.filter((q) => {
    const rec = stocks[q.code];
    if (!rec || q.price <= 0) return false;
    const v = computeVerdict(q.price, rec).verdict;
    return v === 'rich' || v === 'extreme';
  }).length;
}

export function countValuedInPool(cnPool: string[], stocks: Record<string, ValuationRecord>) {
  return cnPool.filter((c) => stocks[c]).length;
}

/** 各层候选池内已录入估值标的之偏贵/极端偏贵数量 */
export async function fetchLayerRichCounts(
  layers: { id: number; stocks: { cn: string[] } }[],
  stocks: Record<string, ValuationRecord>,
  samplePerLayer = 8,
): Promise<Record<number, number>> {
  const out: Record<number, number> = {};
  await Promise.all(
    layers.map(async (layer) => {
      const codes = layer.stocks.cn.filter((c) => stocks[c]).slice(0, samplePerLayer);
      if (!codes.length) {
        out[layer.id] = 0;
        return;
      }
      const quotes = await fetchCnQuotes(codes);
      out[layer.id] = countRichInPool(quotes, stocks);
    }),
  );
  return out;
}
