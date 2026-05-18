import NodeCache from 'node-cache';
import type { MarketDataProvider } from './provider.interface.js';
import type { Candle, ChartRequest, Quote, SymbolSearchResult } from '../types.js';
import { normalizeYahooChart, normalizeYahooQuote, normalizeYahooSearch } from '../normalize/normalizeYahoo.js';
import { yahooRange } from '../validation.js';

const staleCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 });

async function fetchYahooJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 stock-dashboard/0.1',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export class YahooProvider implements MarketDataProvider {
  async getChartData(request: ChartRequest): Promise<Candle[]> {
    const cacheKey = `chart:${request.symbol}:${request.range}:${request.interval}`;

    try {
      const params = new URLSearchParams({
        range: yahooRange(request.range),
        interval: request.interval,
        includePrePost: 'true',
      });
      const response = await fetchYahooJson<{ chart?: { result?: unknown[]; error?: unknown } }>(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(request.symbol)}?${params}`,
      );
      const chartResult = response.chart?.result?.[0];
      const candles = normalizeYahooChart(chartResult as Parameters<typeof normalizeYahooChart>[0]);
      if (candles.length > 0) {
        staleCache.set(cacheKey, candles);
      }
      return candles;
    } catch (error) {
      const stale = staleCache.get<Candle[]>(cacheKey);
      if (stale) {
        return stale;
      }
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    const cacheKey = `quote:${symbol}`;

    try {
      const params = new URLSearchParams({ range: '1d', interval: '5m', includePrePost: 'true' });
      const response = await fetchYahooJson<{ chart?: { result?: Array<{ meta?: unknown }> } }>(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`,
      );
      const meta = response.chart?.result?.[0]?.meta;
      const quote = normalizeYahooQuote(meta as Parameters<typeof normalizeYahooQuote>[0], symbol);
      staleCache.set(cacheKey, quote);
      return quote;
    } catch (error) {
      const stale = staleCache.get<Quote>(cacheKey);
      if (stale) {
        return { ...stale, delayed: true };
      }
      throw error;
    }
  }

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = staleCache.get<SymbolSearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({ q: query, quotesCount: '12', newsCount: '0' });
    const response = await fetchYahooJson<{ quotes?: unknown[] }>(`https://query1.finance.yahoo.com/v1/finance/search?${params}`);
    const results = normalizeYahooSearch((response.quotes ?? []) as Parameters<typeof normalizeYahooSearch>[0]);
    staleCache.set(cacheKey, results, 60 * 30);
    return results;
  }
}
