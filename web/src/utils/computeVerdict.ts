import type { ValuationRecord, ValuationSnapshot, ValuationVerdict } from '../types/valuation';

export function computeVerdict(
  price: number,
  record: ValuationRecord,
): ValuationSnapshot {
  const fairMid = (record.fairLow + record.fairHigh) / 2;
  let verdict: ValuationVerdict = 'unknown';
  let deviationPct: number | null = null;

  if (price > 0 && fairMid > 0) {
    deviationPct = ((price - fairMid) / fairMid) * 100;
    if (record.expensiveAbove != null && price > record.expensiveAbove) {
      verdict = 'extreme';
    } else if (price < record.fairLow) {
      verdict = 'cheap';
    } else if (price > record.fairHigh) {
      verdict = 'rich';
    } else {
      verdict = 'fair';
    }
  }

  return {
    verdict,
    deviationPct,
    fairMid,
    fairLow: record.fairLow,
    fairHigh: record.fairHigh,
    expensiveAbove: record.expensiveAbove,
    record,
  };
}

export function verdictLabel(verdict: ValuationVerdict): string {
  switch (verdict) {
    case 'cheap':
      return '偏便宜';
    case 'fair':
      return '合理';
    case 'rich':
      return '偏贵';
    case 'extreme':
      return '极端偏贵';
    default:
      return '待录入';
  }
}

export function verdictBadgeClass(verdict: ValuationVerdict): string {
  switch (verdict) {
    case 'cheap':
      return 'badge-success';
    case 'fair':
      return 'badge-info';
    case 'rich':
      return 'badge-warning';
    case 'extreme':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
}
