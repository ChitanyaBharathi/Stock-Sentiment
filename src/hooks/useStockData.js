import { useState, useEffect, useRef } from 'react';

// Pre-defined base data for mock tickers so that the simulation feels realistic.
const MOCK_BASE_DATA = {
  AAPL: { c: 186.60, pc: 184.15, h: 187.25, l: 184.10, o: 185.00 },
  TSLA: { c: 179.20, pc: 182.10, h: 183.40, l: 177.60, o: 181.80 },
  NVDA: { c: 875.12, pc: 860.01, h: 884.80, l: 859.20, o: 863.00 },
};

export function useStockData(ticker) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flashDirection, setFlashDirection] = useState(null); // 'up', 'down', or null
  const prevPriceRef = useRef(null);
  const telemetryLogsRef = useRef([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  // Load API key from localStorage if available
  const apiKey = localStorage.getItem('FINNHUB_API_KEY') || 'd938suhr01qq79pbn790d938suhr01qq79pbn79g';

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
      const currentApiKey = localStorage.getItem('FINNHUB_API_KEY') || 'd938suhr01qq79pbn790d938suhr01qq79pbn79g';
      if (currentApiKey) {
        // Real API implementation
        try {
          addTelemetryLog(`Fetching live quote for ${ticker} from Finnhub API...`);
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${currentApiKey}`);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const payload = await res.json();
          
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
      } else {
        setError('API_KEY_REQUIRED');
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
  }, [ticker, apiKey]);

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
