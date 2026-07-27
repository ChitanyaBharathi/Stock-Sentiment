import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Invokes Supabase Edge Function to get FinBERT sentiment analysis
 */
export async function analyzeNewsSentimentWithEdgeFunction(ticker, headlines) {
  try {
    const headlineTexts = headlines.map(h => typeof h === 'string' ? h : h.headline);

    // Try 'stock-sentiment' edge function first, fallback to 'get-sentiment'
    let fnName = 'stock-sentiment';
    let { data, error } = await supabase.functions.invoke(fnName, {
      body: { ticker, headlines: headlineTexts },
    });

    if (error && error.message?.includes('not found')) {
      fnName = 'get-sentiment';
      const res = await supabase.functions.invoke(fnName, {
        body: { ticker, headlines: headlineTexts },
      });
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.warn('Supabase Edge Function warning/error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to analyze sentiment with Supabase Edge Function:', err);
    return null;
  }
}

/**
 * Live News Fetcher using Yahoo Finance API and Finnhub API
 */
async function fetchRealLiveCompanyNews(ticker) {
  let articles = [];

  // Attempt 1: Fetch live news from Yahoo Finance Search API via local Vite proxy or direct endpoint
  try {
    const yahooUrl = `/api/yahoo/v1/finance/search?q=${encodeURIComponent(ticker)}&quotesCount=1&newsCount=15`;
    const res = await fetch(yahooUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.news) && data.news.length > 0) {
        articles = data.news.map((item) => ({
          headline: item.title,
          summary: item.publisher ? `Reported by ${item.publisher}` : '',
          source: item.publisher || 'Yahoo Finance',
          time: item.providerPublishTime ? item.providerPublishTime * 1000 : Date.now(),
          url: item.link || `https://finance.yahoo.com/quote/${ticker}/`
        }));
      }
    }
  } catch (err) {
    console.warn('Yahoo Finance proxy news fetch failed, trying secondary live source...', err);
  }

  // Attempt 2: Fetch live company news from Finnhub API if token is provided
  if (articles.length === 0) {
    try {
      const apiKey = localStorage.getItem('FINNHUB_API_KEY');
      if (apiKey) {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7);

        const toStr = today.toISOString().split('T')[0];
        const fromStr = pastDate.toISOString().split('T')[0];

        const fhUrl = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromStr}&to=${toStr}&token=${apiKey}`;
        const fhRes = await fetch(fhUrl);
        if (fhRes.ok) {
          const fhData = await fhRes.json();
          if (Array.isArray(fhData) && fhData.length > 0) {
            articles = fhData.slice(0, 15).map((art) => ({
              headline: art.headline,
              summary: art.summary || '',
              source: art.source || 'Finnhub Market News',
              time: art.datetime ? art.datetime * 1000 : Date.now(),
              url: art.url || `https://finance.yahoo.com/quote/${ticker}/`
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Finnhub news fetch failed...', err);
    }
  }

  // Attempt 3: Fetch live RSS feeds via RSS2JSON public gateway
  if (articles.length === 0) {
    try {
      const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
      const rssJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const rssRes = await fetch(rssJsonUrl);
      if (rssRes.ok) {
        const rssData = await rssRes.json();
        if (rssData && Array.isArray(rssData.items) && rssData.items.length > 0) {
          articles = rssData.items.map((item) => ({
            headline: item.title,
            summary: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 120) : '',
            source: item.author || 'Yahoo Finance RSS',
            time: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
            url: item.link || `https://finance.yahoo.com/quote/${ticker}/`
          }));
        }
      }
    } catch (err) {
      console.warn('RSS2JSON news fetch failed...', err);
    }
  }

  return articles;
}

