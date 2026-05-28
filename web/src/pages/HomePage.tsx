import { Link } from 'react-router-dom';
import { LAYERS } from '../config/layers';

export function HomePage() {
  const stack = [...LAYERS].reverse();

  return (
    <>
      <header className="site-header">
        <h1>AI 五层模型</h1>
        <span className="meta">stock-sdk</span>
      </header>

      <section className="hero">
        <h2>AI 五层模型</h2>
        <p>从算力底座到场景落地 · Top5 行情 + 行业/趋势/事件 + Section 1 投资分析</p>
        <p className="updated">数据由 stock-sdk 在浏览器端拉取</p>
      </section>

      <section className="stack-container">
        <div className="stack-label">
          <span>终端与生态</span>
          <span>算力基础 ↑</span>
        </div>
        <div className="layer-stack">
          {stack.map((layer) => (
            <Link
              key={layer.id}
              to={`/layer/${layer.id}`}
              className="layer-card"
              style={{ '--layer-color': layer.color } as React.CSSProperties}
            >
              <div className="layer-card-inner">
                <span className="layer-icon" aria-hidden="true">
                  {layer.icon}
                </span>
                <div className="layer-info">
                  <div className="layer-level">
                    L{layer.id} · {layer.short}
                  </div>
                  <h3 className="layer-name">{layer.name}</h3>
                  <p className="layer-tagline">{layer.tagline}</p>
                </div>
                <span className="layer-arrow" aria-hidden="true">
                  ›
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <p className="disclaimer">
        行情与 K 线来自公开数据源，仅供学习研究，不构成投资建议。海外行情受网络环境影响可能加载失败。
      </p>
    </>
  );
}
