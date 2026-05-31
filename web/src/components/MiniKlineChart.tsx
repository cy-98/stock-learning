import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { KlinePoint } from '../services/stock';

interface Props {
  data: KlinePoint[];
  positive?: boolean;
  height?: number;
}

const UP = { line: '#059669', fill: 'rgba(5, 150, 105, 0.2)' };
const DOWN = { line: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' };

export function MiniKlineChart({ data, positive, height = 72 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length < 2) return;

    const colors = positive !== false ? UP : DOWN;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#64748b',
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.fill,
      bottomColor: 'transparent',
      lineWidth: 2,
    });

    const mapped = data.map((d) => ({
      time: d.time.slice(0, 10),
      value: d.close,
    }));

    const unique = mapped.filter(
      (item, i, arr) => i === 0 || item.time !== arr[i - 1].time,
    );

    series.setData(unique);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    });
    ro.observe(ref.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data, positive, height]);

  if (data.length < 2) {
    return (
      <div className="flex h-16 items-center justify-center rounded-lg glass-inset text-xs text-faint">
        暂无 K 线
      </div>
    );
  }

  return <div className="mt-1 w-full overflow-hidden rounded-lg" ref={ref} style={{ height }} />;
}
