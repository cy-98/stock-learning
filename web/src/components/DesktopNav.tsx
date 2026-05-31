import { Link, useLocation } from 'react-router-dom';
import { MAIN_NAV } from '../config/nav';
import { SPEC_OVERVIEW_PATH } from '../config/spec';

export function DesktopNav() {
  const { pathname } = useLocation();
  const active = MAIN_NAV.find((n) => n.path === (pathname || '/'))?.path ?? null;
  const isSpec = pathname.startsWith('/spec');

  return (
    <aside className="desktop-nav hidden lg:flex" aria-label="主导航">
      <div className="mb-8">
        <Link to="/" className="font-serif text-lg font-semibold hover:text-[var(--app-accent)]">
          AI 五层模型
        </Link>
        <p className="ui-sans mt-1 text-xs text-muted">投资学习 · stock-sdk</p>
      </div>

      <nav className="ui-sans flex flex-1 flex-col gap-1 text-sm">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 ${
              active === item.path
                ? 'bg-[var(--app-accent-soft)] font-medium text-[var(--app-accent)]'
                : 'text-muted hover:bg-white/50 hover:text-[var(--app-fg)]'
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ui-sans mt-auto border-t border-[var(--app-border)] pt-4 text-xs">
        <Link
          to={SPEC_OVERVIEW_PATH}
          className={`block rounded-lg px-3 py-2 ${
            isSpec ? 'font-medium text-[var(--app-accent)]' : 'text-faint hover:text-muted'
          }`}
        >
          项目规格
        </Link>
        <a
          href="https://github.com/cy-98/stock-learning"
          target="_blank"
          rel="noreferrer"
          className="mt-1 block rounded-lg px-3 py-2 text-faint hover:text-muted"
        >
          GitHub
        </a>
      </div>
    </aside>
  );
}
