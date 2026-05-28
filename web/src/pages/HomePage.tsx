import { useEffect, useState } from 'react';
import { LAYERS } from '../config/layers';
import { LayerHeatCard } from '../components/LayerHeatCard';
import { PageShell } from '../components/PageShell';
import { useLayerFeed } from '../context/LayerFeedContext';
import type { LayerConfig } from '../config/layers';
import { fetchLayersCnMomentum } from '../services/stock';

function withFeedLayer(layer: LayerConfig, feed: ReturnType<typeof useLayerFeed>): LayerConfig {
  const e = feed.getEvents(layer.id);
  const t = feed.getTrends(layer.id);
  if (feed.status === 'live' && (e.length > 0 || t.length > 0)) {
    return { ...layer, events: e, trends: t };
  }
  return layer;
}

export function HomePage() {
  const stack = [...LAYERS].reverse();
  const [momentum, setMomentum] = useState<Record<number, { changePercent: number }[]>>(
    {},
  );
  const [marketLoading, setMarketLoading] = useState(true);
  const feed = useLayerFeed();

  useEffect(() => {
    let cancelled = false;
    setMarketLoading(true);

    fetchLayersCnMomentum(LAYERS)
      .then((data) => {
        if (!cancelled) setMomentum(data);
      })
      .catch(() => {
        if (!cancelled) setMomentum({});
      })
      .finally(() => {
        if (!cancelled) setMarketLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell
      title="AI 五层模型"
      badge={<span className="badge badge-ghost badge-sm">stock-sdk</span>}
    >
      <div className="card card-border bg-base-100 shadow-sm">
        <div className="card-body gap-2 p-5">
          <h2 className="card-title text-lg font-semibold">从算力到生态</h2>
          <p className="text-sm leading-relaxed text-base-content/70">
            每层提供 Top5 行情、行业/趋势/事件，以及 Section 1 投资分析框架。
          </p>
          <div className="collapse collapse-arrow rounded-lg border border-base-200 bg-base-200/40">
            <input type="checkbox" />
            <div className="collapse-title min-h-0 py-2 text-xs font-medium">
              热度如何计算？（含时事动态）
            </div>
            <div className="collapse-content text-xs leading-relaxed text-base-content/65">
              <p className="mb-2">
                卡片背景比例 = <strong>综合热度</strong>，由三部分加权（有行情时）：
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>行情动能 45%</strong>：该层 A 股候选池今日涨跌均值 + 上涨家数占比（stock-sdk
                  实时，反映资金热度）
                </li>
                <li>
                  <strong>事件/趋势 30%</strong>：来自 layer-feed.json（可动态更新）：层内「大事件」按日期时间衰减（越近权重越高）+「趋势研判」利好/谨慎信号
                </li>
                <li>
                  <strong>周期进度 25%</strong>：配置的热度起止日期，已过天数 ÷ 总天数
                </li>
              </ul>
              <p className="mt-2">
                行情拉取失败时，自动改为事件 65% + 周期 35%。大事件日期可在各层「大事件」Tab
                维护；换日/刷新后行情分会更新。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-base-content/60">
        <span>终端与生态</span>
        <span>算力基础 ↑</span>
      </div>

      <ul className="flex flex-col gap-2">
        {stack.map((layer) => (
          <li key={layer.id}>
            <LayerHeatCard
              layer={withFeedLayer(layer, feed)}
              marketQuotes={momentum[layer.id]}
              marketLoading={marketLoading}
            />
          </li>
        ))}
      </ul>

      <p className="px-1 text-center text-xs leading-relaxed text-base-content/50">
        行情与 K 线来自公开数据源，仅供学习研究，不构成投资建议。
      </p>
    </PageShell>
  );
}
