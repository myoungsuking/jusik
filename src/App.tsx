import { useEffect } from 'react';
import { Moon, Star, Sun } from 'lucide-react';
import { MarketChart } from './components/MarketChart';
import { MarketStatusStrip } from './components/MarketStatusStrip';
import { RangeIntervalControls } from './components/RangeIntervalControls';
import { SymbolSearch } from './components/SymbolSearch';
import { Watchlist } from './components/Watchlist';
import { formatPercent, formatPrice, formatSigned } from './lib/format';
import { useChart, useMarketOptions, useMarketStatuses, useQuote } from './hooks/useMarketQueries';
import { useDashboardStore } from './store/useDashboardStore';
import type { Interval, Range } from './types/market';

export function App() {
  const selectedSymbol = useDashboardStore((state) => state.selectedSymbol);
  const range = useDashboardStore((state) => state.range);
  const interval = useDashboardStore((state) => state.interval);
  const favorites = useDashboardStore((state) => state.favorites);
  const theme = useDashboardStore((state) => state.theme);
  const setSelectedSymbol = useDashboardStore((state) => state.setSelectedSymbol);
  const setRange = useDashboardStore((state) => state.setRange);
  const setInterval = useDashboardStore((state) => state.setInterval);
  const toggleFavorite = useDashboardStore((state) => state.toggleFavorite);
  const addRecentSearch = useDashboardStore((state) => state.addRecentSearch);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);

  const statuses = useMarketStatuses();
  const options = useMarketOptions();
  const quote = useQuote(selectedSymbol, statuses.data);
  const chart = useChart(selectedSymbol, range, interval, statuses.data);

  const isDark = theme === 'dark';
  const isFavorite = favorites.includes(selectedSymbol);
  const quoteData = quote.data;
  const isPositive = (quoteData?.change ?? 0) >= 0;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  function selectSymbol(symbol: string) {
    const normalized = symbol.toUpperCase();
    setSelectedSymbol(normalized);
    addRecentSearch(normalized);
  }

  function updateRange(nextRange: Range) {
    setRange(nextRange);
    const allowedIntervals = options.data?.find((option) => option.range === nextRange)?.intervals;
    if (allowedIntervals && !allowedIntervals.includes(interval)) {
      setInterval(allowedIntervals[0]);
    }
  }

  function updateInterval(nextInterval: Interval) {
    setInterval(nextInterval);
  }

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <span className="brandMark">S</span>
          <div>
            <h1>Myoungsu King</h1>
            <p>Yahoo Finance 기반 준실시간 시장 보드</p>
          </div>
        </div>
        <SymbolSearch onSelect={selectSymbol} />
        <button className="iconButton themeButton" type="button" onClick={toggleTheme} aria-label="테마 전환">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <section className="marketBand">{statuses.data && <MarketStatusStrip statuses={statuses.data} />}</section>

      <div className="dashboardGrid">
        <Watchlist symbols={favorites} selectedSymbol={selectedSymbol} onSelect={selectSymbol} />

        <section className="mainPanel">
          <div className="quoteHeader">
            <div>
              <span className="eyebrow">{quoteData?.exchange ?? 'Market'}</span>
              <h2>{quoteData?.name ?? selectedSymbol}</h2>
              <div className="symbolLine">
                <strong>{selectedSymbol}</strong>
                {quoteData?.delayed && <span>Delayed</span>}
              </div>
            </div>
            <div className="quoteValue">
              <strong>{quoteData ? formatPrice(quoteData.price, quoteData.currency) : '-'}</strong>
              <span className={isPositive ? 'positive' : 'negative'}>
                {quoteData ? `${formatSigned(quoteData.change)} ${formatPercent(quoteData.changePercent)}` : '-'}
              </span>
            </div>
            <button className={isFavorite ? 'favoriteButton active' : 'favoriteButton'} type="button" onClick={() => toggleFavorite(selectedSymbol)}>
              <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {options.data && (
            <RangeIntervalControls
              range={range}
              interval={interval}
              options={options.data}
              onRangeChange={updateRange}
              onIntervalChange={updateInterval}
            />
          )}

          <div className="chartFrame">
            {chart.isLoading && <div className="chartState">차트 데이터를 불러오는 중</div>}
            {chart.isError && <div className="chartState error">{chart.error.message}</div>}
            {chart.data && <MarketChart data={chart.data} isDark={isDark} />}
          </div>
        </section>

        <aside className="sidePanel">
          <div className="panelHeader">
            <h2>Signal</h2>
          </div>
          <dl className="metricList">
            <div>
              <dt>Provider</dt>
              <dd>Yahoo</dd>
            </div>
            <div>
              <dt>Range</dt>
              <dd>{range}</dd>
            </div>
            <div>
              <dt>Interval</dt>
              <dd>{interval}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{quoteData ? new Date(quoteData.updatedAt * 1000).toLocaleTimeString('ko-KR') : '-'}</dd>
            </div>
          </dl>
          <div className="note">
            <strong>Architecture</strong>
            <p>공급자와 정규화 계층을 분리해 WebSocket 또는 국내 증권사 API로 확장할 수 있습니다.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
