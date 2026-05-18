import type { Candle, Quote, SymbolSearchResult } from '../types.js';

type YahooChartResult = {
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      close?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
  };
};

type YahooQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  fullExchangeName?: string;
  marketState?: string;
  chartPreviousClose?: number;
  previousClose?: number;
};

type YahooSearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  quoteType?: string;
};

export function normalizeYahooChart(result: YahooChartResult): Candle[] {
  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];

  if (!quote) {
    return [];
  }

  return timestamps.flatMap((time, index) => {
    const open = quote.open?.[index];
    const high = quote.high?.[index];
    const low = quote.low?.[index];
    const close = quote.close?.[index];

    if ([open, high, low, close].some((value) => value == null || Number.isNaN(value))) {
      return [];
    }

    return {
      time,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: quote.volume?.[index] ?? undefined,
    };
  });
}

export function normalizeYahooQuote(raw: YahooQuote, fallbackSymbol: string, delayed = false): Quote {
  const price = raw.regularMarketPrice ?? 0;
  const previousClose = raw.previousClose ?? raw.chartPreviousClose ?? price;
  const change = raw.regularMarketChange ?? price - previousClose;
  const changePercent = raw.regularMarketChangePercent ?? (previousClose ? (change / previousClose) * 100 : 0);

  return {
    symbol: raw.symbol ?? fallbackSymbol,
    name: raw.longName ?? raw.shortName ?? raw.symbol ?? fallbackSymbol,
    price,
    change,
    changePercent,
    currency: raw.currency ?? 'USD',
    exchange: raw.fullExchangeName,
    marketState: raw.marketState,
    delayed,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

export function normalizeYahooSearch(results: YahooSearchQuote[]): SymbolSearchResult[] {
  return results
    .filter((item) => item.symbol && (item.shortname || item.longname))
    .slice(0, 12)
    .map((item) => ({
      symbol: item.symbol as string,
      name: item.longname ?? item.shortname ?? (item.symbol as string),
      exchange: item.exchDisp,
      type: item.quoteType,
    }));
}
