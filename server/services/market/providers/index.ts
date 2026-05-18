import { MockProvider } from './mock.provider.js';
import { YahooProvider } from './yahoo.provider.js';

export function createMarketProvider() {
  if (process.env.MARKET_PROVIDER === 'mock') {
    return new MockProvider();
  }

  return new YahooProvider();
}
