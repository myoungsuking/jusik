import type { Candle, ChartRequest, Quote, SymbolSearchResult } from '../types.js';

export interface MarketDataProvider {
  getChartData(request: ChartRequest): Promise<Candle[]>;
  getQuote(symbol: string): Promise<Quote>;
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;
}
