export type MarketCode = 'NYSE' | 'NASDAQ' | 'KOSPI' | 'KOSDAQ';
export type MarketSession = 'OPEN' | 'CLOSED' | 'PREMARKET' | 'AFTER_HOURS';
export type Range = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y';
export type Interval = '1m' | '5m' | '15m' | '1h' | '1d';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange?: string;
  marketState?: string;
  delayed: boolean;
  updatedAt: number;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

export interface MarketStatus {
  code: MarketCode;
  session: MarketSession;
  timezone: string;
  label: string;
}

export interface ChartRequest {
  symbol: string;
  range: Range;
  interval: Interval;
}
