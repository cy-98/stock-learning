import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LayerConfig } from '../config/layers';
import { HOME_LAYER_QUICK_TABS } from '../config/layerTabs';
import { computeDynamicHeat } from '../utils/dynamicHeat';
import { getLayerAccent } from '../utils/layerTheme';
import { LayerPicksPanel } from './LayerPicksPanel';
import type { LayerEvent } from '../config/layers';

interface Props {
  layer: LayerConfig;
  events: LayerEvent[];
  marketQuotes?: { changePercent: number }[];
  marketLoading?: boolean;
  richCount?: number;
  feedUpdated?: string | null;
  defaultOpen?: boolean;
}

export function HomeLayerSection({
  layer,
  events,
  marketQuotes,
  marketLoading,
  richCount,
  feedUpdated,
  defaultOpen = false,
}: Props) {
  const accent = getLayerAccent(layer.id);
  const heat = computeDynamicHeat(layer, { cycle: layer.heatPeriod, marketQuotes });
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    el.open = defaultOpen;
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <details
      ref={detailsRef}
      className={`glass-card group overflow-hidden ${accent.border} border-l-4`}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden min-h-[3.25rem]">
        <div className="relative flex items-center gap-3 p-4 lg:p-5">
          <div
            className={`absolute inset-y-0 left-0 ${accent.progress} opacity-40 transition-[width] duration-500`}
            style={{ width: `${heat.percent}%` }}
            aria-hidden
          />
          <span className="relative z-10 text-2xl" aria-hidden>
            {layer.icon}
          </span>
          <div className="relative z-10 min-w-0 flex-1">
            <div className={`badge badge-sm ${accent.badge} badge-outline`}>
              L{layer.id} · {layer.short}
            </div>
            <h3 className="mt-1 text-base font-semibold">{layer.name}</h3>
            <p className="truncate text-xs text-muted">{layer.tagline}</p>
          </div>
          <div className="relative z-10 flex shrink-0 flex-col items-end gap-1">
            {marketLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <span className="font-mono text-sm font-semibold tabular-nums text-muted">
                热度 {heat.percent}%
              </span>
            )}
            <span className="ui-sans text-xs text-faint group-open:rotate-180 transition-transform">
              展开 ▾
            </span>
          </div>
        </div>
      </summary>

      <div className="border-t border-[var(--app-border)] px-4 pb-5 pt-2 lg:px-5">
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted">{layer.summary}</p>
        {(richCount != null && richCount > 0) || feedUpdated ? (
          <p className="ui-sans mb-3 text-xs text-faint">
            {richCount != null && richCount > 0 && (
              <span className="text-warning">偏贵 {richCount} 只</span>
            )}
            {richCount != null && richCount > 0 && feedUpdated && ' · '}
            {feedUpdated && <span>时事 {feedUpdated}</span>}
          </p>
        ) : null}

        <Link
          to={`/layer/${layer.id}?tab=picks`}
          className="btn btn-primary btn-md mb-4 w-full lg:btn-sm"
        >
          查看本层完整分析
        </Link>

        {open && (
          <LayerPicksPanel
            layerId={layer.id}
            events={events}
            feedUpdated={feedUpdated ?? null}
            enabled={open}
            variant="preview"
          />
        )}

        <div className="ui-sans mobile-chip-scroll mt-4 lg:flex lg:flex-wrap lg:gap-2">
          {HOME_LAYER_QUICK_TABS.map((t) => (
            <Link
              key={t.tab}
              to={`/layer/${layer.id}?tab=${t.tab}`}
              className="btn btn-outline btn-sm min-h-11 lg:min-h-0"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