export function useStockSentiment(ticker) {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchAndAnalyzeSentiment = async () => {
      try {
        // Fetch real live news articles
        const rawArticles = await fetchRealLiveCompanyNews(ticker);

        if (rawArticles.length === 0) {
          if (isMounted) {
            setSentimentData({
              symbol: ticker,
              bullishPercent: 50,
              bearishPercent: 50,
              score: 50,
              buzzScore: 0,
              articlesCount: 0,
              sentimentLabel: 'No Recent News Found',
              articles: []
            });
            setLoading(false);
          }
          return;
        }

        // Call Supabase Edge Function (FinBERT AI Sentiment Engine)
        const edgeResult = await analyzeNewsSentimentWithEdgeFunction(ticker, rawArticles);

        let finalArticles = rawArticles;
        let bullPct = 50;
        let bearPct = 50;
        let aggregateLabel = 'Neutral';

        if (edgeResult && Array.isArray(edgeResult.articles) && edgeResult.articles.length > 0) {
          bullPct = edgeResult.bullishPercent ?? 50;
          bearPct = edgeResult.bearishPercent ?? 50;
          aggregateLabel = edgeResult.aggregateLabel ?? 'NEUTRAL';

          // Map edge function predictions back to news articles
          const resultMap = new Map(edgeResult.articles.map(a => [a.headline, a]));
          finalArticles = rawArticles.map(art => {
            const edgeArt = resultMap.get(art.headline);
            const rawSent = edgeArt?.sentiment ? edgeArt.sentiment.toUpperCase() : 'NEUTRAL';
            const normSent = rawSent === 'POSITIVE' ? 'Bullish' : rawSent === 'NEGATIVE' ? 'Bearish' : 'Neutral';
            return {
              ...art,
              sentiment: normSent,
              confidence: edgeArt?.confidence ?? 50,
              score: rawSent === 'POSITIVE' ? 0.8 : rawSent === 'NEGATIVE' ? -0.8 : 0,
              keywords: [edgeArt?.confidence ? `${edgeArt.confidence}% ${normSent}` : normSent]
            };
          });
        } else {
          // Dynamic fallback when edge function is warming up or not yet redeployed
          const posWords = ['surge', 'profit', 'high', 'gain', 'growth', 'rally', 'record', 'soar', 'beat', 'up', 'top', 'strong', 'jump'];
          const negWords = ['drop', 'fall', 'loss', 'decline', 'down', 'miss', 'slump', 'cut', 'warning', 'risk', 'plunge', 'weak', 'lawsuit'];

          let posCount = 0;
          let negCount = 0;

          finalArticles = rawArticles.map(art => {
            const txt = (art.headline + ' ' + (art.summary || '')).toLowerCase();
            const hasPos = posWords.some(w => txt.includes(w));
            const hasNeg = negWords.some(w => txt.includes(w));

            let normSent = 'Neutral';
            if (hasPos && !hasNeg) {
              normSent = 'Bullish';
              posCount++;
            } else if (hasNeg && !hasPos) {
              normSent = 'Bearish';
              negCount++;
            }

            return {
              ...art,
              sentiment: normSent,
              confidence: normSent === 'Neutral' ? 50 : 75,
              score: normSent === 'Bullish' ? 0.8 : normSent === 'Bearish' ? -0.8 : 0,
              keywords: [normSent]
            };
          });

          const total = finalArticles.length;
          bullPct = total > 0 ? Math.round((posCount / total) * 100) : 50;
          bearPct = total > 0 ? Math.round((negCount / total) * 100) : 50;
          if (bullPct === 0 && bearPct === 0) {
            bullPct = 50;
            bearPct = 50;
          }
          aggregateLabel = bullPct > bearPct ? 'BULLISH' : bearPct > bullPct ? 'BEARISH' : 'NEUTRAL';
        }

        const total = finalArticles.length;
        const resultData = {
          symbol: ticker,
          bullishPercent: bullPct,
          bearishPercent: bearPct,
          score: bullPct,
          buzzScore: Math.min(100, Math.max(20, total * 7 + 30)),
          articlesCount: total,
          sentimentLabel: aggregateLabel === 'BULLISH' ? 'Bullish' : aggregateLabel === 'BEARISH' ? 'Bearish' : 'Neutral',
          articles: finalArticles
        };

        if (isMounted) {
          setSentimentData(resultData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchAndAnalyzeSentiment();

    return () => {
      isMounted = false;
    };
  }, [ticker]);

  return { sentimentData, loading, error };
}

export default useStockSentiment;

