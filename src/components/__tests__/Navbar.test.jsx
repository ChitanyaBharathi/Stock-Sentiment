// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '../../test/setup';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input and updates query', () => {
    render(<Navbar onSearch={() => {}} isFetching={false} hasError={false} activeTicker="AAPL" />);
    const input = screen.getByPlaceholderText(/Search symbol or company/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'TSLA' } });
    expect(input.value).toBe('TSLA');
  });

  it('shows autocomplete dropdown suggestions when typing', async () => {
    render(<Navbar onSearch={() => {}} isFetching={false} hasError={false} activeTicker="AAPL" />);
    const input = screen.getByPlaceholderText(/Search symbol or company/i);

    fireEvent.change(input, { target: { value: 'TSLA' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Tesla Inc')).toBeInTheDocument();
  });

  it('triggers onSearch callback when clicking a search result', async () => {
    const handleSearch = vi.fn();
    render(<Navbar onSearch={handleSearch} isFetching={false} hasError={false} activeTicker="AAPL" />);
    const input = screen.getByPlaceholderText(/Search symbol or company/i);

    fireEvent.change(input, { target: { value: 'NVDA' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    const resultBtn = screen.getByText('NVIDIA Corp');
    fireEvent.click(resultBtn);

    expect(handleSearch).toHaveBeenCalledWith('NVDA');
  });
});
