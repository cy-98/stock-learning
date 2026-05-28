/** 单层「热度周期」进度：分子=已过天数，分母=周期总天数 */

export interface LayerHeatPeriod {
  /** 热度周期开始（含），ISO 日期 YYYY-MM-DD */
  start: string;
  /** 热度周期结束（含），ISO 日期 YYYY-MM-DD */
  end: string;
  /** 可选说明，展示在卡片上 */
  label?: string;
}

export interface HeatProgressResult {
  /** 0–1，已 clamp */
  ratio: number;
  percent: number;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  phase: 'upcoming' | 'active' | 'ended';
  endDate: string;
  startDate: string;
}

function parseDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

const DAY_MS = 86_400_000;

export function getHeatProgress(
  period: LayerHeatPeriod,
  now: Date = new Date(),
): HeatProgressResult {
  const startMs = parseDay(period.start);
  const endMs = parseDay(period.end) + DAY_MS - 1;
  const nowMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const daysTotal = Math.max(1, Math.round((endMs - startMs) / DAY_MS) + 1);

  if (nowMs < startMs) {
    return {
      ratio: 0,
      percent: 0,
      daysElapsed: 0,
      daysTotal,
      daysRemaining: daysTotal,
      phase: 'upcoming',
      endDate: period.end,
      startDate: period.start,
    };
  }

  if (nowMs > endMs) {
    return {
      ratio: 1,
      percent: 100,
      daysElapsed: daysTotal,
      daysTotal,
      daysRemaining: 0,
      phase: 'ended',
      endDate: period.end,
      startDate: period.start,
    };
  }

  const daysElapsed = Math.round((nowMs - startMs) / DAY_MS) + 1;
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const ratio = Math.min(1, Math.max(0, daysElapsed / daysTotal));

  return {
    ratio,
    percent: Math.round(ratio * 100),
    daysElapsed,
    daysTotal,
    daysRemaining,
    phase: 'active',
    endDate: period.end,
    startDate: period.start,
  };
}

export function formatHeatHint(p: HeatProgressResult): string {
  if (p.phase === 'upcoming') return `热度未开始 · 至 ${p.endDate}`;
  if (p.phase === 'ended') return `热度周期已结束（${p.endDate}）`;
  return `热度 ${p.percent}% · 剩余 ${p.daysRemaining} 天`;
}
