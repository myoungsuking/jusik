import { z } from 'zod';
import type { Interval, Range } from './types.js';

export const ranges = ['1D', '5D', '1M', '6M', '1Y', '5Y'] as const;
export const intervals = ['1m', '5m', '15m', '1h', '1d'] as const;

const allowedIntervalsByRange: Record<Range, Interval[]> = {
  '1D': ['1m', '5m', '15m', '1h'],
  '5D': ['5m', '15m', '1h'],
  '1M': ['15m', '1h', '1d'],
  '6M': ['1h', '1d'],
  '1Y': ['1d'],
  '5Y': ['1d'],
};

export const chartQuerySchema = z.object({
  symbol: z.string().trim().min(1).max(24).transform((value) => value.toUpperCase()),
  range: z.enum(ranges).default('1D'),
  interval: z.enum(intervals).default('5m'),
});

export const symbolSearchSchema = z.object({
  q: z.string().trim().min(1).max(80),
});

export function assertRangeInterval(range: Range, interval: Interval) {
  if (!allowedIntervalsByRange[range].includes(interval)) {
    throw new Error(`${range} range does not support ${interval} interval`);
  }
}

export function getAllowedIntervals(range: Range) {
  return allowedIntervalsByRange[range];
}

export function yahooRange(range: Range) {
  const yahooRanges: Record<Range, string> = {
    '1D': '1d',
    '5D': '5d',
    '1M': '1mo',
    '6M': '6mo',
    '1Y': '1y',
    '5Y': '5y',
  };

  return yahooRanges[range];
}
