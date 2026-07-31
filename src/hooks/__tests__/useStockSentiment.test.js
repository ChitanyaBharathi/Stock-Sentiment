// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStockSentiment, analyzeNewsSentimentWithEdgeFunction } from '../useStockSentiment';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useStockSentiment hook & Edge Function helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyzeNewsSentimentWithEdgeFunction handles edge function invocation and returns data', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: {
        bullishPercent: 80,
        bearishPercent: 20,
        aggregateLabel: 'BULLISH',
        articles: [
          { headline: 'AAPL Record Growth', sentiment: 'POSITIVE', confidence: 92 },
        ],
      },
      error: null,
    });

    const result = await analyzeNewsSentimentWithEdgeFunction('AAPL', ['AAPL Record Growth']);
    expect(result).not.toBeNull();
    expect(result.bullishPercent).toBe(80);
    expect(result.aggregateLabel).toBe('BULLISH');
  });

  it('useStockSentiment hook sets loading state initially and handles empty articles fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ news: [] }),
    });

    const { result } = renderHook(({ ticker }) => useStockSentiment(ticker), {
      initialProps: { ticker: 'AAPL' },
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.sentimentData.sentimentLabel).toBe('No Recent News Found');
  });
});
