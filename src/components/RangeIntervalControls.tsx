import type { Interval, MarketOption, Range } from '../types/market';

interface Props {
  range: Range;
  interval: Interval;
  options: MarketOption[];
  onRangeChange: (range: Range) => void;
  onIntervalChange: (interval: Interval) => void;
}

const intervals: Interval[] = ['1m', '5m', '15m', '1h', '1d'];

export function RangeIntervalControls({ range, interval, options, onRangeChange, onIntervalChange }: Props) {
  const ranges = options.map((option) => option.range);
  const allowedIntervals = options.find((option) => option.range === range)?.intervals ?? intervals;

  return (
    <div className="controls">
      <div className="segmented" aria-label="기간 선택">
        {ranges.map((item) => (
          <button className={item === range ? 'selected' : ''} key={item} type="button" onClick={() => onRangeChange(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="segmented" aria-label="봉 간격 선택">
        {intervals.map((item) => (
          <button
            className={item === interval ? 'selected' : ''}
            disabled={!allowedIntervals.includes(item)}
            key={item}
            type="button"
            onClick={() => onIntervalChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
