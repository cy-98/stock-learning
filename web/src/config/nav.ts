/** 主导航（侧栏 + 移动端底栏） */
export const MAIN_NAV = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/board', label: '股票看板', icon: '📊' },
  { path: '/news', label: '最近时事', icon: '📰' },
] as const;

export type MainNavPath = (typeof MAIN_NAV)[number]['path'];

export function isMainNavPath(pathname: string): MainNavPath | null {
  const base = pathname.replace(/\/$/, '') || '/';
  const hit = MAIN_NAV.find((n) => n.path === base);
  return hit?.path ?? null;
}
