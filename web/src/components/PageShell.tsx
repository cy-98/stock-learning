import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MAIN_NAV, isMainNavPath } from '../config/nav';
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
  const activeMain = isMainNavPath(pathname);

  return (
    <div className="page-shell">
      <DesktopNav />
      <header className="navbar sticky top-0 z-30 min-h-14 px-2 lg:px-6">
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
        className="btm-nav btm-nav-md fixed bottom-0 left-0 right-0 z-30 lg:hidden"
        aria-label="主导航"
      >
        {MAIN_NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={activeMain === item.path ? 'active border-primary text-primary' : ''}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
