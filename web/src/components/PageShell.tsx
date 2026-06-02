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
      <div className="page-shell-body">
        <header className="navbar sticky top-0 z-30 grid min-h-14 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 lg:px-6">
          <div className="flex min-w-0 justify-start">
            {backTo ? (
              <Link to={backTo} className="btn btn-ghost btn-sm">
                ‹ 返回
              </Link>
            ) : null}
          </div>
          <h1
            className={`truncate text-center text-base font-semibold lg:text-lg ${
              backTo ? '' : 'max-lg:block lg:hidden'
            }`}
          >
            {title}
          </h1>
          <div className="flex min-w-0 items-center justify-end gap-1">{badge}</div>
        </header>

        <main className={`page-main ${wide ? 'page-main-wide' : ''}`}>{children}</main>

        <nav
          className="btm-nav btm-nav-md fixed inset-x-0 bottom-0 z-30 w-full max-lg:grid max-lg:grid-cols-3 lg:hidden"
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
    </div>
  );
}
