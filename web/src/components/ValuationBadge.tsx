import type { ValuationVerdict } from '../types/valuation';
import { verdictBadgeClass, verdictLabel } from '../utils/computeVerdict';

interface Props {
  verdict: ValuationVerdict;
  deviationPct?: number | null;
  compact?: boolean;
}

export function ValuationBadge({ verdict, deviationPct, compact }: Props) {
  const label = verdictLabel(verdict);
  const dev =
    deviationPct != null && Number.isFinite(deviationPct)
      ? `${deviationPct >= 0 ? '+' : ''}${deviationPct.toFixed(1)}%`
      : null;

  return (
    <span className={`badge badge-sm ${verdictBadgeClass(verdict)}`}>
      {compact ? label : `${label}${dev ? ` · ${dev}` : ''}`}
    </span>
  );
}
