import { useEffect, useState } from 'react';
import type { LayerEvent } from '../config/layers';
import {
  enrichInsightPicks,
  fetchLayerInsights,
  type EnrichedInsightPick,
} from '../services/insights';
import { fetchValuations } from '../services/valuation';
import { RecommendedPickCard } from './RecommendedPickCard';

interface Props {
  layerId: number;
  events: LayerEvent[];
  feedUpdated: string | null;
}

export function LayerPicksPanel({ layerId, events, feedUpdated }: Props) {
  const [summary, setSummary] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [updated, setUpdated] = useState<string>('');
  const [picks, setPicks] = useState<EnrichedInsightPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchLayerInsights(layerId), fetchValuations()])
      .then(async ([doc, { stocks }]) => {
        if (cancelled) return;
        if (!doc) {
          setError('暂无本层 AI 荐股数据（insights/layer-*.yaml）');
          setPicks([]);
          return;
        }
        setSummary(doc.summary.trim());
        setSource(doc.source);
        setUpdated(doc.updated);
        const enriched = await enrichInsightPicks(doc.picks, events, stocks);
        if (!cancelled) setPicks(enriched);
      })
      .catch(() => {
        if (!cancelled) setError('加载荐股分析失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [layerId, events]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-base-content/60">
        <span className="loading loading-spinner loading-sm" />
        加载 AI 荐股与行情对照…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-warning text-sm">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card card">
        <div className="card-body gap-2 p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
            <span className="badge badge-primary badge-sm">AI 分析</span>
            {updated && <span>insights 更新 {updated}</span>}
            {feedUpdated && <span>时事 {feedUpdated}</span>}
            {source && <span className="text-base-content/45">· {source}</span>}
          </div>
          <p className="text-sm leading-relaxed text-base-content/75 whitespace-pre-line">
            {summary}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {picks.map((pick) => (
          <RecommendedPickCard key={pick.code} pick={pick} />
        ))}
      </div>

      <p className="text-center text-xs text-base-content/50">
        以上内容来自仓库 YAML，结合实时行情与 valuations 规则锚点；不构成投资建议。
      </p>
    </div>
  );
}
