import { useState, useEffect, useRef } from 'react';
import { Search, Settings, Loader2, TrendingUp } from 'lucide-react';

const POPULAR_EQUITIES = [
  { symbol: 'AAPL', description: 'Apple Inc', type: 'Common Stock' },
  { symbol: 'TSLA', description: 'Tesla Inc', type: 'Common Stock' },
  { symbol: 'NVDA', description: 'NVIDIA Corp', type: 'Common Stock' },
  { symbol: 'GOOGL', description: 'Alphabet Inc (Google)', type: 'Common Stock' },
  { symbol: 'MSFT', description: 'Microsoft Corporation', type: 'Common Stock' },
  { symbol: 'AMZN', description: 'Amazon.com Inc', type: 'Common Stock' },
  { symbol: 'META', description: 'Meta Platforms Inc', type: 'Common Stock' },
  { symbol: 'SOUN', description: 'SoundHound AI Inc', type: 'Common Stock' },
  { symbol: 'SLV', description: 'iShares Silver Trust', type: 'ETF' },
  { symbol: 'AMD', description: 'Advanced Micro Devices', type: 'Common Stock' },
];

const COMPANY_NAMES = {
  AAPL: 'Apple Inc',
  TSLA: 'Tesla Inc',
  NVDA: 'NVIDIA Corp',
  GOOGL: 'Alphabet Inc (Google)',
  MSFT: 'Microsoft Corporation',
  AMZN: 'Amazon.com Inc',
};

export default function Navbar({ onSearch, isFetching, hasError, activeTicker, activeSidebarItem = 'Invest', profileName = 'Trader' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_FINNHUB_API_KEY || localStorage.getItem('FINNHUB_API_KEY') || '');

  const dropdownRef = useRef(null);

  // Debounced search lookup
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const handler = setTimeout(async () => {
      let searchMatches = [];

      // 1. Try Finnhub Search API if token exists
      const effectiveKey = import.meta.env.VITE_FINNHUB_API_KEY || localStorage.getItem('FINNHUB_API_KEY');
      if (effectiveKey) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(trimmed)}&token=${effectiveKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data.result && data.result.length > 0) {
              searchMatches = data.result
                .filter(item => !item.symbol.includes('.')) // filter out foreign tickers if needed
                .slice(0, 7)
                .map(item => ({
                  symbol: item.symbol,
                  description: item.description,
                  type: item.type || 'Equities Asset'
                }));
            }
          }
        } catch (e) {
          console.warn("Finnhub search lookup error", e);
        }
      }

      // 2. Fallback / supplementary local matching if Finnhub API returned empty or no key
      if (searchMatches.length === 0) {
        const qUpper = trimmed.toUpperCase();
        searchMatches = POPULAR_EQUITIES.filter(
          item => item.symbol.includes(qUpper) || item.description.toUpperCase().includes(qUpper)
        );
      }

      setResults(searchMatches);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSymbol = (symbol) => {
    onSearch(symbol);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelectSymbol(results[0].symbol);
    } else if (query.trim()) {
      // Validate query matches popular tickers or format
      const qUpper = query.trim().toUpperCase();
      handleSelectSymbol(qUpper);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('FINNHUB_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('FINNHUB_API_KEY');
    }
    setShowSettings(false);
    window.location.reload();
  };

  const activeMode = (import.meta.env.VITE_FINNHUB_API_KEY || localStorage.getItem('FINNHUB_API_KEY')) ? 'LIVE API' : 'MOCK ENGINE';
  const companyName = COMPANY_NAMES[activeTicker] || `${activeTicker} Equities`;

  return (
    <header className="w-full bg-[#0C0C0E]/50 backdrop-blur-md border-b border-brandBorder py-4 px-8 flex justify-between items-center select-none sticky top-0 z-40">
      
      {/* Left Breadcrumb */}
      <div className="flex items-center space-x-2 font-sans text-sm">
        <span className="text-brandText/40 hover:text-brandText/70 cursor-pointer transition-colors">
          {activeSidebarItem === 'Invest' ? 'Invest' : 'App'}
        </span>
        <span className="text-brandText/30 font-mono text-xs">/</span>
        <span className="text-white font-semibold">
          {activeSidebarItem === 'Invest' ? companyName : activeSidebarItem}
        </span>
      </div>

      {/* Center Search Pill with Autocomplete Dropdown */}
      <div ref={dropdownRef} className="relative max-w-sm w-full mx-6">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or company (e.g. Apple, TSLA)..."
            className="w-full bg-[#18181B] border border-white/10 rounded-full py-2 pl-10 pr-9 font-sans text-xs focus:outline-none focus:border-white/30 focus:bg-[#202024] transition-all placeholder:text-brandText/30 text-white"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brandText/30" />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-2.5 w-4 h-4 text-brandText/40 animate-spin" />
          )}
        </form>

        {/* Autocomplete Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#161619] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
            {isSearching ? (
              <div className="p-4 text-center font-mono text-xs text-brandText/40 flex items-center justify-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching market symbols...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                <div className="px-4 py-2 bg-white/[0.02] text-[10px] font-mono text-brandText/40 uppercase tracking-widest flex justify-between">
                  <span>Matching Symbols ({results.length})</span>
                  <span>Press Enter to select top</span>
                </div>
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelectSymbol(item.symbol)}
                    className="w-full px-4 py-3 hover:bg-white/5 transition-all flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-white group-hover:border-white/30 transition-all">
                        {item.symbol.substring(0, 3)}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white group-hover:text-brandAccent transition-colors">
                          {item.symbol}
                        </div>
                        <div className="text-[11px] text-brandText/60 truncate max-w-[180px]">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-brandText/40 uppercase tracking-wider">
                      {item.type || 'Stock'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center space-y-1">
                <div className="font-mono text-xs font-semibold text-brandText/60">No stock tickers found for "{query}"</div>
                <p className="text-[10px] text-brandText/40">Try searching for popular symbols like AAPL, TSLA, NVDA, or GOOGL</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-5">
        
        {/* API status dot */}
        <div className="flex items-center space-x-2 cursor-help" title={`Running on ${activeMode}`}>
          <div className="relative flex h-2 w-2">
            {isFetching && !hasError && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandAccent opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                hasError ? 'bg-red-500' : 'bg-brandAccent'
              }`}
            />
          </div>
        </div>

        {/* Profile block */}
        <div className="flex items-center space-x-2.5">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" 
            alt={profileName}
            className="w-7 h-7 rounded-full object-cover border border-white/10"
          />
          <span className="font-sans text-xs font-semibold text-brandText/80 hidden sm:inline-block">
            {profileName}
          </span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-all text-brandText/50 hover:text-white"
          title="Configure API Token"
        >
          <Settings className="w-4 h-4" />
        </button>

      </div>

      {/* Settings Modal overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161619] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative text-left">
            <h3 className="font-sans font-bold text-lg mb-2 text-white">
              API Configuration
            </h3>
            <p className="text-xs text-brandText/60 mb-4 font-sans leading-relaxed">
              Paste your Finnhub Token below for live market rates. If empty, the terminal runs on a hyper-realistic mock simulator.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-[10px] font-mono tracking-wider text-brandText/70 uppercase">
                Finnhub API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Token string..."
                className="w-full bg-[#0C0C0E] border border-white/10 rounded-lg py-2 px-3 font-mono text-xs text-white focus:outline-none focus:border-white/35"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-white/10 rounded-lg text-xs font-mono text-brandText/60 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-mono font-bold hover:bg-white/90 transition-all"
              >
                Save & Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
