// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStockData } from '../useStockData';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useStockData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('immediately resets data, candleData, and sets loading=true when active ticker changes (Ghost Chart Prevention)', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { c: 150, h: 155, l: 148, o: 149, dp: 1.2 },
      error: null,
    });

    const { result, rerender } = renderHook(({ ticker }) => useStockData(ticker), {
      initialProps: { ticker: 'AAPL' },
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    rerender({ ticker: 'MSFT' });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.candleData).toBe(null);
  });
});
