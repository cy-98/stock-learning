import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { HomeLayerSection } from '../components/HomeLayerSection';
import { PageShell } from '../components/PageShell';
import { useLayerFeed } from '../hooks/useLayerFeed';
import type { LayerConfig } from '../config/layers';
import { fetchLayersCnMomentum } from '../services/stock';
import { fetchValuations, fetchLayerRichCounts } from '../services/valuation';
import { SPEC_OVERVIEW_PATH, SPEC_PAGES } from '../config/spec';

function withFeedLayer(layer: LayerConfig, feed: ReturnType<typeof useLayerFeed>): LayerConfig {
  const e = feed.getEvents(layer.id);
  const t = feed.getTrends(layer.id);
  if (feed.status === 'live' && (e.length > 0 || t.length > 0)) {
    return { ...layer, events: e, trends: t };
  }
  return layer;
}

export function HomePage() {
  const [searchParams] = useSearchParams();
  const openLayerId = Number(searchParams.get('layer')) || null;

  const stack = useMemo(() => [...LAYERS].reverse(), []);
  const [momentum, setMomentum] = useState<Record<number, { changePercent: number }[]>>({});
  const [marketLoading, setMarketLoading] = useState(true);
  const [richCounts, setRichCounts] = useState<Record<number, number>>({});
  const feed = useLayerFeed();

  useEffect(() => {
    let cancelled = false;
    setMarketLoading(true);

    Promise.all([fetchLayersCnMomentum(LAYERS), fetchValuations()])
      .then(async ([mom, { stocks }]) => {
        if (cancelled) return;
        setMomentum(mom);
        const rich = await fetchLayerRichCounts(LAYERS, stocks);
        if (!cancelled) setRichCounts(rich);
      })
      .catch(() => {
        if (!cancelled) {
          setMomentum({});
          setRichCounts({});
        }
      })
      .finally(() => {
        if (!cancelled) setMarketLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!openLayerId) return;
    const el = document.getElementById(`home-layer-${openLayerId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [openLayerId]);

  return (
    <PageShell
      title="首页"
      badge={<span className="badge badge-ghost badge-sm">五层模型</span>}
    >
      <div className="glass-card card">
        <div className="card-body gap-2 p-5">
          <h2 className="card-title text-lg font-semibold">从算力到生态</h2>
          <p className="text-sm leading-relaxed text-muted">
            点击各层展开，查看 AI 荐股与快捷入口；完整 Tab（龙头、行业、趋势、大事件、投资分析）请进入对应层页。
          </p>
          <div className="collapse collapse-arrow glass-inset">
            <input type="checkbox" />
            <div className="collapse-title min-h-0 py-2 text-xs font-medium">
              热度如何计算？（含时事动态）
            </div>
            <div className="collapse-content text-xs leading-relaxed text-muted">
              <p className="mb-2">
                层头背景比例 = <strong>综合热度</strong>，由三部分加权（有行情时）：
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>行情动能 45%</strong>：该层 A 股候选池今日涨跌均值 + 上涨家数占比
                </li>
                <li>
                  <strong>事件/趋势 30%</strong>：layer-feed 大事件时间衰减 + 趋势研判信号
                </li>
                <li>
                  <strong>周期进度 25%</strong>：配置的热度起止日期进度
                </li>
              </ul>
              <p className="mt-2">
                行情失败时改为事件 65% + 周期 35%。可在
                <Link to="/news" className="link link-primary mx-1">
                  最近时事
                </Link>
                浏览全部大事件。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-faint">
        <span>终端与生态</span>
        <span>算力基础 ↑</span>
      </div>

      <ul className="home-layer-accordion flex flex-col gap-3">
        {stack.map((layer) => {
          const merged = withFeedLayer(layer, feed);
          return (
            <li key={layer.id} id={`home-layer-${layer.id}`}>
              <HomeLayerSection
                layer={merged}
                events={merged.events}
                marketQuotes={momentum[layer.id]}
                marketLoading={marketLoading}
                richCount={richCounts[layer.id]}
                feedUpdated={feed.updated}
                defaultOpen={openLayerId === layer.id}
              />
            </li>
          );
        })}
      </ul>

      <div className="glass-card card">
        <div className="card-body gap-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-muted">项目规格（spec/*.yaml）</h3>
            <Link to={SPEC_OVERVIEW_PATH} className="btn btn-outline btn-xs">
              打开总览
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPEC_PAGES.map((page) => (
              <Link
                key={page.slug}
                to={page.to}
                className="badge badge-ghost badge-sm hover:badge-primary"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="px-1 text-center text-xs leading-relaxed text-faint">
        行情与 K 线来自公开数据源，仅供学习研究，不构成投资建议。
      </p>
    </PageShell>
  );
}
