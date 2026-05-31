import { StockSDK } from 'stock-sdk';

export interface RankedStock {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  market: 'cn' | 'global';
  kline: KlinePoint[];
}

export interface KlinePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const sdk = new StockSDK({
  timeout: 12000,
  providerPolicies: {
    tencent: {
      rateLimit: { requestsPerSecond: 4, maxBurst: 8 },
    },
    eastmoney: {
      timeout: 15000,
      rateLimit: { requestsPerSecond: 2, maxBurst: 4 },
    },
  },
});

function isCnCode(code: string): boolean {
  return /^(sh|sz|bj)/i.test(code);
}

function num(v: number | null | undefined): number {
  return v != null && Number.isFinite(v) ? v : 0;
}

function marketCapOf(item: {
  marketCap?: number | null;
  totalMarketCap?: number | null;
  amount?: number | null;
}): number {
  return num(item.marketCap) || num(item.totalMarketCap);
}

export async function fetchCnQuotes(codes: string[]) {
  if (!codes.length) return [];
  try {
    const list = await sdk.getSimpleQuotes(codes);
    return (list ?? []).map((q) => ({
      code:
        codes.find(
          (c) =>
            c === String(q.code) ||
            c.endsWith(String(q.code)) ||
            String(q.code).endsWith(c.replace(/^(sh|sz|bj)/i, '')),
        ) ?? `sh${q.code}`,
      name: q.name ?? String(q.code),
      price: Number(q.price) || 0,
      change: Number(q.change) || 0,
      changePercent: Number(q.changePercent) || 0,
      marketCap: marketCapOf(q),
      market: 'cn' as const,
    }));
  } catch (e) {
    console.warn('CN quotes failed', e);
    return [];
  }
}

export async function fetchGlobalQuotes(codes: string[]) {
  if (!codes.length) return [];
  const results: Omit<RankedStock, 'kline'>[] = [];

  for (const code of codes) {
    try {
      await delay(120);
      if (isCnCode(code)) {
        const [hk] = await sdk.getHKQuotes([code.replace(/^(sh|sz)/, 'hk')]);
        if (hk) {
          results.push({
            code,
            name: hk.name ?? code,
            price: Number(hk.price) || 0,
            change: Number(hk.change) || 0,
            changePercent: Number(hk.changePercent) || 0,
            marketCap: marketCapOf(hk),
            market: 'global',
          });
        }
        continue;
      }
      const batch = await sdk.getUSQuotes([code]);
      const q = batch?.[0];
      if (q) {
        results.push({
          code,
          name: q.name ?? code,
          price: Number(q.price) || 0,
          change: Number(q.change) || 0,
          changePercent: Number(q.changePercent) || 0,
          marketCap: marketCapOf(q),
          market: 'global',
        });
      }
    } catch (e) {
      console.warn(`Global quote failed: ${code}`, e);
    }
  }
  return results;
}

async function fetchKline(code: string, market: 'cn' | 'global'): Promise<KlinePoint[]> {
  try {
    await delay(80);
    let raw: Array<{ date?: string; open?: number | null; high?: number | null; low?: number | null; close?: number | null }> = [];

    if (market === 'cn') {
      raw = ((await sdk.getHistoryKline(code, { period: 'daily' })) ?? []) as typeof raw;
    } else if (code.startsWith('us')) {
      raw = ((await sdk.getUSHistoryKline(code, { period: 'daily' })) ?? []) as typeof raw;
    } else if (code.startsWith('hk')) {
      raw = ((await sdk.getHKHistoryKline(code, { period: 'daily' })) ?? []) as typeof raw;
    }

    const cleaned = raw
      .map((b) => ({
        time: b.date ?? '',
        open: num(b.open),
        high: num(b.high),
        low: num(b.low),
        close: num(b.close),
      }))
      .filter((b) => b.close > 0 && b.high > 0)
      .slice(-60);

    return cleaned;
  } catch (e) {
    console.warn(`Kline failed: ${code}`, e);
    return [];
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 按总市值排序取 Top N */
export function rankByMarketCap<T extends { marketCap: number }>(items: T[], top = 5): T[] {
  return [...items].sort((a, b) => b.marketCap - a.marketCap).slice(0, top);
}

/** 单只股票行情 + 近 60 日 K 线（个股页） */
export async function fetchStockByCode(code: string): Promise<RankedStock | null> {
  const market: 'cn' | 'global' = isCnCode(code) ? 'cn' : 'global';
  const quotes =
    market === 'cn' ? await fetchCnQuotes([code]) : await fetchGlobalQuotes([code]);
  const row = quotes.find((q) => q.code === code) ?? quotes[0];
  if (!row) return null;
  return {
    ...row,
    code,
    kline: await fetchKline(row.code, market),
  };
}

export async function fetchLayerTopStocks(
  cnPool: string[],
  globalPool: string[],
  top = 5,
): Promise<{ cn: RankedStock[]; global: RankedStock[] }> {
  const [cnRaw, globalRaw] = await Promise.all([
    fetchCnQuotes(cnPool),
    fetchGlobalQuotes(globalPool),
  ]);

  const cnTop = rankByMarketCap(cnRaw, top);
  const globalTop = rankByMarketCap(globalRaw, top);

  const cn = await Promise.all(
    cnTop.map(async (s) => ({
      ...s,
      kline: await fetchKline(s.code, 'cn'),
    })),
  );

  const global = await Promise.all(
    globalTop.map(async (s) => ({
      ...s,
      kline: await fetchKline(s.code, 'global'),
    })),
  );

  return { cn, global };
}

/** 首页热度：仅拉 A 股候选池涨跌，不请求 K 线 */
export async function fetchLayersCnMomentum(
  layers: { id: number; stocks: { cn: string[] } }[],
  samplePerLayer = 6,
): Promise<Record<number, { changePercent: number }[]>> {
  const codes = [
    ...new Set(layers.flatMap((l) => l.stocks.cn.slice(0, samplePerLayer))),
  ];
  if (!codes.length) return {};

  const quotes = await fetchCnQuotes(codes);
  const byCode = new Map(quotes.map((q) => [q.code, q]));

  const out: Record<number, { changePercent: number }[]> = {};
  for (const layer of layers) {
    out[layer.id] = layer.stocks.cn
      .slice(0, samplePerLayer)
      .map((c) => byCode.get(c))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .map((q) => ({ changePercent: q.changePercent }));
  }
  return out;
}
