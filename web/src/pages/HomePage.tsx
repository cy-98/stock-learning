import { Link } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { PageShell } from '../components/PageShell';
import { getLayerAccent } from '../utils/layerTheme';

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
          <p className="text-xs text-base-content/50">行情在浏览器端通过 stock-sdk 拉取</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-base-content/60">
        <span>终端与生态</span>
        <span>算力基础 ↑</span>
      </div>

      <ul className="flex flex-col gap-2">
        {stack.map((layer) => {
          const accent = getLayerAccent(layer.id);
          return (
            <li key={layer.id}>
              <Link
                to={`/layer/${layer.id}`}
                className={`card card-border bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md ${accent.border} border-l-4`}
              >
                <div className="card-body flex-row items-center gap-3 p-4">
                  <span className="text-2xl" aria-hidden>
                    {layer.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`badge badge-sm ${accent.badge} badge-outline`}>
                      L{layer.id} · {layer.short}
                    </div>
                    <h3 className="mt-1 truncate font-medium">{layer.name}</h3>
                    <p className="truncate text-xs text-base-content/60">{layer.tagline}</p>
                  </div>
                  <span className="text-base-content/40" aria-hidden>
                    ›
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="px-1 text-center text-xs leading-relaxed text-base-content/50">
        行情与 K 线来自公开数据源，仅供学习研究，不构成投资建议。
      </p>
    </PageShell>
  );
}
