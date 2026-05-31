import type { ValuationProfile } from '../types/valuation';

export const VALUATION_PROFILE_LABELS: Record<
  ValuationProfile,
  { label: string; scene: string }
> = {
  cyclical_pb: { label: '周期 PB', scene: '重资产代工、周期波动大' },
  growth_pe: { label: '成长 PE/PEG', scene: '已盈利高成长芯片设计' },
  ps_unprofitable: { label: 'PS（未盈利）', scene: '收入高增但亏损，叙事溢价高' },
  equipment_pe: { label: '设备 PE', scene: '半导体设备订单驱动' },
  utility_pe: { label: '公用事业 PE+股息', scene: '电力龙头、分红逻辑' },
  rare_earth_pe: { label: '磁材 PE', scene: '稀土永磁、机器人/新能源车链' },
};
