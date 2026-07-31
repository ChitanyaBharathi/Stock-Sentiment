// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../test/setup';
import SentimentWidget from '../SentimentWidget';

describe('SentimentWidget', () => {
  it('renders loading placeholder when loading prop is true', () => {
    const { container } = render(<SentimentWidget loading={true} ticker="AAPL" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders loading placeholder when sentimentData is null', () => {
    const { container } = render(<SentimentWidget loading={false} sentimentData={null} ticker="AAPL" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders sentiment distribution and articles when data is provided', () => {
    const mockSentimentData = {
      bullishPercent: 70,
      bearishPercent: 20,
      buzzScore: 85,
      articlesCount: 2,
      sentimentLabel: 'Bullish',
      symbol: 'AAPL',
      articles: [
        {
          headline: 'Apple Reports Record Earnings',
          url: 'https://example.com/1',
          sentiment: 'Bullish',
          confidence: 90,
          source: 'Reuters',
          time: Date.now() - 3600000,
        },
        {
          headline: 'Supply Chain Bottlenecks Persist',
          url: 'https://example.com/2',
          sentiment: 'Bearish',
          confidence: 80,
          source: 'Bloomberg',
          time: Date.now() - 7200000,
        },
      ],
    };

    render(<SentimentWidget loading={false} sentimentData={mockSentimentData} ticker="AAPL" />);

    expect(screen.getByText('FinBERT Sentiment Engine')).toBeInTheDocument();
    expect(screen.getAllByText('Bullish')[0]).toBeInTheDocument();
    expect(screen.getByText('Apple Reports Record Earnings')).toBeInTheDocument();
    expect(screen.getByText('Supply Chain Bottlenecks Persist')).toBeInTheDocument();
  });

  it('filters articles when clicking tab filters', () => {
    const mockSentimentData = {
      bullishPercent: 50,
      bearishPercent: 50,
      buzzScore: 70,
      articlesCount: 2,
      sentimentLabel: 'Neutral',
      symbol: 'AAPL',
      articles: [
        {
          headline: 'Positive Growth Signals',
          url: 'https://example.com/1',
          sentiment: 'Bullish',
          confidence: 85,
          source: 'Reuters',
          time: Date.now(),
        },
        {
          headline: 'Market Downturn Ahead',
          url: 'https://example.com/2',
          sentiment: 'Bearish',
          confidence: 85,
          source: 'CNBC',
          time: Date.now(),
        },
      ],
    };

    render(<SentimentWidget loading={false} sentimentData={mockSentimentData} ticker="AAPL" />);

    const bearishTabBtn = screen.getByRole('button', { name: /^BEARISH/ });
    fireEvent.click(bearishTabBtn);

    expect(screen.queryByText('Positive Growth Signals')).not.toBeInTheDocument();
    expect(screen.getByText('Market Downturn Ahead')).toBeInTheDocument();
  });
});
