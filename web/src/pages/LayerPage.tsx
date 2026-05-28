import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLayerById, type LayerTab } from '../config/layers';
import { fetchLayerTopStocks, type RankedStock } from '../services/stock';
import { StockRankPanel } from '../components/StockRankPanel';

const TABS: { id: LayerTab; label: string }[] = [
  { id: 'stocks', label: '龙头榜单' },
  { id: 'industry', label: '行业分析' },
  { id: 'trends', label: '趋势分析' },
  { id: 'events', label: '大事件' },
];

export function LayerPage() {
  const { id } = useParams();
  const layerId = Number(id);
  const layer = getLayerById(layerId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as LayerTab) || 'stocks';

  const [cnStocks, setCnStocks] = useState<RankedStock[]>([]);
  const [globalStocks, setGlobalStocks] = useState<RankedStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!layer) navigate('/', { replace: true });
  }, [layer, navigate]);

  useEffect(() => {
    if (!layer || tab !== 'stocks') return;

    let cancelled = false;
    setLoading(true);
    setStockError(null);

    fetchLayerTopStocks(layer.stocks.cn, layer.stocks.global, 5)
      .then(({ cn, global }) => {
        if (cancelled) return;
        setCnStocks(cn);
        setGlobalStocks(global);
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

  return (
    <>
      <header className="site-header">
        <Link to="/" className="back-btn visible">
          ‹ 返回
        </Link>
        <h1>
          L{layer.id} {layer.short}
        </h1>
        <span className="meta" />
      </header>

      <section className="layer-hero" style={{ background: layer.gradient }}>
        <div className="layer-icon-lg">{layer.icon}</div>
        <h2>{layer.name}</h2>
        <p className="summary">{layer.summary}</p>
      </section>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'stocks' && (
        <div className="tab-panel active stocks-tab">
          <button
            type="button"
            className="refresh-btn"
            disabled={loading}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            {loading ? '刷新中…' : '刷新行情'}
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
        <div className="tab-panel active">
          <div className="section-card">
            <h3>行业概览</h3>
            <p>{layer.industry.overview}</p>
          </div>
          <div className="section-card">
            <h3>细分赛道</h3>
            {layer.industry.segments.map((s) => (
              <div key={s.name} className="segment-item">
                <strong>{s.name}</strong>
                <span>{s.desc}</span>
                {s.players && <span className="players">代表：{s.players}</span>}
              </div>
            ))}
          </div>
          <div className="section-card">
            <h3>关键数据</h3>
            <div className="metric-grid">
              {layer.industry.metrics.map((m) => (
                <div key={m.label} className="metric-item">
                  <div className="label">{m.label}</div>
                  <div className="value">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'trends' && (
        <div className="tab-panel active">
          <div className="section-card">
            <h3>趋势研判</h3>
            {layer.trends.map((t) => (
              <div key={t.title} className="trend-item">
                <span className={`signal-dot ${t.signal}`} />
                <div className="trend-body">
                  <h4>{t.title}</h4>
                  <p>{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="tab-panel active">
          <div className="section-card">
            <h3>时间线</h3>
            {layer.events.map((e) => (
              <div key={e.title + e.date} className="event-item">
                <div className="event-date">{e.date}</div>
                <h4>{e.title}</h4>
                <p>{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="disclaimer">数据为框架整理 + stock-sdk 实时行情，请自行验证。</p>
    </>
  );
}
