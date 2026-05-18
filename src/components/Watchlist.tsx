import { Star } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { fetchQuote } from '../lib/api';
import { formatPercent, formatPrice } from '../lib/format';

interface Props {
  symbols: string[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export function Watchlist({ symbols, selectedSymbol, onSelect }: Props) {
  const quoteQueries = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ['watchlist-quote', symbol],
      queryFn: () => fetchQuote(symbol),
      staleTime: 30_000,
    })),
  });

  return (
    <aside className="watchlist">
      <div className="panelHeader">
        <h2>Watchlist</h2>
        <Star size={18} />
      </div>
      <div className="watchlistItems">
        {symbols.map((symbol, index) => {
          const quote = quoteQueries[index].data;
          const isPositive = (quote?.changePercent ?? 0) >= 0;

          return (
            <button className={selectedSymbol === symbol ? 'active' : ''} key={symbol} type="button" onClick={() => onSelect(symbol)}>
              <span>
                <strong>{symbol}</strong>
                <small>{quote?.name ?? 'Loading'}</small>
              </span>
              <span className="watchPrice">
                {quote ? formatPrice(quote.price, quote.currency) : '-'}
                <em className={isPositive ? 'positive' : 'negative'}>{quote ? formatPercent(quote.changePercent) : '-'}</em>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
