import { Link } from 'react-router-dom';
import type { LayerConfig } from '../config/layers';
import { computeDynamicHeat } from '../utils/dynamicHeat';
import { getLayerAccent } from '../utils/layerTheme';

interface Props {
  layer: LayerConfig;
  marketQuotes?: { changePercent: number }[];
  marketLoading?: boolean;
  richCount?: number;
  feedUpdated?: string | null;
}

export function LayerHeatCard({
  layer,
  marketQuotes,
  marketLoading,
  richCount,
  feedUpdated,
}: Props) {
  const accent = getLayerAccent(layer.id);
  const heat = computeDynamicHeat(layer, { cycle: layer.heatPeriod, marketQuotes });

  return (
    <Link
      to={`/layer/${layer.id}`}
      className={`card card-border relative overflow-hidden bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md ${accent.border} border-l-4`}
      title={heat.detail}
    >
      <div
        className={`absolute inset-y-0 left-0 ${accent.progress} transition-[width] duration-500`}
        style={{ width: `${heat.percent}%` }}
        aria-hidden
      />
      <div className="card-body relative z-10 flex-row items-center gap-3 p-4">
        <span className="text-2xl" aria-hidden>
          {layer.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className={`badge badge-sm ${accent.badge} badge-outline`}>
            L{layer.id} · {layer.short}
          </div>
          <h3 className="mt-1 truncate font-medium">{layer.name}</h3>
          <p className="truncate text-xs text-base-content/60">{layer.tagline}</p>
          <p
            className="mt-1 line-clamp-2 text-xs text-base-content/50"
            title={heat.detail}
          >
            {marketLoading ? '正在拉取行情热度…' : heat.hint}
          </p>
          {(richCount != null && richCount > 0) || feedUpdated ? (
            <p className="mt-0.5 text-[10px] text-base-content/45">
              {richCount != null && richCount > 0 && (
                <span className="text-warning">偏贵 {richCount} 只</span>
              )}
              {richCount != null && richCount > 0 && feedUpdated && ' · '}
              {feedUpdated && <span>时事 {feedUpdated}</span>}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {marketLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <span className="font-mono text-sm font-semibold tabular-nums text-base-content/70">
              {heat.percent}%
            </span>
          )}
          <span className="text-base-content/40" aria-hidden>
            ›
          </span>
        </div>
      </div>
    </Link>
  );
}
