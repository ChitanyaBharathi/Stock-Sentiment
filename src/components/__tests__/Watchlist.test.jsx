// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../test/setup';
import Watchlist from '../Watchlist';

// Mock useStockData hook
vi.mock('../../hooks/useStockData', () => ({
  useStockData: (ticker) => {
    if (ticker === 'AAPL') {
      return { data: { c: 175.50, dp: 2.35, d: 4.03 }, flashDirection: 'up' };
    }
    return { data: null, flashDirection: null };
  },
}));

describe('Watchlist Component Checks', () => {
  it('renders ticker list with dynamic quote data and handles null fallbacks gracefully', () => {
    render(
      <Watchlist
        tickers={['AAPL', 'UNKNOWN']}
        activeTicker="AAPL"
        onSelectTicker={() => {}}
        onRemoveTicker={() => {}}
      />
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getAllByText('$175.50')[0]).toBeInTheDocument();
    expect(screen.getAllByText('+2.35%')[0]).toBeInTheDocument();

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(screen.getByText('$---')).toBeInTheDocument();
    expect(screen.getByText('+0.00%')).toBeInTheDocument();
  });

  it('triggers onSelectTicker and onRemoveTicker callbacks correctly', () => {
    const handleSelect = vi.fn();
    const handleRemove = vi.fn();

    render(
      <Watchlist
        tickers={['AAPL']}
        activeTicker="AAPL"
        onSelectTicker={handleSelect}
        onRemoveTicker={handleRemove}
      />
    );

    const removeBtn = screen.getByTitle('Remove AAPL from watchlist');
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith('AAPL');

    const tickerHeader = screen.getByText('AAPL');
    fireEvent.click(tickerHeader);
    expect(handleSelect).toHaveBeenCalledWith('AAPL');
  });
});
