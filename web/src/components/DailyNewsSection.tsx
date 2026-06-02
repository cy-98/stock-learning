import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import {
  fetchDailyNewsCatalog,
  getTodayBundle,
  type DailyNewsStatus,
} from '../services/dailyNews';
import type { DailyNewsCatalog, DailyNewsItem } from '../types/dailyNews';
import { getLayerAccent } from '../utils/layerTheme';

function layerBadges(item: DailyNewsItem) {
  const ids = item.layerIds?.length
    ? item.layerIds
    : [];
  return ids.map((id) => {
    const layer = LAYERS.find((l) => l.id === id);
    const accent = getLayerAccent(id);
    return (
      <span
        key={id}
        className={`badge badge-xs ${accent.badge} badge-outline`}
      >
        {layer ? `${layer.icon} L${id}` : `L${id}`}
      </span>
    );
  });
}

export function DailyNewsSection() {
  const [catalog, setCatalog] = useState<DailyNewsCatalog | null>(null);
  const [status, setStatus] = useState<DailyNewsStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    fetchDailyNewsCatalog().then(({ catalog: c, status: s }) => {
      if (cancelled) return;
      setCatalog(c);
      setStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bundle = getTodayBundle(catalog);
  const today = catalog?.today ?? new Date().toISOString().slice(0, 10);
  const hasNews = (bundle?.items.length ?? 0) > 0;

  return (
    <section className="glass-card card" aria-labelledby="daily-news-heading">
      <div className="card-body gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="daily-news-heading" className="card-title text-lg font-semibold">
              今日要闻
            </h2>
            <p className="text-xs text-muted">
              五层模型相关时事 · {today}
              {bundle?.sourceFiles.length
                ? ` · ${bundle.sourceFiles.length} 个来源文件`
                : null}
            </p>
          </div>
          <Link to="/news" className="btn btn-ghost btn-xs">
            层内大事件 →
          </Link>
        </div>

        {status === 'loading' && (
          <p className="text-sm text-muted">加载今日新闻…</p>
        )}

        {!hasNews && status !== 'loading' && (
          <div className="rounded-lg border border-dashed border-base-300/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-muted">no news today</p>
            <p className="mt-1 text-xs text-faint">
              仓库 <code className="font-mono">news/new-{today}.json</code>{' '}
              尚未生成或为空
            </p>
          </div>
        )}

        {hasNews && bundle && (
          <ul className="flex flex-col gap-2">
            {bundle.items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/news/daily/${encodeURIComponent(item.id)}`}
                  className="glass-inset block rounded-lg p-3 transition hover:border-primary/30"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {layerBadges(item)}
                    {item.industries?.slice(0, 3).map((ind) => (
                      <span key={ind} className="badge badge-ghost badge-xs">
                        {ind}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {item.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
