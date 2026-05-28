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
  { id: 'analysis', label: '投资分析' },
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
  const analysis = layer.analysis;

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

      <nav className="tabs tabs-scroll" role="tablist">
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

      {tab === 'analysis' && (
        <div className="tab-panel active analysis-tab">
          <div className="section-card framework-intro">
            <h3>Section 1 · 本层定位</h3>
            <p>{analysis.role}</p>
          </div>

          <div className="section-card">
            <h3>分析链（自上而下）</h3>
            <ol className="analysis-chain">
              {analysis.chain.map((c) => (
                <li key={c.step}>
                  <span className="chain-step">{c.step}</span>
                  <span className="chain-q">{c.question}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="section-card">
            <h3>五项核心技能</h3>
            {analysis.skills.map((s) => (
              <details key={s.id} className="skill-block" open={s.id === 'market'}>
                <summary>
                  <strong>{s.title}</strong>
                  <span className="skill-intro">{s.intro}</span>
                </summary>
                <ul className="checklist">
                  {s.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="section-card">
            <h3>估值与持有周期</h3>
            <div className="val-methods">
              {analysis.valuation.methods.map((m) => (
                <div key={m.method} className="val-row">
                  <strong>{m.method}</strong>
                  <span className="val-scene">{m.scene}</span>
                  <p>{m.tip}</p>
                </div>
              ))}
            </div>
            <div className="hold-box">
              <div>
                <h4>长期持有</h4>
                <p>{analysis.valuation.longHold}</p>
              </div>
              <div>
                <h4>短期参与</h4>
                <p>{analysis.valuation.shortHold}</p>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3>投资备忘录清单</h3>
            <ol className="memo-list">
              {analysis.memoPrompts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div className="section-card">
            <h3>证伪条件（认错信号）</h3>
            <ul className="falsify-list">
              {analysis.falsification.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="section-card">
            <h3>常见误区</h3>
            {analysis.pitfalls.map((p) => (
              <div key={p.wrong} className="pitfall-row">
                <div className="pitfall-wrong">✗ {p.wrong}</div>
                <div className="pitfall-right">✓ {p.right}</div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <h3>信息源（可靠度从高到低）</h3>
            <ol className="source-list">
              {analysis.dataSources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <p className="disclaimer">
        方法论整理自仓库 section-1.md；行情来自 stock-sdk。仅供学习，不构成投资建议。
      </p>
    </>
  );
}
