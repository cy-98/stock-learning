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
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-sm font-semibold">
          <span aria-hidden>{flag}</span> {title}
        </h3>
        <span className="text-xs text-base-content/50">按总市值 Top5</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          正在拉取行情与 K 线…
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-warning alert-soft text-sm">
          <span>{error}</span>
        </div>
      )}

      {!loading && stocks.length === 0 && !error && (
        <div role="alert" className="alert alert-ghost text-sm">
          <span>暂无数据（请检查网络或稍后重试）</span>
        </div>
      )}

      <ol className="flex flex-col gap-2">
        {stocks.map((s, i) => (
          <li key={s.code}>
            <div className="card card-border bg-base-100 shadow-sm">
              <div className="card-body gap-2 p-4">
                <div className="flex gap-3">
                  <div className="badge badge-neutral badge-outline font-mono">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s.name}</div>
                        <div className="font-mono text-xs text-base-content/50">
                          {s.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold tabular-nums">
                          {s.market === 'cn' ? '¥' : '$'}
                          {s.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-medium tabular-nums ${
                            s.changePercent >= 0 ? 'text-success' : 'text-error'
                          }`}
                        >
                          {s.changePercent >= 0 ? '+' : ''}
                          {s.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-base-content/55">
                      市值约 {formatCap(s.marketCap, s.market)}
                    </p>
                    <MiniKlineChart
                      data={s.kline}
                      positive={s.changePercent >= 0}
                      height={64}
                    />
                  </div>
                </div>
              </div>
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
