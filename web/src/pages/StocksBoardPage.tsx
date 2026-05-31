import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { PageShell } from '../components/PageShell';
import { RecommendedPickCard } from '../components/RecommendedPickCard';
import { useLayerFeed } from '../hooks/useLayerFeed';
import {
  enrichInsightPicks,
  fetchLayerInsights,
  type EnrichedInsightPick,
} from '../services/insights';
import { fetchValuations } from '../services/valuation';
import { getLayerAccent } from '../utils/layerTheme';
import type { LayerConfig } from '../config/layers';

export function StocksBoardPage() {
  const feed = useLayerFeed();
  const [byLayer, setByLayer] = useState<Record<number, EnrichedInsightPick[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchValuations()
      .then(async ({ stocks }) => {
        const rows = await Promise.all(
          LAYERS.map(async (layer) => {
            const doc = await fetchLayerInsights(layer.id);
            if (!doc?.picks.length) return { id: layer.id, picks: [] as EnrichedInsightPick[] };
            const events =
              feed.status === 'live' && feed.getEvents(layer.id).length
                ? feed.getEvents(layer.id)
                : layer.events;
            const picks = await enrichInsightPicks(doc.picks, events, stocks);
            return { id: layer.id, picks };
          }),
        );
        if (cancelled) return;
        const map: Record<number, EnrichedInsightPick[]> = {};
        for (const r of rows) map[r.id] = r.picks;
        setByLayer(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feed]);

  return (
    <PageShell title="股票看板" wide>
      <div className="glass-card card">
        <div className="card-body gap-2 p-5">
          <h2 className="text-lg font-semibold">五层 AI 荐股一览</h2>
          <p className="text-sm leading-relaxed text-muted">
            数据来自 <code className="font-mono text-xs">insights/layer-*.yaml</code>，
            对照实时行情与合理价锚点。点击个股进入详情。
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="loading loading-spinner loading-sm" />
          加载各层荐股…
        </div>
      )}

      <div className="flex flex-col gap-6">
        {LAYERS.map((layer) => (
          <LayerBoardBlock
            key={layer.id}
            layer={layer}
            picks={byLayer[layer.id] ?? []}
            loading={loading}
          />
        ))}
      </div>
    </PageShell>
  );
}

function LayerBoardBlock({
  layer,
  picks,
  loading,
}: {
  layer: LayerConfig;
  picks: EnrichedInsightPick[];
  loading: boolean;
}) {
  const accent = getLayerAccent(layer.id);

  return (
    <section className={`glass-card card ${accent.border} border-l-4`}>
      <div className="card-body gap-3 p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Link
              to={`/layer/${layer.id}?tab=picks`}
              className="text-base font-semibold hover:text-[var(--app-accent)]"
            >
              {layer.icon} L{layer.id} {layer.short}
            </Link>
            <p className="text-xs text-muted">{layer.name}</p>
          </div>
          <Link to={`/?layer=${layer.id}`} className="btn btn-ghost btn-xs ui-sans">
            在首页展开
          </Link>
        </div>

        {!loading && picks.length === 0 && (
          <p className="text-sm text-muted">本层暂无 insights 荐股数据。</p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {picks.map((pick) => (
            <RecommendedPickCard key={pick.code} pick={pick} />
          ))}
        </div>
      </div>
    </section>
  );
}
