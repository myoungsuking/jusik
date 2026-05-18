import type { Candle, Interval, MarketOption, MarketStatus, Quote, Range, SymbolSearchResult } from '../types/market';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchChart(symbol: string, range: Range, interval: Interval) {
  const params = new URLSearchParams({ symbol, range, interval });
  const response = await getJson<{ data: Candle[] }>(`/api/market/chart?${params}`);
  return response.data;
}

export async function fetchQuote(symbol: string) {
  const response = await getJson<{ data: Quote }>(`/api/market/quote/${encodeURIComponent(symbol)}`);
  return response.data;
}

export async function searchSymbols(query: string) {
  const params = new URLSearchParams({ q: query });
  const response = await getJson<{ data: SymbolSearchResult[] }>(`/api/market/search?${params}`);
  return response.data;
}

export async function fetchMarketStatuses() {
  const response = await getJson<{ data: MarketStatus[] }>('/api/market/status');
  return response.data;
}

export async function fetchMarketOptions() {
  const response = await getJson<{ data: MarketOption[] }>('/api/market/options');
  return response.data;
}
