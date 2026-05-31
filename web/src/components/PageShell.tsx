import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SPEC_OVERVIEW_PATH } from '../config/spec';
import { DesktopNav } from './DesktopNav';

interface Props {
  title: string;
  backTo?: string;
  badge?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

export function PageShell({ title, backTo, badge, children, wide }: Props) {
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '';
  const isSpec = pathname.startsWith('/spec');

  return (
    <div className="page-shell">
      <DesktopNav />
      <header className="navbar sticky top-0 z-30 min-h-14 border-b border-base-300 bg-base-100/95 px-2 backdrop-blur-sm lg:px-6">
        <div className="navbar-start w-20 lg:w-28">
          {backTo ? (
            <Link to={backTo} className="btn btn-ghost btn-sm">
              ‹ 返回
            </Link>
          ) : null}
        </div>
        <div className="navbar-center flex-1">
          <h1 className="truncate text-center text-base font-semibold lg:text-lg">
            {title}
          </h1>
        </div>
        <div className="navbar-end w-20 justify-end lg:w-28">{badge}</div>
      </header>

      <main className={`page-main ${wide ? 'page-main-wide' : ''}`}>{children}</main>

      <nav
        className="btm-nav btm-nav-md fixed bottom-0 left-0 right-0 z-30 border-t border-base-300 bg-base-100 lg:hidden"
        aria-label="主导航"
      >
        <Link to="/" className={isHome ? 'active border-primary text-primary' : ''}>
          <span className="text-lg" aria-hidden>
            ☰
          </span>
          <span className="btm-nav-label text-xs">五层模型</span>
        </Link>
        <Link to={SPEC_OVERVIEW_PATH} className={isSpec ? 'active border-primary text-primary' : ''}>
          <span className="text-lg" aria-hidden>
            📋
          </span>
          <span className="btm-nav-label text-xs">规格</span>
        </Link>
        <a
          href="https://github.com/cy-98/stock-learning"
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-lg" aria-hidden>
            ⌘
          </span>
          <span className="btm-nav-label text-xs">仓库</span>
        </a>
      </nav>
    </div>
  );
}
