import type { RankedStock } from '../services/stock';
import { MiniKlineChart } from './MiniKlineChart';

interface Props {
  title: string;
  flag: string;
  stocks: RankedStock[];
  loading?: boolean;
  error?: string | null;
}

export function StockRankPanel({ title, flag, stocks, loading, error }: Props) {
  return (
    <section className="stock-panel">
      <h3 className="stock-panel-title">
        <span className="flag">{flag}</span> {title}
        <span className="stock-panel-hint">按总市值 Top5 · stock-sdk 实时</span>
      </h3>

      {loading && <p className="stock-loading">正在拉取行情与 K 线…</p>}
      {error && <p className="stock-error">{error}</p>}

      {!loading && stocks.length === 0 && !error && (
        <p className="stock-error">暂无数据（请检查网络或稍后重试）</p>
      )}

      <ol className="stock-list">
        {stocks.map((s, i) => (
          <li key={s.code} className="stock-card">
            <div className="stock-rank">{i + 1}</div>
            <div className="stock-main">
              <div className="stock-head">
                <div>
                  <strong className="stock-name">{s.name}</strong>
                  <span className="stock-code">{s.code}</span>
                </div>
                <div className="stock-price-block">
                  <span className="stock-price">
                    {s.market === 'cn' ? '¥' : '$'}
                    {s.price.toFixed(2)}
                  </span>
                  <span
                    className={
                      s.changePercent >= 0 ? 'stock-chg up' : 'stock-chg down'
                    }
                  >
                    {s.changePercent >= 0 ? '+' : ''}
                    {s.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="stock-meta">
                市值约 {formatCap(s.marketCap, s.market)}
              </div>
              <MiniKlineChart
                data={s.kline}
                positive={s.changePercent >= 0}
                height={64}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatCap(cap: number, market: 'cn' | 'global'): string {
  if (!cap || cap <= 0) return '—';
  if (market === 'cn') {
    if (cap >= 10000) return `${(cap / 10000).toFixed(1)} 万亿`;
    return `${cap.toFixed(0)} 亿`;
  }
  return `${cap.toFixed(0)} 亿 USD`;
}
