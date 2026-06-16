import { Link, useLocation } from 'react-router-dom';
import type { EnrichedShisoLeaf, EnrichedShisoPick } from '../services/insights';

function scarcityText(
  scarcity: EnrichedShisoLeaf['scarcity'],
): { suppliers?: string; leadTime?: string; replaceability?: string } {
  if (typeof scarcity === 'string') {
    return { suppliers: scarcity };
  }
  return scarcity ?? {};
}

function currencySymbol(market: EnrichedShisoPick['market']) {
  return market === '美股' || market === '港股' ? '$' : '¥';
}

function ShisoPickRow({ pick, backTo }: { pick: EnrichedShisoPick; backTo: string }) {
  const sym = currencySymbol(pick.market);
  const { quote } = pick;

  return (
    <div className="glass-inset flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`badge badge-sm ${
              pick.tier === 'primary' ? 'badge-accent' : 'badge-outline'
            }`}
          >
            {pick.tier === 'primary' ? '首选紫苏叶' : '备选'}
          </span>
          <span className="badge badge-ghost badge-sm">{pick.market}</span>
          <Link
            to={`/stock/${pick.code}`}
            state={{ backTo }}
            className="font-semibold hover:text-primary hover:underline"
          >
            {pick.name}
          </Link>
        </div>
        <div className="font-mono text-xs text-base-content/50">{pick.code}</div>
        <p className="mt-1 text-xs leading-relaxed text-base-content/70">{pick.note}</p>
      </div>
      {quote && quote.price > 0 && (
        <div className="shrink-0 text-right font-mono text-sm tabular-nums">
          <span className="font-semibold">
            {sym}
            {quote.price.toFixed(2)}
          </span>
          <span
            className={`ml-1 text-xs ${quote.changePercent >= 0 ? 'text-success' : 'text-error'}`}
          >
            {quote.changePercent >= 0 ? '+' : ''}
            {quote.changePercent.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface Props {
  shiso: EnrichedShisoLeaf;
  compact?: boolean;
}

export function ShisoLeafPanel({ shiso, compact = false }: Props) {
  const location = useLocation();
  const backTo = `${location.pathname}${location.search}`;
  const scarcity = scarcityText(shiso.scarcity);
  const visiblePicks = compact ? shiso.picks.slice(0, 1) : shiso.picks;

  return (
    <section className="glass-card card border border-accent/30 bg-accent/5">
      <div className="card-body gap-3 p-4 lg:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-accent badge-sm">🌿 紫苏叶</span>
          <h3 className="text-base font-semibold">{shiso.title}</h3>
        </div>

        <p className="text-xs leading-relaxed text-base-content/60">
          <span className="font-medium text-base-content/70">金枪鱼对照：</span>
          {shiso.tunaContrast}
        </p>

        <p
          className={`text-sm leading-relaxed text-base-content/75 ${
            compact ? 'line-clamp-3' : 'whitespace-pre-line'
          }`}
        >
          {shiso.description.trim()}
        </p>

        {!compact && (scarcity.suppliers || scarcity.leadTime || scarcity.replaceability) && (
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            {scarcity.suppliers && (
              <div className="glass-inset p-2.5">
                <div className="mb-0.5 font-medium text-base-content/55">供给集中度</div>
                <p className="text-base-content/75">{scarcity.suppliers}</p>
              </div>
            )}
            {scarcity.leadTime && (
              <div className="glass-inset p-2.5">
                <div className="mb-0.5 font-medium text-base-content/55">扩产周期</div>
                <p className="text-base-content/75">{scarcity.leadTime}</p>
              </div>
            )}
            {scarcity.replaceability && (
              <div className="glass-inset p-2.5">
                <div className="mb-0.5 font-medium text-base-content/55">可替代性</div>
                <p className="text-base-content/75">{scarcity.replaceability}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-base-content/55">推荐标的</div>
          {visiblePicks.map((pick) => (
            <ShisoPickRow key={pick.code} pick={pick} backTo={backTo} />
          ))}
        </div>

        {!compact && (
          <p className="text-xs text-base-content/45">
            紫苏叶理论：不追人人盯着的龙头（金枪鱼），专挖不可替代、供给狭窄的隐形瓶颈。
          </p>
        )}
      </div>
    </section>
  );
}
