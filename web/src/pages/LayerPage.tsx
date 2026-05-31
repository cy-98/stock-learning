import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLayerById, type LayerTab } from '../config/layers';
import { fetchLayerTopStocks } from '../services/stock';
import { fetchValuations, enrichRankedStocks } from '../services/valuation';
import type { RankedStockWithValuation } from '../components/StockRankPanel';
import { useLayerEventsAndTrends } from '../hooks/useLayerFeed';
import { PageShell } from '../components/PageShell';
import { GdeltNewsPanel } from '../components/GdeltNewsPanel';
import { LayerPicksPanel } from '../components/LayerPicksPanel';
import { StockRankPanel } from '../components/StockRankPanel';
import { getLayerAccent, trendBadge } from '../utils/layerTheme';

const TABS: { id: LayerTab; label: string }[] = [
  { id: 'picks', label: 'AI 荐股' },
  { id: 'stocks', label: '龙头榜单' },
  { id: 'industry', label: '行业' },
  { id: 'trends', label: '趋势' },
  { id: 'events', label: '大事件' },
  { id: 'analysis', label: '投资分析' },
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="glass-card card">
      <div className="card-body gap-3 p-4">
        <h3 className="text-sm font-semibold text-base-content/80">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FeedMeta({
  isDynamic,
  updated,
  source,
  loading,
  onRefresh,
}: {
  isDynamic: boolean;
  updated: string | null;
  source: string | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className={`badge badge-sm ${isDynamic ? 'badge-primary' : 'badge-ghost'}`}>
        {isDynamic ? '动态加载' : '内置兜底'}
      </span>
      {updated && <span className="text-xs text-base-content/55">更新 {updated}</span>}
      {source && <span className="text-xs text-base-content/45">来源 {source}</span>}
      <button type="button" className="btn btn-ghost btn-xs" disabled={loading} onClick={onRefresh}>
        {loading ? '刷新中…' : '刷新动态数据'}
      </button>
    </div>
  );
}

export function LayerPage() {
  const { id } = useParams();
  const layerId = Number(id);
  const layer = getLayerById(layerId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as LayerTab) || 'picks';

  const [cnStocks, setCnStocks] = useState<RankedStockWithValuation[]>([]);
  const [globalStocks, setGlobalStocks] = useState<RankedStockWithValuation[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    events,
    trends,
    isDynamic,
    feedUpdated,
    feedSource,
    feedStatus,
    refreshFeed,
  } = useLayerEventsAndTrends(layerId, {
    events: layer?.events ?? [],
    trends: layer?.trends ?? [],
  });

  useEffect(() => {
    if (!layer) navigate('/', { replace: true });
  }, [layer, navigate]);

  useEffect(() => {
    if (!layer || tab !== 'stocks') return;

    let cancelled = false;
    setLoading(true);
    setStockError(null);

    Promise.all([fetchLayerTopStocks(layer.stocks.cn, layer.stocks.global, 5), fetchValuations()])
      .then(([{ cn, global }, { stocks: valMap }]) => {
        if (cancelled) return;
        setCnStocks(enrichRankedStocks(cn, valMap));
        setGlobalStocks(enrichRankedStocks(global, valMap));
        if (cn.length === 0 && global.length === 0) {
          setStockError('行情接口暂不可用，请稍后刷新或切换网络后重试');
        }
      })
      .catch((e) => {
        if (!cancelled) setStockError(e instanceof Error ? e.message : '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [layer, tab, refreshKey]);

  if (!layer) return null;

  const setTab = (t: LayerTab) => setSearchParams({ tab: t });
  const analysis = layer.analysis;
  const accent = getLayerAccent(layer.id);

  return (
    <PageShell
      title={`L${layer.id} ${layer.short}`}
      backTo="/"
      badge={
        <span className={`badge badge-sm ${accent.badge} badge-outline`}>
          {layer.icon}
        </span>
      }
    >
      <div
        className={`glass-card card ${accent.border} border-l-4`}
      >
        <div className="card-body gap-2 p-5">
          <div className={`badge ${accent.badge} badge-outline w-fit`}>
            {layer.name}
          </div>
          <p className="text-sm leading-relaxed text-base-content/75">{layer.summary}</p>
          <p className="text-xs text-base-content/50">{layer.tagline}</p>
        </div>
      </div>

      <div
        role="tablist"
        className="layer-tablist tabs tabs-boxed tabs-sm lg:tabs-md"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab shrink-0 ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'picks' && (
        <LayerPicksPanel
          layerId={layer.id}
          events={events}
          feedUpdated={feedUpdated}
        />
      )}

      {tab === 'stocks' && (
        <div className="stocks-dual-panel">
          <button
            type="button"
            className="btn btn-outline btn-sm w-full"
            disabled={loading}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                刷新中…
              </>
            ) : (
              '刷新行情'
            )}
          </button>
          <StockRankPanel
            title="国内 A 股 Top5"
            flag="🇨🇳"
            stocks={cnStocks}
            loading={loading}
            error={stockError}
          />
          <StockRankPanel
            title="海外 Top5"
            flag="🌍"
            stocks={globalStocks}
            loading={loading}
            error={globalStocks.length ? null : stockError}
          />
        </div>
      )}

      {tab === 'industry' && (
        <div className="flex flex-col gap-3">
          <SectionCard title="行业概览">
            <p className="text-sm leading-relaxed text-base-content/75">
              {layer.industry.overview}
            </p>
          </SectionCard>

          <SectionCard title="细分赛道">
            <ul className="flex flex-col gap-3">
              {layer.industry.segments.map((s) => (
                <li
                  key={s.name}
                  className="border-b border-base-200 pb-3 last:border-0 last:pb-0"
                >
                  <div className="font-medium">{s.name}</div>
                  <p className="mt-0.5 text-sm text-base-content/70">{s.desc}</p>
                  {s.players && (
                    <p className="mt-1 text-xs text-base-content/50">代表：{s.players}</p>
                  )}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="关键数据">
            <div className="stats stats-vertical w-full bg-transparent shadow-none">
              {layer.industry.metrics.map((m) => (
                <div key={m.label} className="stat px-0 py-2">
                  <div className="stat-title text-xs">{m.label}</div>
                  <div className="stat-value text-lg">{m.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'trends' && (
        <SectionCard title="趋势研判">
          <FeedMeta
            isDynamic={isDynamic}
            updated={feedUpdated}
            source={feedSource}
            loading={feedStatus === 'loading'}
            onRefresh={refreshFeed}
          />
          <ul className="flex flex-col gap-3">
            {trends.map((t) => (
              <li key={t.title} className="flex gap-3 border-b border-base-200 pb-3 last:border-0">
                <span className={`badge badge-sm shrink-0 ${trendBadge(t.signal)}`}>
                  {t.signal === 'bullish' ? '利多' : t.signal === 'caution' ? '谨慎' : '中性'}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">{t.title}</h4>
                  <p className="mt-0.5 text-sm text-base-content/70">{t.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {tab === 'events' && (
        <SectionCard title="时间线">
          <FeedMeta
            isDynamic={isDynamic}
            updated={feedUpdated}
            source={feedSource}
            loading={feedStatus === 'loading'}
            onRefresh={refreshFeed}
          />
          <p className="mb-3 text-xs text-base-content/55">
            大事件数据来自仓库 web/public/data/layer-feed.json，可由 docs/data/layers.json 同步。
            修改 JSON 后推送并部署即可更新。
          </p>
          <ul className="timeline timeline-vertical timeline-compact -ml-2">
            {events.map((e) => (
              <li key={e.title + e.date}>
                <div className="timeline-start text-xs font-medium text-base-content/55">
                  {e.date}
                </div>
                <div className="timeline-middle">
                  <span className="size-2 rounded-full bg-primary" />
                </div>
                <div className="timeline-end timeline-box mb-3 text-sm shadow-sm">
                  <h4 className="font-medium">{e.title}</h4>
                  <p className="mt-1 text-base-content/70">{e.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="divider text-xs text-base-content/40">GDELT 全球新闻</div>
          <GdeltNewsPanel layerId={layer.id} active={tab === 'events'} />
        </SectionCard>
      )}

      {tab === 'analysis' && (
        <div className="flex flex-col gap-3">
          <div className="glass-card alert alert-info alert-soft text-sm">
            <span>
              合理价区间案例见仓库{' '}
              <a
                href="https://github.com/cy-98/stock-learning/blob/main/section-3.md"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                section-3.md
              </a>
              ；龙头榜单 Tab 可对比现价与估值灯。
            </span>
          </div>
          <SectionCard title="Section 1 · 本层定位">
            <p className="text-sm leading-relaxed text-base-content/75">{analysis.role}</p>
          </SectionCard>

          <SectionCard title="分析链（自上而下）">
            <ol className="steps steps-vertical w-full text-sm">
              {analysis.chain.map((c) => (
                <li key={c.step} className="step step-primary">
                  <div>
                    <span className="font-medium">{c.step}</span>
                    <p className="mt-0.5 text-base-content/65">{c.question}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="五项核心技能">
            <div className="flex flex-col gap-2">
              {analysis.skills.map((s) => (
                <div
                  key={s.id}
                  className="collapse collapse-arrow glass-inset"
                >
                  <input type="checkbox" defaultChecked={s.id === 'market'} />
                  <div className="collapse-title min-h-0 py-3 text-sm font-medium">
                    {s.title}
                    <p className="mt-0.5 text-xs font-normal text-base-content/55">
                      {s.intro}
                    </p>
                  </div>
                  <div className="collapse-content">
                    <ul className="list-inside list-disc space-y-1 text-sm text-base-content/75">
                      {s.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="估值与持有周期">
            <div className="flex flex-col gap-3">
              {analysis.valuation.methods.map((m) => (
                <div key={m.method} className="border-b border-base-200 pb-3 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{m.method}</span>
                    <span className="badge badge-ghost badge-xs">{m.scene}</span>
                  </div>
                  <p className="mt-1 text-sm text-base-content/70">{m.tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="glass-inset p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  长期持有
                </h4>
                <p className="mt-1 text-sm text-base-content/75">
                  {analysis.valuation.longHold}
                </p>
              </div>
              <div className="glass-inset p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  短期参与
                </h4>
                <p className="mt-1 text-sm text-base-content/75">
                  {analysis.valuation.shortHold}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="投资备忘录清单">
            <ol className="list-inside list-decimal space-y-1 text-sm text-base-content/75">
              {analysis.memoPrompts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="证伪条件">
            <ul className="list-inside list-disc space-y-1 text-sm text-base-content/75">
              {analysis.falsification.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="常见误区">
            <div className="flex flex-col gap-2">
              {analysis.pitfalls.map((p) => (
                <div key={p.wrong} className="flex flex-col gap-1">
                  <div className="alert alert-error alert-soft py-2 text-xs">
                    <span>✗ {p.wrong}</span>
                  </div>
                  <div className="alert alert-success alert-soft py-2 text-xs">
                    <span>✓ {p.right}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="信息源">
            <ol className="list-inside list-decimal space-y-1 text-sm text-base-content/75">
              {analysis.dataSources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </SectionCard>
        </div>
      )}

      <p className="text-center text-xs leading-relaxed text-base-content/45">
        方法论来自 section-1.md；行情来自 stock-sdk。仅供学习，不构成投资建议。
      </p>
    </PageShell>
  );
}
