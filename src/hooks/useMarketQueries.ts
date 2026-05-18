import { useQuery } from '@tanstack/react-query';
import { fetchChart, fetchMarketOptions, fetchMarketStatuses, fetchQuote } from '../lib/api';
import type { Interval, MarketStatus, Range } from '../types/market';

function hasOpenMarket(statuses: MarketStatus[] | undefined) {
  return statuses?.some((status) => status.session === 'OPEN' || status.session === 'PREMARKET') ?? true;
}

export function useMarketStatuses() {
  return useQuery({
    queryKey: ['market-status'],
    queryFn: fetchMarketStatuses,
    refetchInterval: 60_000,
  });
}

export function useMarketOptions() {
  return useQuery({
    queryKey: ['market-options'],
    queryFn: fetchMarketOptions,
    staleTime: Infinity,
  });
}

export function useQuote(symbol: string, statuses: MarketStatus[] | undefined) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => fetchQuote(symbol),
    refetchInterval: hasOpenMarket(statuses) ? 30_000 : 300_000,
  });
}

export function useChart(symbol: string, range: Range, interval: Interval, statuses: MarketStatus[] | undefined) {
  return useQuery({
    queryKey: ['chart', symbol, range, interval],
    queryFn: () => fetchChart(symbol, range, interval),
    refetchInterval: hasOpenMarket(statuses) ? 30_000 : 300_000,
  });
}
