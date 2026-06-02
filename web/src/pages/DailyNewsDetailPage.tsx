import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { PageShell } from '../components/PageShell';
import {
  fetchDailyNewsCatalog,
  getNewsItemById,
} from '../services/dailyNews';
import type { DailyNewsCatalog } from '../types/dailyNews';
import { getLayerAccent } from '../utils/layerTheme';

export function DailyNewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<DailyNewsCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDailyNewsCatalog()
      .then(({ catalog: c }) => {
        if (!cancelled) setCatalog(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const item = getNewsItemById(catalog, id ? decodeURIComponent(id) : undefined);

  useEffect(() => {
    if (!loading && !item) {
      navigate('/', { replace: true });
    }
  }, [loading, item, navigate]);

  if (loading) {
    return (
      <PageShell title="时事详情" backTo="/">
        <p className="text-sm text-muted">加载中…</p>
      </PageShell>
    );
  }

  if (!item) return null;

  const b = item.beneficiaries ?? {};

  return (
    <PageShell title="时事详情" backTo="/" wide>
      <article className="glass-card card">
        <div className="card-body gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{item.date}</span>
            {item.publishedAt ? <span>· {item.publishedAt}</span> : null}
          </div>

          <h2 className="text-xl font-semibold leading-snug">{item.title}</h2>

          {item.layerIds?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.layerIds.map((layerId) => {
                const layer = LAYERS.find((l) => l.id === layerId);
                const accent = getLayerAccent(layerId);
                return (
                  <Link
                    key={layerId}
                    to={`/layer/${layerId}`}
                    className={`badge badge-sm ${accent.badge} badge-outline`}
                  >
                    {layer?.icon} L{layerId} {layer?.short}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <section>
            <h3 className="mb-2 text-sm font-semibold">主要信息</h3>
            <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">
              {item.summary}
            </p>
          </section>

          {item.sourceUrl ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold">原文链接</h3>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm break-all"
              >
                {item.sourceUrl}
              </a>
            </section>
          ) : null}

          {item.industries?.length ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold">相关行业</h3>
              <div className="flex flex-wrap gap-2">
                {item.industries.map((ind) => (
                  <span key={ind} className="badge badge-ghost badge-sm">
                    {ind}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="glass-inset rounded-lg p-4">
            <h3 className="mb-3 text-sm font-semibold">可能受益方向</h3>
            <p className="mb-3 text-xs text-faint">
              基于五层模型与行业映射的推演，仅供学习，不构成投资建议。
            </p>

            {b.industries?.length ? (
              <div className="mb-4">
                <h4 className="mb-1 text-xs font-medium text-muted">行业</h4>
                <ul className="list-inside list-disc text-sm text-muted">
                  {b.industries.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {b.companies?.length ? (
              <div className="mb-4">
                <h4 className="mb-1 text-xs font-medium text-muted">公司</h4>
                <ul className="list-inside list-disc text-sm text-muted">
                  {b.companies.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {b.stocks?.length ? (
              <div>
                <h4 className="mb-2 text-xs font-medium text-muted">股票</h4>
                <ul className="flex flex-col gap-2">
                  {b.stocks.map((s) => (
                    <li key={s.code}>
                      <Link
                        to={`/stock/${encodeURIComponent(s.code)}`}
                        className="flex flex-wrap items-baseline gap-2 text-sm"
                      >
                        <span className="font-mono text-xs text-faint">{s.code}</span>
                        <span className="font-medium">{s.name}</span>
                      </Link>
                      {s.reason ? (
                        <p className="mt-0.5 pl-0 text-xs text-muted">{s.reason}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!b.industries?.length && !b.companies?.length && !b.stocks?.length && (
              <p className="text-sm text-muted">暂无受益方向标注。</p>
            )}
          </section>
        </div>
      </article>
    </PageShell>
  );
}
