import { Link } from 'react-router-dom';
import type { LayerConfig } from '../config/layers';
import { formatHeatHint, getHeatProgress } from '../utils/heatProgress';
import { getLayerAccent } from '../utils/layerTheme';

interface Props {
  layer: LayerConfig;
}

export function LayerHeatCard({ layer }: Props) {
  const accent = getLayerAccent(layer.id);
  const heat = getHeatProgress(layer.heatPeriod);

  return (
    <Link
      to={`/layer/${layer.id}`}
      className={`card card-border relative overflow-hidden bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md ${accent.border} border-l-4`}
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
          <p className="mt-1 text-xs text-base-content/50" title={`${layer.heatPeriod.start} → ${layer.heatPeriod.end}`}>
            {formatHeatHint(heat)}
            {layer.heatPeriod.label ? ` · ${layer.heatPeriod.label}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="font-mono text-sm font-semibold tabular-nums text-base-content/70">
            {heat.percent}%
          </span>
          <span className="text-base-content/40" aria-hidden>
            ›
          </span>
        </div>
      </div>
    </Link>
  );
}
