import { useEffect, useRef } from 'react';
import { AreaSeries, createChart, CrosshairMode, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '../types/market';

interface Props {
  data: Candle[];
  isDark: boolean;
}

export function MarketChart({ data, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#cbd5e1' : '#334155',
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: isDark ? '#64748b' : '#94a3b8',
          labelBackgroundColor: '#2563eb',
        },
        horzLine: {
          color: isDark ? '#64748b' : '#94a3b8',
          labelBackgroundColor: '#2563eb',
        },
      },
      grid: {
        vertLines: { color: isDark ? '#182338' : '#eef2f7' },
        horzLines: { color: isDark ? '#182338' : '#eef2f7' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#1a73e8',
      lineWidth: 2,
      topColor: isDark ? 'rgba(26, 115, 232, 0.28)' : 'rgba(26, 115, 232, 0.18)',
      bottomColor: isDark ? 'rgba(26, 115, 232, 0.02)' : 'rgba(26, 115, 232, 0.01)',
      priceLineColor: '#1a73e8',
      priceLineWidth: 1,
      crosshairMarkerBackgroundColor: '#1a73e8',
      crosshairMarkerBorderColor: isDark ? '#0f172a' : '#ffffff',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    seriesRef.current?.setData(
      data.map((candle) => ({
        time: candle.time as UTCTimestamp,
        value: candle.close,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div className="chart" ref={containerRef} />;
}
