/** 与仓库根目录 spec/*.yaml 对应 */
export const SPEC_PHASES = [
  { slug: 'overview', file: 'overview.yaml', label: '总览', progress: 12 },
  { slug: 'design', file: 'design.yaml', label: '设计', progress: 30 },
  { slug: 'foundation', file: 'foundation.yaml', label: '基础准备', progress: 15 },
  { slug: 'mvp', file: 'mvp.yaml', label: 'MVP', progress: 8 },
  { slug: 'test-feedback', file: 'test-feedback.yaml', label: '测试反馈', progress: 0 },
  { slug: 'optimization', file: 'optimization.yaml', label: '优化', progress: 0 },
  { slug: 'closure', file: 'closure.yaml', label: '结束', progress: 0 },
] as const;

export type SpecPhaseSlug = (typeof SPEC_PHASES)[number]['slug'];

export const DEFAULT_SPEC_SLUG: SpecPhaseSlug = 'overview';

export function specPath(slug: string) {
  return `/spec/${slug}`;
}
