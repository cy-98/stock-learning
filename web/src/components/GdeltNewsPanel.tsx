import { useCallback, useEffect, useState } from 'react';
import { getLayerGdelt } from '../config/layerGdelt';
import {
  fetchGdeltArticles,
  formatGdeltSeen,
  type GdeltFetchResult,
} from '../services/gdelt';

interface Props {
  layerId: number;
  /** 仅在该 Tab 可见时拉取，减少无效请求 */
  active: boolean;
}

export function GdeltNewsPanel({ layerId, active }: Props) {
  const cfg = getLayerGdelt(layerId);
  const [data, setData] = useState<GdeltFetchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      if (!cfg) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchGdeltArticles(cfg, { force });
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    },
    [cfg],
  );

  useEffect(() => {
    if (!active || !cfg) return;
    load(false);
  }, [active, cfg, load]);

  if (!cfg) {
    return (
      <p className="text-xs text-base-content/50">该层暂未配置 GDELT 检索关键词。</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-outline badge-sm">GDELT 实时</span>
        {data?.fromCache && (
          <span className="text-xs text-base-content/45">缓存 10 分钟内有效</span>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          disabled={loading}
          onClick={() => load(true)}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              拉取中…
            </>
          ) : (
            '刷新新闻'
          )}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-base-content/55">
        数据来自{' '}
        <a
          href="https://www.gdeltproject.org/"
          className="link link-primary"
          target="_blank"
          rel="noreferrer"
        >
          GDELT
        </a>{' '}
        DOC 2.0 全球新闻索引（近 {cfg.timespan}）。公开接口约 5 秒/次，仅供学习，请点开原文核实。
      </p>

      <details className="text-xs text-base-content/45">
        <summary className="cursor-pointer">当前检索式</summary>
        <code className="mt-1 block break-all rounded bg-base-200 p-2">{cfg.query}</code>
      </details>

      {error && (
        <div role="alert" className="alert alert-warning alert-soft text-sm">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && data.articles.length === 0 && (
        <div role="alert" className="alert alert-ghost text-sm">
          <span>未检索到相关报道，可稍后刷新或调整关键词。</span>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {(data?.articles ?? []).map((a) => (
          <li key={a.url}>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer noopener"
              className="card card-border bg-base-100 shadow-sm transition hover:border-primary/30"
            >
              <div className="card-body flex-row gap-3 p-3">
                {a.socialimage ? (
                  <img
                    src={a.socialimage}
                    alt=""
                    className="size-14 shrink-0 rounded object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded bg-base-200 text-xs text-base-content/40">
                    NEWS
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-sm font-medium leading-snug">{a.title}</h4>
                  <p className="mt-1 text-xs text-base-content/50">
                    {formatGdeltSeen(a.seendate)} · {a.domain}
                    {a.sourcecountry ? ` · ${a.sourcecountry}` : ''}
                    {a.language ? ` · ${a.language}` : ''}
                  </p>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {data && !loading && (
        <p className="text-center text-xs text-base-content/40">
          共 {data.articles.length} 条 · 拉取于{' '}
          {new Date(data.fetchedAt).toLocaleString('zh-CN')}
        </p>
      )}
    </div>
  );
}
