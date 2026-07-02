import { useEffect, useState, useRef } from 'react';
import { useStockData } from './hooks/useStockData';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomChart from './components/CustomChart';
import VolatilityMeter from './components/VolatilityMeter';
import TelemetryFeed from './components/TelemetryFeed';
import Watchlist from './components/Watchlist';
import SupabaseSetup from './components/SupabaseSetup';
import AuthView from './components/AuthView';
import { supabase, hasSupabaseConfig } from './lib/supabaseClient';
import { 
  Bell, 
  Star, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  CreditCard,
  LogOut,
  Monitor
} from 'lucide-react';
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
  // Configuration guards
  if (!hasSupabaseConfig) {
    return <SupabaseSetup />;
  }

  // Auth States
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Watchlist & UI States
  const [tickers, setTickers] = useState(['AAPL', 'TSLA', 'NVDA']);
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Home');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  
  // Settings & forms state
  const [settingsApiKey, setSettingsApiKey] = useState(import.meta.env.VITE_FINNHUB_API_KEY || localStorage.getItem('FINNHUB_API_KEY') || '');
  const [walletAmount, setWalletAmount] = useState('');
  const [transferForm, setTransferForm] = useState({ asset: 'USD', destination: '', amount: '' });
  const [personalForm, setPersonalForm] = useState({ name: '', email: '', account: 'Premium Quant Partner' });

  const { data, loading, error, flashDirection, telemetryLogs } = useStockData(activeTicker);

  const containerRef = useRef(null);

  // Listen for Supabase session changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Supabase Database details
  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setPersonalForm({
        name: data.name || '',
        email: data.email || '',
        account: 'VIP Quant Trader (Database Synced)'
      });
    }
  };

  const fetchWatchlist = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('watchlists')
      .select('ticker')
      .eq('user_id', session.user.id);

    if (data && data.length > 0) {
      setTickers(data.map(item => item.ticker));
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchWatchlist();
    }
  }, [session]);

  // Sync Star watchlist state
  useEffect(() => {
    setIsStarred(tickers.includes(activeTicker));
  }, [activeTicker, tickers]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (authLoading || !session) return;
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
  }, [activeSidebarItem, authLoading, session]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0C0C0E] flex items-center justify-center font-mono text-xs text-brandText/40">
        INITIALIZING SECURITY SOC TUNNELS...
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  // Handle new stock searches
  const handleSearch = async (newTicker) => {
    if (!tickers.includes(newTicker)) {
      setTickers([...tickers, newTicker]);
      // Insert to Supabase DB Watchlist
      await supabase
        .from('watchlists')
        .insert({ user_id: session.user.id, ticker: newTicker });
    }
    setActiveTicker(newTicker);
    setActiveSidebarItem('Invest');
  };

  // Toggle watchlist star status
  const handleToggleStar = async () => {
    if (!session?.user?.id) return;

    if (isStarred) {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', session.user.id)
        .eq('ticker', activeTicker);

      if (!error) {
        setIsStarred(false);
        fetchWatchlist();
      }
    } else {
      const { error } = await supabase
        .from('watchlists')
        .insert({ user_id: session.user.id, ticker: activeTicker });

      if (!error) {
        setIsStarred(true);
        fetchWatchlist();
      }
    }
  };

  // Deposit funds to Supabase profiles
  const handleDepositCash = async (amount) => {
    if (!session?.user?.id || !profile) return;
    const numVal = parseFloat(amount);
    if (isNaN(numVal) || numVal <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    const nextBalance = parseFloat(profile.balance || 0) + numVal;
    const { error } = await supabase
      .from('profiles')
      .update({ balance: nextBalance })
      .eq('id', session.user.id);

    if (!error) {
      setProfile({ ...profile, balance: nextBalance });
      setWalletAmount('');
      alert(`Deposit of $${numVal.toLocaleString()} completed successfully!`);
    } else {
      alert(`Transaction failed: ${error.message}`);
    }
  };

  // Save profile edits to database
  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: personalForm.name, email: personalForm.email })
      .eq('id', session.user.id);

    if (!error) {
      alert('Profile details synced to Cloud database!');
      fetchProfile();
    } else {
      alert(`Save failed: ${error.message}`);
    }
  };

  const handleSaveApiKey = (key) => {
    if (key.trim()) {
      localStorage.setItem('FINNHUB_API_KEY', key.trim());
      window.location.reload();
    }
  };

  const handleLogoutReset = async () => {
    await supabase.auth.signOut();
  };

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

  // Views Renders
  const renderHome = () => (
    <div className="reveal-content space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-white/[0.03] to-transparent p-8 rounded-3xl border border-brandBorder">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {profile?.name || 'James'}.</h2>
        <p className="text-xs text-brandText/45 mt-1">Here is your market tracking overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-[#131316] border border-brandBorder p-6 rounded-3xl space-y-4">
          <div>
            <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">Available Portfolio Balance</span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1.5 block">
              ${profile ? parseFloat(profile.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-brandAccent font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+$120.50 today (+0.48%)</span>
          </div>
        </div>

        {/* Quant Level */}
        <div className="bg-[#131316] border border-brandBorder p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block font-bold">Quant Credentials</span>
            <span className="text-lg font-bold text-white tracking-tight mt-1.5 block">Level 1 Security clearance</span>
          </div>
          <span className="text-[10px] font-mono text-brandText/30 uppercase tracking-wider block mt-4">USER ID: {session?.user?.id.substring(0, 10)}...</span>
        </div>

        {/* Live status */}
        <div className="bg-[#131316] border border-brandBorder p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">Finnhub API Status</span>
            <span className="text-lg font-bold text-brandAccent tracking-tight mt-1.5 block flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brandAccent animate-pulse" />
              <span>Connected & Streaming</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-brandText/30 uppercase tracking-wider block mt-4">TOKEN STATUS: OPERATIONAL</span>
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="pt-2">
        <Watchlist 
          tickers={tickers} 
          activeTicker={activeTicker} 
          onSelectTicker={(ticker) => {
            setActiveTicker(ticker);
            setActiveSidebarItem('Invest');
          }} 
        />
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="reveal-content space-y-6 text-left max-w-2xl">
      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-4">
        <div>
          <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">Wallet Cash Balance</span>
          <span className="text-4xl font-extrabold text-white tracking-tight mt-1.5 block">
            ${profile ? parseFloat(profile.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'}
          </span>
        </div>
        <p className="text-xs text-brandText/45 leading-relaxed">
          Deposit cash to buy stocks, or withdraw funds directly to your verified bank account.
        </p>
      </div>

      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deposit Cash</h3>
        
        <div className="flex gap-3">
          <input
            type="number"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
            placeholder="Enter deposit amount ($)..."
            className="flex-1 bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-white/20 transition-all"
          />
          <button
            onClick={() => handleDepositCash(walletAmount)}
            className="px-6 py-3 bg-white text-black font-sans font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
          >
            Deposit Funds
          </button>
        </div>
      </div>

      {/* Linked Accounts */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">Linked bank accounts</span>
        
        <div className="bg-[#131316] border border-brandBorder p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brandText/70" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Wells Fargo checking</h4>
              <p className="text-[10px] font-mono text-brandText/40 mt-0.5">•••• •••• •••• 4892</p>
            </div>
          </div>
          <span className="bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">VERIFIED</span>
        </div>
      </div>
    </div>
  );

  const renderPersonal = () => (
    <div className="reveal-content space-y-6 text-left max-w-2xl">
      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Profile Details</h3>
          <p className="text-xs text-brandText/45 mt-1">Manage your verified credentials loaded from Supabase Auth.</p>
        </div>

        <div className="space-y-4 font-sans text-xs">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Full Name</label>
            <input 
              type="text"
              value={personalForm.name}
              onChange={(e) => setPersonalForm({...personalForm, name: e.target.value})}
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Email Address</label>
            <input 
              type="email"
              value={personalForm.email}
              onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Account level */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Account Clearance Level</label>
            <input 
              type="text"
              value={personalForm.account}
              disabled
              className="w-full bg-[#0C0C0E] border border-white/5 rounded-xl px-4 py-3 text-brandText/40 cursor-not-allowed font-semibold animate-pulse"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );

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
          hasError={!!error && error !== 'API_KEY_REQUIRED'}
          activeTicker={activeTicker}
          activeSidebarItem={activeSidebarItem}
          profileName={profile?.name || session?.user?.user_metadata?.name || 'James Gandolfini'}
        />

        {/* Content Wrapper */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-8 py-8 space-y-6">
          
          {/* Render Active View */}
          {activeSidebarItem === 'Home' && renderHome()}
          {activeSidebarItem === 'Wallet' && renderWallet()}
          {activeSidebarItem === 'Transfer' && renderTransfer()}
          {activeSidebarItem === 'Shop' && renderShop()}
          {activeSidebarItem === 'Personal' && renderPersonal()}
          {activeSidebarItem === 'Settings' && (
            <div className="reveal-content space-y-6 text-left max-w-2xl">
              <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Settings & API Configuration</h3>
                  <p className="text-xs text-brandText/45 mt-1">Configure your Finnhub developers tokens directly inside the dashboard panel.</p>
                </div>
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Finnhub API Key</label>
                    <input 
                      type="password"
                      value={settingsApiKey}
                      onChange={(e) => setSettingsApiKey(e.target.value)}
                      placeholder="Paste token string..."
                      className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 font-mono text-white focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleSaveApiKey(settingsApiKey);
                      alert('Settings saved successfully!');
                    }}
                    className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
                  >
                    Save Token
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeSidebarItem === 'Sessions' && (
            <div className="reveal-content space-y-6 text-left max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Active Credentials Sessions</h2>
                <p className="text-xs text-brandText/45 mt-1">Review active logged sessions connected to your profile.</p>
              </div>
              <div className="space-y-3">
                <div className="bg-[#131316] border border-brandBorder p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-brandText/70" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Vite Client Session — active</h4>
                      <p className="text-[10px] font-mono text-brandText/40 mt-0.5">USER EMAIL: {session?.user?.email}</p>
                    </div>
                  </div>
                  <span className="bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">ACTIVE NOW</span>
                </div>
              </div>
            </div>
          )}
          {activeSidebarItem === 'Logout' && (
            <div className="reveal-content text-left max-w-sm mx-auto pt-12">
              <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-6 text-center shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                  <LogOut className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sign Out of Terminal</h3>
                  <p className="text-xs text-brandText/50 mt-1.5 leading-relaxed">
                    Clicking sign out will end your secure Supabase session.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleLogoutReset}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-500/10"
                  >
                    Disconnect Session
                  </button>
                  <button
                    onClick={() => setActiveSidebarItem('Home')}
                    className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 text-brandText/70 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invest View (Main stock trading dashboard) */}
          {activeSidebarItem === 'Invest' && (
            <div className="space-y-6">
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

                  <button 
                    onClick={handleToggleStar}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isStarred 
                        ? 'bg-white/10 text-yellow-400 border-white/20' 
                        : 'bg-[#131316] text-brandText/50 border-brandBorder hover:text-white hover:border-white/10'
                    }`}
                    title="Add to Watchlist"
                  >
                    <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
                  </button>

                  <button 
                    onClick={() => alert(`Sell order initialized for ${activeTicker}`)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold bg-transparent text-white hover:bg-white/[0.04] transition-all"
                  >
                    Sell {meta.name.split(' ')[0]}
                  </button>

                  <button 
                    onClick={() => alert(`Invest order initialized for ${activeTicker}`)}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-white/90 shadow-md transition-all flex items-center space-x-1"
                  >
                    <span>Invest {meta.name.split(' ')[0]}</span>
                  </button>
                </div>

              </div>

              {/* Generic Fetch Error Alert */}
              {error && error !== 'API_KEY_REQUIRED' && (
                <div className="reveal-content flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Failed to fetch stock data: <strong>{error}</strong>. Please verify your internet connection or Finnhub token validity.</span>
                </div>
              )}

              {/* Conditional Layout: Activation vs. Main Dashboard */}
              {error === 'API_KEY_REQUIRED' ? (
                <div className="reveal-content bg-[#131316] border border-brandBorder rounded-3xl p-8 max-w-2xl mx-auto text-left space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white">Activate Live Market Stream</h2>
                    <p className="text-xs text-brandText/50 mt-1.5 leading-relaxed">
                      To load live quotes and dynamic historical line charts, please link a free Finnhub API Key.
                    </p>
                  </div>

                  <div className="space-y-3 font-sans text-xs text-brandText/70">
                    <div className="flex items-start space-x-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white font-mono font-bold text-[10px]">1</span>
                      <p className="pt-0.5">
                        Sign up for a free developer account at <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-brandAccent underline font-semibold hover:text-brandAccent/80">finnhub.io</a>
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white font-mono font-bold text-[10px]">2</span>
                      <p className="pt-0.5">Locate and copy your API Token from the dashboard landing page.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white font-mono font-bold text-[10px]">3</span>
                      <p className="pt-0.5">Paste the token string below to initialize your quant terminal.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="password"
                      value={settingsApiKey}
                      onChange={(e) => setSettingsApiKey(e.target.value)}
                      placeholder="Paste your Finnhub API Token here..."
                      className="flex-1 bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-white/20 transition-all"
                    />
                    <button
                      onClick={() => handleSaveApiKey(settingsApiKey)}
                      className="px-6 py-3 bg-white text-black font-sans font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md whitespace-nowrap"
                    >
                      Activate Live Stream
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

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
