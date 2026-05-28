import type { LayerConfig } from '../config/layers';
import type { HeatProgressResult, LayerHeatPeriod } from './heatProgress';
import { getHeatProgress } from './heatProgress';

/** 综合热度 = 周期进度 + 行情动能 + 事件/趋势时效（可自动降级） */
export interface DynamicHeatResult {
  percent: number;
  ratio: number;
  cycle: HeatProgressResult;
  market: number | null;
  events: number;
  /** 各分项 0–100 */
  parts: { cycle: number; market: number | null; events: number };
  weights: { cycle: number; market: number; events: number };
  hint: string;
  detail: string;
}

const EVENT_HALF_LIFE_DAYS = 120;
const EVENT_WINDOW_DAYS = 365;

function parseEventDate(raw: string): Date | null {
  const s = raw.trim();
  if (!s || s === '持续') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T12:00:00');
  const ym = s.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 15);
  const y = s.match(/^(\d{4})$/);
  if (y) return new Date(Number(y[1]), 6, 1);
  return null;
}

function eventScore(signal: 'bullish' | 'neutral' | 'caution'): number {
  if (signal === 'bullish') return 1;
  if (signal === 'caution') return -0.6;
  return 0.15;
}

/**
 * 根据层内「大事件 + 趋势研判」按时间衰减加权。
 * 越近的事件/趋势权重越高，利好加分、谨慎减分。
 */
export function getEventHeat(layer: LayerConfig, now = new Date()): number {
  const nowMs = now.getTime();
  let weighted = 0;
  let weightSum = 0;

  for (const e of layer.events) {
    const d = parseEventDate(e.date);
    if (!d) continue;
    const ageDays = (nowMs - d.getTime()) / 86_400_000;
    if (ageDays < 0 || ageDays > EVENT_WINDOW_DAYS) continue;
    const w = Math.exp(-ageDays / EVENT_HALF_LIFE_DAYS);
    weighted += w * 0.85;
    weightSum += w;
  }

  for (const t of layer.trends) {
    weighted += eventScore(t.signal) * 0.35;
    weightSum += 0.35;
  }

  if (weightSum <= 0) return 50;
  const raw = weighted / weightSum;
  return Math.round(Math.min(100, Math.max(0, 50 + raw * 35)));
}

/**
 * 候选股当日涨跌均值映射为 0–100（50 为中性）。
 * 反映市场资金对该层的即时「热度」。
 */
export function getMarketHeat(
  quotes: { changePercent: number }[],
): number | null {
  if (!quotes.length) return null;
  const avg =
    quotes.reduce((s, q) => s + (Number.isFinite(q.changePercent) ? q.changePercent : 0), 0) /
    quotes.length;
  const greenRatio =
    quotes.filter((q) => q.changePercent > 0).length / quotes.length;
  const momentum = avg * 6 + (greenRatio - 0.5) * 25;
  return Math.round(Math.min(100, Math.max(0, 50 + momentum)));
}

export function computeDynamicHeat(
  layer: LayerConfig,
  options: {
    cycle: LayerHeatPeriod;
    marketQuotes?: { changePercent: number }[];
    now?: Date;
  },
): DynamicHeatResult {
  const now = options.now ?? new Date();
  const cycle = getHeatProgress(options.cycle, now);
  const cycleScore = cycle.percent;
  const eventScore = getEventHeat(layer, now);
  const marketScore = options.marketQuotes
    ? getMarketHeat(options.marketQuotes)
    : null;

  let wCycle = 0.25;
  let wMarket = 0.45;
  let wEvents = 0.3;

  if (marketScore == null) {
    wCycle = 0.35;
    wMarket = 0;
    wEvents = 0.65;
  }

  const blended =
    marketScore == null
      ? Math.round(cycleScore * wCycle + eventScore * wEvents)
      : Math.round(
          cycleScore * wCycle + marketScore * wMarket + eventScore * wEvents,
        );

  const percent = Math.min(100, Math.max(0, blended));

  const hint =
    marketScore == null
      ? `综合 ${percent}%（周期 ${cycleScore}% + 事件 ${eventScore}%）`
      : `综合 ${percent}%（行情 ${marketScore}% · 事件 ${eventScore}% · 周期 ${cycleScore}%）`;

  const detail =
    marketScore == null
      ? `周期进度=已过天数/总天数；事件分=近 ${EVENT_WINDOW_DAYS} 天内大事件时间衰减 + 趋势信号。行情加载后纳入实时涨跌。`
      : `行情分=候选股今日涨跌均值与上涨家数比例；事件分=近期大事件+趋势；周期分=配置的热度起止日期。`;

  return {
    percent,
    ratio: percent / 100,
    cycle,
    market: marketScore,
    events: eventScore,
    parts: { cycle: cycleScore, market: marketScore, events: eventScore },
    weights: { cycle: wCycle, market: wMarket, events: wEvents },
    hint,
    detail,
  };
}
