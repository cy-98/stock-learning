import { Link, useLocation } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { SPEC_OVERVIEW_PATH } from '../config/spec';

export function DesktopNav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '';
  const isSpec = pathname.startsWith('/spec');
  const layerMatch = pathname.match(/^\/layer\/(\d+)/);
  const activeLayerId = layerMatch ? Number(layerMatch[1]) : null;

  return (
    <aside
      className="desktop-nav hidden lg:flex"
      aria-label="桌面侧栏"
    >
      <div className="mb-6">
        <Link to="/" className="text-lg font-semibold hover:text-primary">
          AI 五层模型
        </Link>
        <p className="mt-1 text-xs text-base-content/55">投资学习 · stock-sdk</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 text-sm">
        <Link
          to="/"
          className={`rounded-lg px-3 py-2 ${isHome && !activeLayerId ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-base-200'}`}
        >
          总览看板
        </Link>
        <p className="mt-3 px-3 text-xs font-medium text-base-content/45">五层</p>
        {[...LAYERS].reverse().map((l) => (
          <Link
            key={l.id}
            to={`/layer/${l.id}?tab=picks`}
            className={`rounded-lg px-3 py-2 ${activeLayerId === l.id ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-base-200'}`}
          >
            <span className="mr-1" aria-hidden>
              {l.icon}
            </span>
            L{l.id} {l.short}
          </Link>
        ))}
        <Link
          to={SPEC_OVERVIEW_PATH}
          className={`mt-3 rounded-lg px-3 py-2 ${isSpec ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-base-200'}`}
        >
          项目规格
        </Link>
        <a
          href="https://github.com/cy-98/stock-learning"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-3 py-2 hover:bg-base-200"
        >
          GitHub 仓库
        </a>
      </nav>
    </aside>
  );
}
