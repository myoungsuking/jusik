import type { MarketDataProvider } from './provider.interface.js';
import type { Candle, ChartRequest, Quote, SymbolSearchResult } from '../types.js';

const mockSymbols: SymbolSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: '005930.KS', name: 'Samsung Electronics Co., Ltd.', exchange: 'KOSPI', type: 'EQUITY' },
  { symbol: '035720.KQ', name: 'Kakao Corp.', exchange: 'KOSDAQ', type: 'EQUITY' },
];

export class MockProvider implements MarketDataProvider {
  async getChartData(request: ChartRequest): Promise<Candle[]> {
    const now = Math.floor(Date.now() / 1000);
    const step = request.interval === '1d' ? 86400 : request.interval === '1h' ? 3600 : 300;
    const seed = request.symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return Array.from({ length: 96 }, (_, index) => {
      const wave = Math.sin(index / 4) * 2;
      const base = 100 + seed / 50 + index * 0.08 + wave;
      return {
        time: now - (95 - index) * step,
        open: Number((base - 0.5).toFixed(2)),
        high: Number((base + 1.1).toFixed(2)),
        low: Number((base - 1.4).toFixed(2)),
        close: Number((base + Math.sin(index / 2)).toFixed(2)),
        volume: 500000 + index * 1200,
      };
    });
  }

  async getQuote(symbol: string): Promise<Quote> {
    const match = mockSymbols.find((item) => item.symbol === symbol);
    return {
      symbol,
      name: match?.name ?? symbol,
      price: 187.34,
      change: 2.18,
      changePercent: 1.18,
      currency: symbol.endsWith('.KS') || symbol.endsWith('.KQ') ? 'KRW' : 'USD',
      exchange: match?.exchange,
      marketState: 'REGULAR',
      delayed: true,
      updatedAt: Math.floor(Date.now() / 1000),
    };
  }

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    const normalized = query.toLowerCase();
    return mockSymbols.filter(
      (item) => item.symbol.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized),
    );
  }
}
