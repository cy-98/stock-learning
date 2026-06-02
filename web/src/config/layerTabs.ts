import type { LayerTab } from './layers';

export const LAYER_PAGE_TABS: { id: LayerTab; label: string }[] = [
  { id: 'picks', label: 'AI 荐股' },
  { id: 'stocks', label: '龙头榜单' },
  { id: 'industry', label: '行业' },
  { id: 'trends', label: '趋势' },
  { id: 'events', label: '大事件' },
  { id: 'analysis', label: '投资分析' },
];

export const HOME_LAYER_QUICK_TABS: { tab: LayerTab; label: string }[] = [
  { tab: 'picks', label: 'AI 荐股' },
  { tab: 'stocks', label: '龙头榜单' },
  { tab: 'events', label: '大事件' },
  { tab: 'analysis', label: '投资分析' },
];
