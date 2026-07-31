// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../test/setup';
import AnalyticsPanel from '../AnalyticsPanel';

describe('AnalyticsPanel Component', () => {
  it('renders loading telemetry stream state when loading is true and data is null', () => {
    render(<AnalyticsPanel ticker="AAPL" data={null} loading={true} flashDirection={null} />);
    expect(screen.getByText(/INITIALIZING TELEMETRY STREAM FOR AAPL/i)).toBeInTheDocument();
  });

  it('renders financial metrics grid with correct values', () => {
    const mockData = {
      c: 182.40,
      d: 3.20,
      dp: 1.78,
      h: 185.00,
      l: 179.50,
      o: 180.00,
      pc: 179.20,
    };

    render(<AnalyticsPanel ticker="AAPL" data={mockData} loading={false} flashDirection="up" />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$182.40')).toBeInTheDocument();
    expect(screen.getByText('+3.20')).toBeInTheDocument();
    expect(screen.getByText('+1.78%')).toBeInTheDocument();
    expect(screen.getByText('$180.00')).toBeInTheDocument();
    expect(screen.getByText('$185.00')).toBeInTheDocument();
    expect(screen.getByText('$179.50')).toBeInTheDocument();
    expect(screen.getByText('$179.20')).toBeInTheDocument();
  });
});
