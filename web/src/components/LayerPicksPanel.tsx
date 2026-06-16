import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LayerEvent } from '../config/layers';
import {
  enrichInsightPicks,
  enrichShisoLeaf,
  fetchLayerInsights,
  type EnrichedInsightPick,
  type EnrichedShisoLeaf,
} from '../services/insights';
import { ShisoLeafPanel } from './ShisoLeafPanel';
import { fetchValuations } from '../services/valuation';
import { RecommendedPickCard } from './RecommendedPickCard';

interface Props {
  layerId: number;
  events: LayerEvent[];
  feedUpdated: string | null;
  enabled?: boolean;
  variant?: 'full' | 'preview';
}

export function LayerPicksPanel({
  layerId,
  events,
  feedUpdated,
  enabled = true,
  variant = 'full',
}: Props) {
  const isPreview = variant === 'preview';
  const [summary, setSummary] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [updated, setUpdated] = useState<string>('');
  const [picks, setPicks] = useState<EnrichedInsightPick[]>([]);
  const [shisoLeaf, setShisoLeaf] = useState<EnrichedShisoLeaf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

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
        const [enriched, shiso] = await Promise.all([
          enrichInsightPicks(doc.picks, events, stocks),
          enrichShisoLeaf(doc.shisoLeaf),
        ]);
        if (!cancelled) {
          setPicks(enriched);
          setShisoLeaf(shiso);
        }
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
  }, [layerId, events, enabled]);

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="加载荐股">
        <div className="skeleton min-h-28 w-full rounded-box" />
        <div className="skeleton min-h-28 w-full rounded-box" />
        <p className="ui-sans text-center text-xs text-muted">加载 AI 荐股与行情对照…</p>
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

  const visiblePicks = isPreview ? picks.slice(0, 2) : picks;
  const totalCount = picks.length;

  return (
    <div className="flex flex-col gap-4">
      {!isPreview && (
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
      )}

      {shisoLeaf && <ShisoLeafPanel shiso={shisoLeaf} compact={isPreview} />}

      {!isPreview && picks.length > 0 && (
        <h3 className="text-sm font-semibold text-base-content/70">金枪鱼 · 层内荐股</h3>
      )}

      <div className={`grid gap-4 ${isPreview ? '' : 'lg:grid-cols-2'}`}>
        {visiblePicks.map((pick) => (
          <RecommendedPickCard key={pick.code} pick={pick} compact={isPreview} />
        ))}
      </div>

      {isPreview && totalCount > 0 && (
        <Link
          to={`/layer/${layerId}?tab=picks`}
          className="btn btn-ghost btn-md w-full text-primary lg:btn-sm"
        >
          查看全部 {totalCount} 只 →
        </Link>
      )}

      {!isPreview && (
        <p className="text-center text-xs text-base-content/50">
          以上内容来自仓库 YAML，结合实时行情与 valuations 规则锚点；不构成投资建议。
        </p>
      )}
    </div>
  );
}
