import { useEffect, useState, useRef } from 'react';
import { useStockData } from './hooks/useStockData';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomChart from './components/CustomChart';
import VolatilityMeter from './components/VolatilityMeter';
import TelemetryFeed from './components/TelemetryFeed';
import { Bell, Star, ArrowUpRight, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

const COMPANY_META = {
  AAPL: {
    name: 'Apple Inc',
    sector: 'Technology',
    desc: 'Apple is a multinational big tech company based in California and is famous for its iPhones and PCs. Apple\'s stock price is in USD. Yahoo! Finance',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.05-1.05.04-2.31.7-3.07 1.59-.66.77-1.23 1.91-1.11 3 .95.12 2.19-.54 2.97-1.54z" />
      </svg>
    )
  },
  TSLA: {
    name: 'Tesla Inc',
    sector: 'Automotive',
    desc: 'Tesla, Inc. is an American multinational automotive and clean energy company headquartered in Austin, Texas. Tesla designs, manufactures, and sells electric vehicles, energy storage, and solar panels.',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4H8V9h2V7c0-1.1.9-2 2-2s2 .9 2 2v2h2v3h-3v4z" />
      </svg>
    )
  },
  NVDA: {
    name: 'NVIDIA Corp',
    sector: 'Technology',
    desc: 'NVIDIA Corporation is an American multinational technology company based in Santa Clara, California. It designs graphics processing units (GPUs) for the gaming and professional markets, as well as system on a chip units.',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.11 12.35l-2.61-1.51c-.3-.17-.5-.5-.5-.84V8.98c0-.34.2-.67.5-.84l2.61-1.51c.3-.17.7-.17 1 .01l2.61 1.51c.3.17.5.5.5.84v3.01c0 .34-.2.67-.5.84l-2.61 1.51c-.3.18-.7.18-1 .01z" />
      </svg>
    )
  }
};

