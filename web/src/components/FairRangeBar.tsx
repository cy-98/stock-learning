import type { ValuationSnapshot } from '../types/valuation';

interface Props {
  price: number;
  snapshot: ValuationSnapshot;
  currencySymbol?: string;
}

export function FairRangeBar({ price, snapshot, currencySymbol = '¥' }: Props) {
  const { fairLow, fairHigh, expensiveAbove, fairMid } = snapshot;
  const max = Math.max(expensiveAbove ?? fairHigh * 1.15, price, fairHigh) * 1.05;
  const min = Math.min(fairLow * 0.85, price > 0 ? price * 0.95 : fairLow);
  const span = max - min || 1;
  const pctNum = (v: number) => Math.min(100, Math.max(0, ((v - min) / span) * 100));
  const bandLeft = pctNum(fairLow);
  const bandRight = pctNum(fairHigh);

  return (
    <div className="mt-2 space-y-1">
      <div className="relative h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)]">
        <div
          className="absolute inset-y-0 rounded-full bg-[rgba(9,105,218,0.22)]"
          style={{ left: `${bandLeft}%`, right: `${100 - bandRight}%` }}
          title={`合理区间 ${fairLow}–${fairHigh}`}
        />
        {price > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-base-content"
            style={{ left: `${pctNum(price)}%` }}
            title={`现价 ${price.toFixed(2)}`}
          />
        )}
      </div>
      <div className="flex justify-between font-mono text-xs text-base-content/50">
        <span>
          {currencySymbol}
          {fairLow}–{fairHigh}
        </span>
        <span>
          中值 {currencySymbol}
          {fairMid.toFixed(fairLow < 10 ? 1 : 0)}
        </span>
      </div>
    </div>
  );
}
