// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../test/setup';
import VolatilityMeter from '../VolatilityMeter';

describe('VolatilityMeter', () => {
  it('renders gracefully when data is null/missing (defensive check)', () => {
    render(<VolatilityMeter data={null} ticker="AAPL" />);
    expect(screen.getByText('Volatility Meter')).toBeInTheDocument();
    expect(screen.getByText('SPREAD: $0.00')).toBeInTheDocument();
    expect(screen.getByText('L: $0.00')).toBeInTheDocument();
    expect(screen.getByText('H: $0.00')).toBeInTheDocument();
    expect(screen.getByText('Stable Data')).toBeInTheDocument();
  });

  it('renders correct intraday spread and price position for valid stock data', () => {
    const mockData = { o: 100, c: 105, h: 110, l: 95 };
    render(<VolatilityMeter data={mockData} ticker="AAPL" />);
    
    expect(screen.getByText('SPREAD: $15.00')).toBeInTheDocument();
    expect(screen.getByText('L: $95.00')).toBeInTheDocument();
    expect(screen.getByText('C: $105.00')).toBeInTheDocument();
    expect(screen.getByText('H: $110.00')).toBeInTheDocument();
    expect(screen.getByText('15.00% of Open')).toBeInTheDocument();
    expect(screen.getByText('High Volatility')).toBeInTheDocument();
  });
});
