import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';



export function useStockData(ticker) {
  const [data, setData] = useState(null);
  const [candleData, setCandleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flashDirection, setFlashDirection] = useState(null); // 'up', 'down', or null
  const prevPriceRef = useRef(null);
  const prevTickerRef = useRef(ticker);
  const telemetryLogsRef = useRef([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);


  const addTelemetryLog = (message) => {
    const time = new Date().toLocaleTimeString();
    const newLog = `[${time}] ${message}`;
    telemetryLogsRef.current = [newLog, ...telemetryLogsRef.current].slice(0, 30);
    setTelemetryLogs([...telemetryLogsRef.current]);
  };

  useEffect(() => {
    if (!ticker) return;

    setLoading(true);
    setError(null);
    prevPriceRef.current = null;
    setData(null);
    setCandleData(null);
    
    let intervalId;

    const fetchData = async (isFirstRender = false) => {
      // Real API implementation via secure Edge Function
      try {
        addTelemetryLog(`Requesting quote for ${ticker} from secure Edge Function...`);
        const { data: payload, error: fnError } = await supabase.functions.invoke('get-stock', {
          body: { ticker }
        });
        
        if (fnError) {
          // Extract message from error context if available
          let msg = fnError.message || `Edge Function returned status error`;
          try {
            if (fnError.context) {
              const body = await fnError.context.json();
              if (body?.error) msg = body.error;
            }
          } catch {}
          throw new Error(msg);
        }
        
        if (!payload || payload.error) {
           throw new Error(payload?.error || 'Unknown server error');
        }
        
        if (payload.c === 0 && payload.pc === 0) {
          throw new Error(`Symbol "${ticker}" not found.`);
        }

        // Fetch candle data only on first load
        if (isFirstRender) {
          try {
            let mappedData = null;
            
            // Attempt 1: Yahoo Finance Proxy (Most reliable, no API key needed)
            try {
              const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:5173';
              const yahooRes = await fetch(`${origin}/api/yahoo/v8/finance/chart/${ticker}?interval=1d&range=1y`);
              if (yahooRes.ok) {
                const data = await yahooRes.json();
                const result = data?.chart?.result?.[0];
                if (result && result.timestamp && result.indicators?.quote?.[0]) {
                  const quote = result.indicators.quote[0];
                  mappedData = {
                    s: 'ok',
                    t: result.timestamp,
                    o: quote.open,
                    h: quote.high,
                    l: quote.low,
                    c: quote.close
                  };
                }
              }
            } catch (yahooErr) {
              console.warn("Yahoo proxy failed, will fallback to Finnhub", yahooErr);
            }

            // Attempt 2: Finnhub API (Requires API Key on client side)
            if (!mappedData) {
              try {
                const apiKey = localStorage.getItem('FINNHUB_API_KEY');
                if (apiKey) {
                  const to = Math.floor(Date.now() / 1000);
                  const from = to - (365 * 24 * 60 * 60); // Last 1 year
                  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;
                  const finnhubRes = await fetch(url);
                  if (finnhubRes.ok) {
                    const finnhubData = await finnhubRes.json();
                    if (finnhubData && finnhubData.s === 'ok') {
                      mappedData = finnhubData;
                    }
                  }
                }
              } catch (finnhubErr) {
                console.warn("Finnhub fallback failed", finnhubErr);
              }
            }

            // Apply data if we got it from any source
            if (mappedData) {
              setCandleData(mappedData);
            } else {
              console.warn("Could not fetch candle data from any source. Chart will remain empty.");
            }
          } catch (e) {
            console.error("Critical failure during candle fetch", e);
            // DO NOT call setError here! It will break the Invest page.
          }
        }

        // Check price movement
        if (prevPriceRef.current !== null) {
          if (payload.c > prevPriceRef.current) {
            setFlashDirection('up');
          } else if (payload.c < prevPriceRef.current) {
            setFlashDirection('down');
          }
        }
        prevPriceRef.current = payload.c;

        setData(payload);
        setLastUpdated(new Date());
        addTelemetryLog(`Successfully received payload for ${ticker} (c: ${payload.c}, dp: ${payload.dp}%)`);
      } catch (err) {
        setData(null);
        setCandleData(null);
        setError(err.message);
        addTelemetryLog(`Error fetching ${ticker}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Run first time
    fetchData(true);

    // Fluctuations/Fetches every 5 seconds
    intervalId = setInterval(() => fetchData(false), 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [ticker]);

  // Reset flash direction after 300ms
  useEffect(() => {
    if (flashDirection) {
      const timer = setTimeout(() => {
        setFlashDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [flashDirection]);

  // Prevent ghost chart flashing: if ticker changed, return loading state instantly before useEffect fires
  const isStale = prevTickerRef.current !== ticker;
  useEffect(() => {
    prevTickerRef.current = ticker;
  }, [ticker]);

  if (isStale) {
    return { data: null, candleData: null, loading: true, error: null, lastUpdated: null, flashDirection: null, telemetryLogs };
  }

  return { data, candleData, loading, error, lastUpdated, flashDirection, telemetryLogs };
}
