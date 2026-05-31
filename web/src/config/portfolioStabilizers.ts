/** 与五层产业逻辑弱相关的防御/配置型标的，单独展示，不进入任一层候选池与 AI 荐股 */
export interface PortfolioStabilizer {
  code: string;
  name: string;
  tag: string;
  note: string;
}

export const PORTFOLIO_STABILIZERS: PortfolioStabilizer[] = [
  {
    code: 'sh600011',
    name: '华能国际',
    tag: '高股息电力',
    note: '算电协同叙事下的火电龙头；宜股息逻辑，勿当算力股追涨',
  },
  {
    code: 'sh600023',
    name: '浙能电力',
    tag: '高股息电力',
    note: '区域公用事业+核电参股；红利防御，与 AI 主题无直接关联',
  },
  {
    code: 'sh601991',
    name: '大唐发电',
    tag: '高股息电力',
    note: '电力题材波动大；逻辑可对，价格需估值纪律',
  },
];

export const STABILIZERS_INTRO =
  '下列标的用于平衡 AI 主题组合的波动，与单层产业逻辑弱相关，不纳入任一层荐股与龙头榜单。';
