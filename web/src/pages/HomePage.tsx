import { LAYERS } from '../config/layers';
import { LayerHeatCard } from '../components/LayerHeatCard';
import { PageShell } from '../components/PageShell';

export function HomePage() {
  const stack = [...LAYERS].reverse();

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
          <p className="text-xs text-base-content/50">
            卡片背景填充比例 = 热度周期已过时间 ÷ 周期总时长（至结束日）
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-base-content/60">
        <span>终端与生态</span>
        <span>算力基础 ↑</span>
      </div>

      <ul className="flex flex-col gap-2">
        {stack.map((layer) => (
          <li key={layer.id}>
            <LayerHeatCard layer={layer} />
          </li>
        ))}
      </ul>

      <p className="px-1 text-center text-xs leading-relaxed text-base-content/50">
        行情与 K 线来自公开数据源，仅供学习研究，不构成投资建议。
      </p>
    </PageShell>
  );
}
