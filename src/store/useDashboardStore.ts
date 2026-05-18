import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Interval, Range } from '../types/market';

interface DashboardState {
  selectedSymbol: string;
  range: Range;
  interval: Interval;
  favorites: string[];
  recentSearches: string[];
  theme: 'dark' | 'light';
  setSelectedSymbol: (symbol: string) => void;
  setRange: (range: Range) => void;
  setInterval: (interval: Interval) => void;
  toggleFavorite: (symbol: string) => void;
  addRecentSearch: (symbol: string) => void;
  toggleTheme: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      selectedSymbol: 'AAPL',
      range: '1D',
      interval: '5m',
      favorites: ['AAPL', 'TSLA', '005930.KS'],
      recentSearches: [],
      theme: 'dark',
      setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
      setRange: (range) => set({ range }),
      setInterval: (interval) => set({ interval }),
      toggleFavorite: (symbol) =>
        set((state) => ({
          favorites: state.favorites.includes(symbol)
            ? state.favorites.filter((item) => item !== symbol)
            : [symbol, ...state.favorites].slice(0, 20),
        })),
      addRecentSearch: (symbol) =>
        set((state) => ({
          recentSearches: [symbol, ...state.recentSearches.filter((item) => item !== symbol)].slice(0, 8),
        })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'stock-dashboard' },
  ),
);
