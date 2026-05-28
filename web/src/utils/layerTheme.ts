/** DaisyUI 语义色，避免每层自定义霓虹渐变 */
const ACCENTS = [
  { border: 'border-l-primary', badge: 'badge-primary' },
  { border: 'border-l-secondary', badge: 'badge-secondary' },
  { border: 'border-l-accent', badge: 'badge-accent' },
  { border: 'border-l-info', badge: 'badge-info' },
  { border: 'border-l-neutral', badge: 'badge-neutral' },
] as const;

export function getLayerAccent(id: number) {
  return ACCENTS[(id - 1) % ACCENTS.length];
}

export function trendBadge(signal: 'bullish' | 'neutral' | 'caution') {
  if (signal === 'bullish') return 'badge-success';
  if (signal === 'caution') return 'badge-warning';
  return 'badge-ghost';
}
