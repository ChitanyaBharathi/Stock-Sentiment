import { useState } from 'react';
import { Search, Settings } from 'lucide-react';

const COMPANY_NAMES = {
  AAPL: 'Apple Inc',
  TSLA: 'Tesla Inc',
  NVDA: 'NVIDIA Corp',
};

export default function Navbar({ onSearch, isFetching, hasError, activeTicker, activeSidebarItem = 'Invest' }) {
  const [query, setQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('FINNHUB_API_KEY') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim().toUpperCase());
      setQuery('');
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

  const activeMode = localStorage.getItem('FINNHUB_API_KEY') ? 'LIVE API' : 'MOCK ENGINE';
  const companyName = COMPANY_NAMES[activeTicker] || `${activeTicker} Corp`;

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

      {/* Center Search Pill */}
      <form onSubmit={handleSubmit} className="relative max-w-sm w-full mx-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search"
          className="w-full bg-[#18181B] border border-white/5 rounded-full py-2 pl-10 pr-4 font-sans text-xs focus:outline-none focus:border-white/20 focus:bg-[#202024] transition-all placeholder:text-brandText/30 text-white"
        />
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brandText/30" />
      </form>

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
            alt="James Gandolfini" 
            className="w-7 h-7 rounded-full object-cover border border-white/10"
          />
          <span className="font-sans text-xs font-semibold text-brandText/80 hidden sm:inline-block">
            James Gandolfini
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
