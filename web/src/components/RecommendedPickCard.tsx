import { Link } from 'react-router-dom';
import type { EnrichedInsightPick } from '../services/insights';
import { horizonLabel } from '../services/insights';
import { FairRangeBar } from './FairRangeBar';
import { ValuationBadge } from './ValuationBadge';
import type { InsightBias } from '../types/insights';

function biasBadge(bias: InsightBias, label: string) {
  const cls =
    bias === 'cheap'
      ? 'badge-success'
      : bias === 'fair'
        ? 'badge-info'
        : bias === 'rich'
          ? 'badge-warning'
          : bias === 'extreme'
            ? 'badge-error'
            : 'badge-ghost';
  return (
    <span className={`badge badge-sm ${cls}`} title={label}>
      {label}
    </span>
  );
}

interface Props {
  pick: EnrichedInsightPick;
}

export function RecommendedPickCard({ pick }: Props) {
  const { quote, valuation, linkedEvents } = pick;

  return (
    <article className="card card-border bg-base-100 shadow-sm">
      <div className="card-body gap-3 p-4 lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral badge-outline font-mono">#{pick.rank}</span>
              <Link
                to={`/stock/${pick.code}`}
                className="truncate text-base font-semibold hover:text-primary hover:underline"
              >
                {pick.name}
              </Link>
            </div>
            <div className="font-mono text-xs text-base-content/50">{pick.code}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {valuation ? (
              <ValuationBadge
                verdict={valuation.verdict}
                deviationPct={valuation.deviationPct}
                compact
              />
            ) : (
              biasBadge(pick.priceBias, '规则锚点待录入')
            )}
            {quote && quote.price > 0 && (
              <span className="font-mono text-sm font-semibold tabular-nums">
                ¥{quote.price.toFixed(2)}
                <span
                  className={`ml-1 text-xs ${
                    quote.changePercent >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {quote.changePercent >= 0 ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%
                </span>
              </span>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-base-content/75">{pick.aiSummary}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-base-200 bg-base-200/30 p-3">
            <div className="mb-1 text-xs font-medium text-base-content/55">短期 · 股价判断</div>
            {biasBadge(pick.shortTerm.bias, pick.shortTerm.label)}
            <p className="mt-1 text-xs text-base-content/70">{pick.shortTerm.note}</p>
          </div>
          <div className="rounded-lg border border-base-200 bg-base-200/30 p-3">
            <div className="mb-1 text-xs font-medium text-base-content/55">长期 · 股价判断</div>
            {biasBadge(pick.longTerm.bias, pick.longTerm.label)}
            <p className="mt-1 text-xs text-base-content/70">{pick.longTerm.note}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge badge-outline">持有 {pick.holdPeriod}</span>
          <span className="badge badge-outline badge-primary">
            预期收益 {pick.expectedReturnPct}
          </span>
          <span className="badge badge-ghost">{horizonLabel(pick.horizon)}视角</span>
        </div>

        {valuation && quote && quote.price > 0 && (
          <FairRangeBar price={quote.price} snapshot={valuation} />
        )}

        {linkedEvents.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-medium text-base-content/55">关联时事</div>
            <ul className="flex flex-col gap-1.5">
              {linkedEvents.map((e) => (
                <li
                  key={e.title}
                  className="rounded-md border border-base-200 px-2 py-1.5 text-xs"
                >
                  <span className="font-medium text-base-content/60">{e.date}</span>
                  <span className="mx-1">·</span>
                  <span className="font-medium">{e.title}</span>
                  <p className="mt-0.5 text-base-content/65">{e.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
