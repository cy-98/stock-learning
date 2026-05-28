/** DaisyUI 语义色，避免每层自定义霓虹渐变 */
const ACCENTS = [
  { border: 'border-l-primary', badge: 'badge-primary', progress: 'bg-primary/15' },
  { border: 'border-l-secondary', badge: 'badge-secondary', progress: 'bg-secondary/15' },
  { border: 'border-l-accent', badge: 'badge-accent', progress: 'bg-accent/15' },
  { border: 'border-l-info', badge: 'badge-info', progress: 'bg-info/15' },
  { border: 'border-l-neutral', badge: 'badge-neutral', progress: 'bg-neutral/20' },
] as const;

export function getLayerAccent(id: number) {
  return ACCENTS[(id - 1) % ACCENTS.length];
}

export function trendBadge(signal: 'bullish' | 'neutral' | 'caution') {
  if (signal === 'bullish') return 'badge-success';
  if (signal === 'caution') return 'badge-warning';
  return 'badge-ghost';
}
