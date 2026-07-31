// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../test/setup';
import CustomChart from '../CustomChart';

describe('CustomChart Component', () => {
  it('renders fallback text when currentPrice is missing or null', () => {
    render(
      <CustomChart
        ticker="AAPL"
        currentPrice={null}
        priceChange={null}
        percentChange={null}
        isPositive={true}
      />
    );

    expect(screen.getByText('NO MARKET DATA FOR SYMBOL')).toBeInTheDocument();
  });

  it('renders SVG vector path and price info when currentPrice is provided', () => {
    render(
      <CustomChart
        ticker="AAPL"
        currentPrice={175.50}
        priceChange={2.35}
        percentChange={1.36}
        isPositive={true}
      />
    );

    expect(screen.getByText('$175.50')).toBeInTheDocument();
    expect(screen.getByText('+$2.35 (+1.36%)')).toBeInTheDocument();
    expect(screen.getByText('1W')).toBeInTheDocument();
  });

  it('changes timeline when timeline selector buttons are clicked', () => {
    render(
      <CustomChart
        ticker="AAPL"
        currentPrice={175.50}
        priceChange={2.35}
        percentChange={1.36}
        isPositive={true}
      />
    );

    const monthBtn = screen.getByRole('button', { name: '1M' });
    fireEvent.click(monthBtn);

    expect(monthBtn).toHaveClass('bg-paper-white');
  });
});
