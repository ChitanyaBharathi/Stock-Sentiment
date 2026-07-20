import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';



export function useStockData(ticker) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flashDirection, setFlashDirection] = useState(null); // 'up', 'down', or null
  const prevPriceRef = useRef(null);
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

    let intervalId;

    const fetchData = async () => {
      // Real API implementation via secure Edge Function
      try {
        addTelemetryLog(`Requesting quote for ${ticker} from secure Edge Function...`);
        const { data: payload, error: fnError } = await supabase.functions.invoke('get-stock', {
          body: { ticker }
        });
        
        if (fnError) {
          throw new Error(`Edge Function error: ${fnError.message}`);
        }
        
        if (!payload || payload.error) {
           throw new Error(payload?.error || 'Unknown server error');
        }
        
        if (payload.c === 0 && payload.pc === 0) {
          throw new Error(`Symbol "${ticker}" not found.`);
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
        setError(err.message);
        addTelemetryLog(`Error fetching ${ticker}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Run first time
    fetchData();

    // Fluctuations/Fetches every 5 seconds
    intervalId = setInterval(fetchData, 5000);

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

  return { data, loading, error, lastUpdated, flashDirection, telemetryLogs };
}