export default function App() {
  const [tickers, setTickers] = useState(['AAPL', 'TSLA', 'NVDA']);
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Invest');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const { data, loading, error, flashDirection, telemetryLogs } = useStockData(activeTicker);

  const containerRef = useRef(null);

  const handleSearch = (newTicker) => {
    if (!tickers.includes(newTicker)) {
      setTickers([...tickers, newTicker]);
    }
    setActiveTicker(newTicker);
  };

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reveal-sidebar',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.reveal-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: 'power3.out', stagger: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const meta = COMPANY_META[activeTicker] || {
    name: `${activeTicker} Equities`,
    sector: 'Equities',
    desc: `Financial market telemetry stream for ${activeTicker} asset. Quotes are updated in real-time.`,
    logo: (
      <span className="text-white font-extrabold text-sm tracking-tighter">
        {activeTicker.substring(0, 2)}
      </span>
    )
  };

  const isPositive = data ? data.dp >= 0 : true;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0C0C0E] text-brandText flex overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Left Sidebar */}
      <div className="reveal-sidebar opacity-0 hidden md:block">
        <Sidebar activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} />
      </div>

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Navbar
          onSearch={handleSearch}
          isFetching={loading}
          hasError={!!error}
          activeTicker={activeTicker}
        />

        {/* Content Wrapper */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-8 py-8 space-y-6">
          
          {/* Header Title / Detail Block */}
          <div className="reveal-content opacity-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            
            {/* Asset Identity */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#18181B] border border-white/10 flex items-center justify-center shadow-md">
                {meta.logo}
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  {meta.name}
                </h1>
                <p className="text-xs text-brandText/40 font-mono mt-0.5 uppercase tracking-wider">
                  {activeTicker} · {meta.sector}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2.5">
              {/* Alert Toggle */}
              <button 
                onClick={() => setIsAlertActive(!isAlertActive)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isAlertActive 
                    ? 'bg-white/10 text-white border-white/20' 
                    : 'bg-[#131316] text-brandText/50 border-brandBorder hover:text-white hover:border-white/10'
                }`}
                title="Toggle Price Alerts"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Star/Watch Toggle */}
              <button 
                onClick={() => setIsStarred(!isStarred)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isStarred 
                    ? 'bg-white/10 text-yellow-400 border-white/20' 
                    : 'bg-[#131316] text-brandText/50 border-brandBorder hover:text-white hover:border-white/10'
                }`}
                title="Add to Watchlist"
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
              </button>

              {/* Sell Button */}
              <button 
                onClick={() => alert(`Sell order initialized for ${activeTicker}`)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold bg-transparent text-white hover:bg-white/[0.04] transition-all"
              >
                Sell {meta.name.split(' ')[0]}
              </button>

              {/* Invest Button */}
              <button 
                onClick={() => alert(`Invest order initialized for ${activeTicker}`)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-white/90 shadow-md transition-all flex items-center space-x-1"
              >
                <span>Invest {meta.name.split(' ')[0]}</span>
              </button>
            </div>

          </div>

          {/* Main Chart Section */}
          <div className="reveal-content opacity-0">
            <CustomChart 
              ticker={activeTicker}
              currentPrice={data?.c}
              priceChange={data?.d}
              percentChange={data?.dp}
              isPositive={isPositive}
            />
          </div>

          {/* Detailed Tab System */}
          <div className="reveal-content opacity-0 space-y-4 pt-2">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-brandBorder pb-2 space-x-6">
              {['Overview', 'Markets', 'Alerts', 'History'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs font-semibold relative transition-colors ${
                    activeTab === tab 
                      ? 'text-white' 
                      : 'text-brandText/45 hover:text-white/80'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Viewport */}
            <div className="text-left min-h-[160px]">
              
              {activeTab === 'Overview' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Details</h3>
                  <p className="text-xs text-brandText/60 leading-relaxed font-sans max-w-2xl">
                    {meta.desc}
                  </p>
                </div>
              )}

              {activeTab === 'Markets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <VolatilityMeter data={data} ticker={activeTicker} />
                  
                  {/* Market Stats Grid */}
                  <div className="bg-[#131316] border border-brandBorder rounded-3xl p-6 grid grid-cols-2 gap-4 h-[180px]">
                    <div>
                      <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-widest">Open Price</span>
                      <span className="font-mono text-base font-bold text-white mt-1 block">${data ? data.o.toFixed(2) : '---'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-widest">Prev Close</span>
                      <span className="font-mono text-base font-bold text-white mt-1 block">${data ? data.pc.toFixed(2) : '---'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-widest">Day High</span>
                      <span className="font-mono text-base font-bold text-brandAccent mt-1 block">${data ? data.h.toFixed(2) : '---'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-widest">Day Low</span>
                      <span className="font-mono text-base font-bold text-red-500 mt-1 block">${data ? data.l.toFixed(2) : '---'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Alerts' && (
                <div className="space-y-4">
                  <TelemetryFeed logs={telemetryLogs} />
                </div>
              )}

              {activeTab === 'History' && (
                <div className="bg-[#131316] border border-brandBorder rounded-3xl overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-[#1A1A1E] text-brandText/45 border-b border-brandBorder">
                        <th className="p-4 uppercase tracking-wider font-semibold">Activity</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Quantity</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Price</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brandBorder">
                      <tr className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 flex items-center space-x-2 text-white">
                          <ArrowUpRight className="w-4 h-4 text-brandAccent" />
                          <span>Buy {activeTicker}</span>
                        </td>
                        <td className="p-4 text-brandText/70">12 Shares</td>
                        <td className="p-4 text-brandText/70">${data ? (data.c * 12).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '---'}</td>
                        <td className="p-4">
                          <span className="bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 rounded-full text-[10px] font-bold">COMPLETED</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 flex items-center space-x-2 text-white">
                          <ArrowUpRight className="w-4 h-4 text-brandAccent" />
                          <span>Buy {activeTicker}</span>
                        </td>
                        <td className="p-4 text-brandText/70">4 Shares</td>
                        <td className="p-4 text-brandText/70">${data ? (data.c * 4).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '---'}</td>
                        <td className="p-4">
                          <span className="bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 rounded-full text-[10px] font-bold">COMPLETED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </main>

        {/* Custom footer */}
        <footer className="w-full max-w-5xl mx-auto px-6 md:px-8 py-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-brandText/30 mt-auto select-none">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brandAccent" />
            <span>SOCKET SECURITY SH-256 ACTIVE</span>
          </div>
          <span>© {new Date().getFullYear()} SENTIMETER QUANT LABS.</span>
        </footer>
      </div>
    </div>
  );
}
