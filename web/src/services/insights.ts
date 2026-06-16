import yaml from 'yaml';
import type { LayerEvent } from '../config/layers';
import type {
  InsightPick,
  LayerInsightsDocument,
  ShisoLeafPick,
  ShisoLeafSection,
} from '../types/insights';
import type { ValuationSnapshot } from '../types/valuation';
import { computeVerdict } from '../utils/computeVerdict';
import type { ValuationRecord } from '../types/valuation';
import { fetchCnQuotes, fetchGlobalQuotes, type RankedStock } from './stock';

const BASE = import.meta.env.BASE_URL;
const cache = new Map<number, LayerInsightsDocument>();

function insightsUrl(layerId: number) {
  return `${BASE}insights/layer-${layerId}.yaml`.replace(/\/+/g, '/');
}

export async function fetchLayerInsights(
  layerId: number,
): Promise<LayerInsightsDocument | null> {
  if (cache.has(layerId)) return cache.get(layerId) ?? null;
  try {
    const res = await fetch(insightsUrl(layerId));
    if (!res.ok) return null;
    const doc = yaml.parse(await res.text()) as LayerInsightsDocument;
    if (!doc?.picks?.length) return null;
    cache.set(layerId, doc);
    return doc;
  } catch (e) {
    console.warn(`insights layer-${layerId} load failed`, e);
    return null;
  }
}

export function resolveLinkedEvents(
  titles: string[],
  events: LayerEvent[],
): LayerEvent[] {
  const out: LayerEvent[] = [];
  for (const t of titles) {
    const hit = events.find((e) => e.title === t || e.title.includes(t));
    if (hit && !out.some((x) => x.title === hit.title)) out.push(hit);
  }
  return out;
}

export interface EnrichedInsightPick extends InsightPick {
  quote: RankedStock | null;
  valuation: ValuationSnapshot | null;
  linkedEvents: LayerEvent[];
}

export async function enrichInsightPicks(
  picks: InsightPick[],
  events: LayerEvent[],
  valuations: Record<string, ValuationRecord>,
): Promise<EnrichedInsightPick[]> {
  const cnCodes = picks.filter((p) => /^(sh|sz|bj)/i.test(p.code)).map((p) => p.code);
  const globalCodes = picks.filter((p) => !/^(sh|sz|bj)/i.test(p.code)).map((p) => p.code);

  const [cnQ, globalQ] = await Promise.all([
    fetchCnQuotes(cnCodes),
    fetchGlobalQuotes(globalCodes),
  ]);
  const byCode = new Map(
    [...cnQ, ...globalQ].map((q) => [q.code, { ...q, kline: [] as RankedStock['kline'] }]),
  );

  return picks.map((pick) => {
    const quote = byCode.get(pick.code) ?? null;
    const rec = valuations[pick.code];
    const valuation =
      quote && rec && quote.price > 0 ? computeVerdict(quote.price, rec) : null;
    return {
      ...pick,
      quote,
      valuation,
      linkedEvents: resolveLinkedEvents(pick.linkedEventTitles, events),
    };
  });
}

export interface EnrichedShisoPick extends ShisoLeafPick {
  quote: RankedStock | null;
}

export interface EnrichedShisoLeaf extends ShisoLeafSection {
  picks: EnrichedShisoPick[];
}

export async function enrichShisoLeaf(
  shiso: ShisoLeafSection | undefined,
): Promise<EnrichedShisoLeaf | null> {
  if (!shiso?.picks?.length) return null;

  const cnCodes = shiso.picks
    .filter((p) => /^(sh|sz|bj)/i.test(p.code))
    .map((p) => p.code);
  const globalCodes = shiso.picks
    .filter((p) => !/^(sh|sz|bj)/i.test(p.code))
    .map((p) => p.code);

  const [cnQ, globalQ] = await Promise.all([
    fetchCnQuotes(cnCodes),
    fetchGlobalQuotes(globalCodes),
  ]);
  const byCode = new Map(
    [...cnQ, ...globalQ].map((q) => [q.code, { ...q, kline: [] as RankedStock['kline'] }]),
  );

  return {
    ...shiso,
    picks: shiso.picks.map((pick) => ({
      ...pick,
      quote: byCode.get(pick.code) ?? null,
    })),
  };
}

export function horizonLabel(h: InsightPick['horizon']): string {
  switch (h) {
    case 'short':
      return '短期';
    case 'medium':
      return '中期';
    case 'long':
      return '长期';
    default:
      return h;
  }
}
