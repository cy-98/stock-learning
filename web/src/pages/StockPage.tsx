import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { VALUATION_PROFILE_LABELS } from '../config/valuationProfiles';
import { PageShell } from '../components/PageShell';
import { FairRangeBar } from '../components/FairRangeBar';
import { ValuationBadge } from '../components/ValuationBadge';
import { MiniKlineChart } from '../components/MiniKlineChart';
import { getLayerById } from '../config/layers';
import { fetchValuations } from '../services/valuation';
import { fetchStockByCode, type RankedStock } from '../services/stock';
import type { ValuationRecord } from '../types/valuation';
import { fetchLayerInsights, horizonLabel } from '../services/insights';
import type { InsightPick } from '../types/insights';
import { computeVerdict } from '../utils/computeVerdict';
import type { InsightBias } from '../types/insights';

const SECTION3_URL =
  'https://github.com/cy-98/stock-learning/blob/main/section-3.md';

export function StockPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ValuationRecord | null>(null);
  const [stock, setStock] = useState<RankedStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightPick | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchValuations(), fetchStockByCode(code)])
      .then(async ([{ stocks }, quote]) => {
        if (cancelled) return;
        const rec = stocks[code] ?? null;
        setRecord(rec);
        setStock(quote);
        if (rec) {
          const doc = await fetchLayerInsights(rec.layerId);
          const pick = doc?.picks.find((p) => p.code === code) ?? null;
          if (!cancelled) setInsight(pick);
        }
        if (!rec) {
          setError('该代码尚未录入合理价区间（见 section-3）');
        } else if (!quote?.price) {
          setError('行情暂不可用，仍可查看下方合理区间锚点');
        }
      })
      .catch(() => {
        if (!cancelled) setError('加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  const layer = record ? getLayerById(record.layerId) : null;
  const snapshot =
    record && stock && stock.price > 0 ? computeVerdict(stock.price, record) : null;
  const profileMeta = record ? VALUATION_PROFILE_LABELS[record.profile] : null;

  return (
    <PageShell
      title={record?.name ?? code ?? '个股'}
      backTo={layer ? `/layer/${layer.id}?tab=picks` : '/'}
    >
      {loading && (
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          加载行情与估值锚点…
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className={`alert text-sm ${record ? 'alert-warning alert-soft' : 'alert-warning'}`}
        >
          <span>{error}</span>
        </div>
      )}

      {record && !snapshot && !loading && (
        <div className="alert alert-ghost text-sm">
          <span>暂无有效现价，无法计算偏离度；区间锚点仍可参考。</span>
        </div>
      )}

      {record && (
        <div className="glass-card card">
          <div className="card-body gap-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-mono text-xs text-base-content/50">{code}</div>
                <h2 className="text-lg font-semibold">{record.name}</h2>
                {layer && (
                  <Link
                    to={`/layer/${layer.id}?tab=stocks`}
                    className="text-xs text-primary hover:underline"
                  >
                    L{layer.id} {layer.short}
                  </Link>
                )}
              </div>
              {snapshot && (
                <ValuationBadge
                  verdict={snapshot.verdict}
                  deviationPct={snapshot.deviationPct}
                />
              )}
            </div>

            {stock && stock.price > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold tabular-nums">
                  ¥{stock.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm font-medium tabular-nums ${
                    stock.changePercent >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            )}

            {snapshot && stock && stock.price > 0 && (
              <FairRangeBar price={stock.price} snapshot={snapshot} />
            )}

            {insight && (
              <div className="glass-inset border border-primary/15 p-4 text-sm">
                <p className="mb-2 font-medium text-primary">AI 分析（insights YAML）</p>
                <p className="leading-relaxed text-base-content/75">{insight.aiSummary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="badge badge-outline">持有 {insight.holdPeriod}</span>
                  <span className="badge badge-primary badge-outline">
                    预期 {insight.expectedReturnPct}
                  </span>
                  <span className="badge badge-ghost">{horizonLabel(insight.horizon)}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <InsightTermBlock title="短期" view={insight.shortTerm} />
                  <InsightTermBlock title="长期" view={insight.longTerm} />
                </div>
              </div>
            )}

            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-base-200 py-1">
                <dt className="text-base-content/55">估值画像</dt>
                <dd>{profileMeta?.label ?? record.profile}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-base-200 py-1">
                <dt className="text-base-content/55">论点版本</dt>
                <dd className="font-mono text-xs">{record.thesisVersion}</dd>
              </div>
              {record.assumptions && record.assumptions.length > 0 && (
                <div>
                  <dt className="mb-1 text-base-content/55">关键假设</dt>
                  <dd>
                    <ul className="list-inside list-disc text-base-content/75">
                      {record.assumptions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            {stock && stock.kline.length > 0 && (
              <MiniKlineChart
                data={stock.kline}
                positive={stock.changePercent >= 0}
                height={120}
              />
            )}

            <a
              href={SECTION3_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm w-full"
            >
              在 section-3.md 查看完整分析
            </a>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-base-content/50">
        合理区间为人工维护锚点，现价来自 stock-sdk；不构成投资建议。
      </p>
    </PageShell>
  );
}

function InsightTermBlock({
  title,
  view,
}: {
  title: string;
  view: { bias: InsightBias; label: string; note: string };
}) {
  return (
    <div className="glass-inset p-2">
      <div className="text-xs text-base-content/55">{title}</div>
      <div className="font-medium">{view.label}</div>
      <p className="text-xs text-base-content/65">{view.note}</p>
    </div>
  );
}
