import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { searchSymbols } from '../lib/api';
import { useDashboardStore } from '../store/useDashboardStore';
import type { SymbolSearchResult } from '../types/market';

interface Props {
  onSelect: (symbol: string) => void;
}

export function SymbolSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const recentSearches = useDashboardStore((state) => state.recentSearches);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ['symbol-search', debounced],
    queryFn: () => searchSymbols(debounced),
    enabled: debounced.length > 0,
  });

  const results = useMemo<SymbolSearchResult[]>(() => {
    if (debounced) {
      return searchQuery.data ?? [];
    }

    return recentSearches.map((symbol) => ({ symbol, name: symbol, type: 'RECENT' }));
  }, [debounced, recentSearches, searchQuery.data]);

  function selectSymbol(symbol: string) {
    onSelect(symbol);
    setQuery('');
    setDebounced('');
    setIsOpen(false);
  }

  return (
    <div className="search">
      <div className="searchBox" onFocus={() => setIsOpen(true)}>
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClick={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && query.trim()) {
              selectSymbol(query.trim().toUpperCase());
            }
          }}
          placeholder="티커 또는 회사명 검색"
          aria-label="티커 또는 회사명 검색"
        />
        {query && (
          <button className="iconButton" type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery('')} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (query || recentSearches.length > 0) && (
        <div className="searchResults">
          {searchQuery.isFetching && <div className="searchState">검색 중</div>}
          {!searchQuery.isFetching &&
            results.map((result) => (
              <button
                key={`${result.symbol}-${result.exchange ?? 'recent'}`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSymbol(result.symbol)}
              >
                <span>
                  <strong>{result.symbol}</strong>
                  <small>{result.name}</small>
                </span>
                <em>{result.exchange ?? result.type}</em>
              </button>
            ))}
          {!searchQuery.isFetching && debounced && results.length === 0 && <div className="searchState">검색 결과 없음</div>}
        </div>
      )}
    </div>
  );
}
