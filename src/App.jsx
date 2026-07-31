import { useEffect, useState, useRef } from 'react';
import { useStockData } from './hooks/useStockData';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomChart from './components/CustomChart';
import VolatilityMeter from './components/VolatilityMeter';
import Watchlist from './components/Watchlist';
import TickerCarousel from './components/TickerCarousel';
import SupabaseSetup from './components/SupabaseSetup';
import AuthView from './components/AuthView';

import { useStockSentiment } from "./hooks/useStockSentiment";
import SentimentWidget from "./components/SentimentWidget";
import { supabase, hasSupabaseConfig } from './lib/supabaseClient';
import {
  Bell,
  Star,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  LogOut,
  Monitor,
  SearchX,
  Search,
  Loader2,
  Trash2
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
  },
  GOOGL: {
    name: 'Alphabet Inc (Google)',
    sector: 'Technology',
    desc: 'Alphabet Inc. is an American multinational technology conglomerate holding company created through a restructuring of Google. It is the world\'s third-largest technology company by revenue.',
    logo: (
      <span className="text-white font-extrabold text-xs">GOOG</span>
    )
  }
};

function MainApp() {
  // Auth States
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Watchlist & UI States
  const [tickers, setTickers] = useState(['AAPL', 'TSLA', 'NVDA']);
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [_activeTab, _setActiveTab] = useState('Overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Home');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [_timeRange, _setTimeRange] = useState('1Y');

  // Forms state and toast
  const [toast, setToast] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [transferForm, setTransferForm] = useState({ asset: 'USD', destination: '', amount: '' });
  const [personalForm, setPersonalForm] = useState({ name: '', email: '', account: 'Premium Quant Partner' });

  const { data, loading, error } = useStockData(activeTicker);
  const { sentimentData, loading: sentimentLoading } = useStockSentiment(activeTicker);

  const containerRef = useRef(null);

  // Listen for Supabase session changes with failsafe
  useEffect(() => {
    let mounted = true;

    // Failsafe timer to guarantee app never hangs on black screen
    const timer = setTimeout(() => {
      if (mounted) setAuthLoading(false);
    }, 1200);

    supabase?.auth?.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setAuthLoading(false);
      }
    }).catch(() => {
      if (mounted) setAuthLoading(false);
    });

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setAuthLoading(false);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch Supabase Database details
  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

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
    const { data } = await supabase
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Sync Star watchlist state
  useEffect(() => {
    setIsStarred(tickers.includes(activeTicker));
  }, [activeTicker, tickers]);

  // Safe entrance animation without zeroing out content opacity
  useEffect(() => {
    if (authLoading || !session) return;
    const ctx = gsap.context(() => {
      gsap.from('.reveal-sidebar', { x: -20, opacity: 0.8, duration: 0.3, ease: 'power2.out' });
    }, containerRef);

    return () => ctx.revert();
  }, [authLoading, session]);

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
    const formatted = newTicker.trim().toUpperCase();
    
    setActiveTicker(formatted);
    setActiveSidebarItem('Invest');

    if (!tickers.includes(formatted)) {
      try {
        const { data: payload, error: fnError } = await supabase.functions.invoke('get-stock', {
          body: { ticker: formatted }
        });
        
        if (!fnError && payload && (payload.c !== 0 || payload.pc !== 0) && !payload.error) {
          setTickers(prev => [...prev, formatted]);
          if (session?.user?.id) {
            await supabase
              .from('watchlists')
              .insert({ user_id: session.user.id, ticker: formatted });
          }
        }
      } catch (err) {
        console.warn('Failed to validate ticker', err);
      }
    }
  };

  // Remove ticker from watchlist
  const handleRemoveTicker = async (tickerToRemove) => {
    const nextTickers = tickers.filter(t => t !== tickerToRemove);
    setTickers(nextTickers);

    if (session?.user?.id) {
      await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', session.user.id)
        .eq('ticker', tickerToRemove);
    }

    if (activeTicker === tickerToRemove) {
      if (nextTickers.length > 0) {
        setActiveTicker(nextTickers[0]);
      } else {
        setActiveTicker('AAPL');
      }
    }
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Deposit funds to Supabase profiles
  const handleDepositCash = async (amount) => {
    if (!session?.user?.id || !profile) return;
    const numVal = parseFloat(amount);
    if (isNaN(numVal) || numVal <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
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
      showToast(`Deposit of $${numVal.toLocaleString()} completed!`, 'success');
    } else {
      showToast(`Transaction failed: ${error.message}`, 'error');
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
      showToast('Profile details saved successfully!', 'success');
      fetchProfile();
    } else {
      showToast(`Save failed: ${error.message}`, 'error');
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
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {profile?.name || session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || 'Trader'}.</h2>
        <p className="text-xs text-brandText/45 mt-1">Here is your market tracking overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-[#141418] border-2 border-white/5 p-6 rounded-[10px] space-y-4 shadow-[0_0_25px_-5px_rgba(232,180,184,0.05)]">
          <div>
            <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider block font-semibold">Available Portfolio Balance</span>
            <span className="text-3xl font-serif text-white tracking-tight mt-1.5 block">
              ${profile ? parseFloat(profile.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#E0A96D] font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+$120.50 today (+0.48%)</span>
          </div>
        </div>

        {/* Market Trend / Sentiment Summary */}
        <div className="bg-[#141418] border-2 border-white/5 p-6 rounded-[10px] flex flex-col justify-between relative overflow-hidden shadow-[0_0_25px_-5px_rgba(232,180,184,0.05)]">
          {/* Subtle Rose Gold Glow behind */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E8B4B8]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider block font-semibold">Today's Market Trend</span>
            <span className="text-3xl font-serif text-white tracking-tight mt-1.5 block">
              Bullish Edge
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium z-10">
            <span className="bg-[#E8B4B8]/10 text-[#E8B4B8] border border-[#E8B4B8]/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">TECH SECTOR</span>
            <span className="text-neutral-400">High confidence (+68% Net Bull)</span>
          </div>
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
          onRemoveTicker={handleRemoveTicker}
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
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deposit Cash</h3>
          <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> VULNERABLE
          </span>
        </div>

        <p className="text-[10px] text-red-400 font-mono">
          WARNING: This functionality is currently executing entirely on the client, exposing a CWE-602 (Trust Boundary Violation).
          Do not deploy to production without migrating this logic to a backend RPC.
        </p>

        <div className="flex gap-3 mt-2">
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

  const renderTransfer = () => (
    <div className="reveal-content space-y-6 text-left max-w-2xl">
      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transfer Assets</h3>
          <p className="text-xs text-brandText/45 mt-1">Move cash or equities securely between linked profiles.</p>
        </div>

        <div className="space-y-4 font-sans text-xs">
          {/* Transfer Type */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Select Asset</label>
            <select
              value={transferForm.asset}
              onChange={(e) => setTransferForm({ ...transferForm, asset: e.target.value })}
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all font-mono"
            >
              <option value="USD">USD - Cash Balance</option>
              <option value="AAPL">AAPL - Apple Equities</option>
              <option value="TSLA">TSLA - Tesla Equities</option>
              <option value="NVDA">NVDA - NVIDIA Equities</option>
            </select>
          </div>

          {/* Target */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Destination Address / Email</label>
            <input
              type="text"
              value={transferForm.destination}
              onChange={(e) => setTransferForm({ ...transferForm, destination: e.target.value })}
              placeholder="e.g. transfer-id or verified email..."
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Amount / Shares count</label>
            <input
              type="number"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              placeholder="Amount..."
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all font-mono"
            />
          </div>

          <button
            onClick={() => {
              if (transferForm.destination && transferForm.amount) {
                showToast(`Transfer executed: ${transferForm.amount} ${transferForm.asset} to ${transferForm.destination}`, 'success');
                setTransferForm({ asset: 'USD', destination: '', amount: '' });
              }
            }}
            className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
          >
            Execute Transfer
          </button>
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="reveal-content space-y-6 text-left max-w-2xl">
      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quant Shop</h3>
          <p className="text-xs text-brandText/45 mt-1">Purchase premium algorithms and market data addons.</p>
        </div>
        <div className="flex items-center space-x-3 bg-brandBg/10 border border-brandBorder p-4 rounded-2xl text-xs text-brandText/50">
          <AlertTriangle className="w-4 h-4 text-brandAccent" />
          <span>Shop modules are currently offline in this environment.</span>
        </div>
      </div>
    </div>
  );

  const renderPersonal = () => (
    <div className="reveal-content space-y-6 text-left max-w-2xl">
      <div className="bg-[#131316] border border-brandBorder p-8 rounded-3xl space-y-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Profile Details</h3>
            <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              REQUIRES RLS
            </span>
          </div>
          <p className="text-xs text-brandText/45 mt-1">Manage your verified credentials loaded from Supabase Auth.</p>
          <p className="text-[10px] text-yellow-500/80 font-mono mt-2">
            SECURITY NOTE: Make sure Supabase Row-Level Security (RLS) is enabled on the `profiles` table to prevent unauthorized writes.
          </p>
        </div>

        <div className="space-y-4 font-sans text-xs">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              value={personalForm.name}
              onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brandText/40 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={personalForm.email}
              onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
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
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 flex items-center space-x-3 bg-[#1B1B1F] border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl animate-bounce text-xs font-sans">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${toast.type === 'error' ? 'bg-red-400' : toast.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

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
      <div className="reveal-sidebar hidden md:block">
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
          profileName={profile?.name || session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || 'Trader'}
        />

        {/* Scrolling Ticker */}
        <TickerCarousel />

        {/* Content Wrapper */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-8 py-8 space-y-6">

          {/* Render Active View */}
          {activeSidebarItem === 'Home' && renderHome()}
          {activeSidebarItem === 'Wallet' && renderWallet()}
          {activeSidebarItem === 'Transfer' && renderTransfer()}
          {activeSidebarItem === 'Shop' && renderShop()}
          {activeSidebarItem === 'Personal' && renderPersonal()}
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
              <div className="reveal-content flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4 border-b border-graphite">

                {/* Asset Identity */}
                <div className="text-left">
                  <h1 className="font-serif text-[88px] leading-none tracking-[0.01em] text-paper-white mb-2">
                    {meta.name.split(' ')[0]}
                  </h1>
                  <p className="text-eyebrow text-smoke uppercase font-semibold tracking-widest pl-1 mt-1">
                    {activeTicker} · {meta.sector}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => setIsAlertActive(!isAlertActive)}
                    className={`p-3 rounded-full border transition-all ${isAlertActive
                        ? 'bg-carbon text-paper-white border-graphite'
                        : 'bg-transparent text-fog border-graphite hover:text-paper-white hover:border-slate'
                      }`}
                    title="Toggle Price Alerts"
                  >
                    <Bell className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleStar}
                    className={`p-3 rounded-full border transition-all ${isStarred
                        ? 'bg-carbon text-copper border-copper/30'
                        : 'bg-transparent text-fog border-graphite hover:text-paper-white hover:border-slate'
                      }`}
                    title="Add to Watchlist"
                  >
                    <Star className={`w-4 h-4 ${isStarred ? 'fill-copper' : ''}`} />
                  </button>

                  <button
                    onClick={() => showToast(`Sell order initialized for ${activeTicker}`, 'info')}
                    className="px-6 py-3 rounded-full border border-graphite hover:border-slate text-sm font-medium bg-transparent text-paper-white transition-all"
                  >
                    Sell
                  </button>

                  <button
                    onClick={() => showToast(`Invest order initialized for ${activeTicker}`, 'info')}
                    className="px-8 py-3 rounded-full text-sm font-medium bg-paper-white text-obsidian hover:bg-bone transition-all"
                  >
                    Invest {activeTicker}
                  </button>
                </div>

              </div>

              {/* Conditional Layout: API Key required vs. Stock Fetch Error / Symbol Not Found vs. Main Dashboard */}
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
              ) : loading ? (
                <div className="reveal-content bg-[#131316] border border-brandBorder rounded-3xl p-12 max-w-xl mx-auto text-center space-y-6 shadow-2xl my-6 animate-fade-in backdrop-blur-md min-h-[400px] flex flex-col items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-brandText/30" />
                   <p className="text-xs text-brandText/50 font-mono mt-4">Retrieving market data for {activeTicker}...</p>
                </div>
              ) : (error || !data) ? (
                <div className="reveal-content bg-[#131316] border border-brandBorder rounded-3xl p-12 max-w-xl mx-auto text-center space-y-6 shadow-2xl my-6 animate-fade-in backdrop-blur-md">
                  <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 shadow-inner">
                    <SearchX className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Stock Not Found</h2>
                    <p className="text-xs text-brandText/50 leading-relaxed font-sans max-w-md mx-auto">
                      We couldn't retrieve market pricing or telemetry for <strong className="text-white font-mono">{activeTicker}</strong>. The symbol may be invalid, delisted, or unquoted.
                    </p>
                  </div>

                  {activeTicker.toUpperCase().includes('GOOGLE') && (
                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-xs text-left flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-wider block">Suggested Asset</span>
                        <span className="font-bold text-white text-sm">GOOGL (Alphabet Inc.)</span>
                      </div>
                      <button
                        onClick={() => handleSearch('GOOGL')}
                        className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
                      >
                        Switch to GOOGL
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    {tickers.includes(activeTicker) && (
                      <button
                        onClick={() => handleRemoveTicker(activeTicker)}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove "{activeTicker}" from Watchlist</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
                        if (searchInput) searchInput.focus();
                      }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search another asset</span>
                    </button>
                    <button
                      onClick={() => setActiveSidebarItem('Home')}
                      className="px-6 py-3 bg-transparent hover:bg-white/5 text-brandText/60 hover:text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Chart Section */}
                  <div className="reveal-content">
                    <CustomChart
                      ticker={activeTicker}
                      currentPrice={data?.c}
                      priceChange={data?.d}
                      percentChange={data?.dp}
                      isPositive={isPositive}
                    />
                  </div>

                  {/* Editorial Layout for Data & Sentiment */}
                  <div className="reveal-content grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    
                    {/* Integrated Sentiment Widget (Now taking more space on the left) */}
                    <div className="lg:col-span-2">
                      <SentimentWidget sentimentData={sentimentData} loading={sentimentLoading} ticker={activeTicker} />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-carbon rounded-[10px] p-6 border border-graphite h-full">
                        <h3 className="text-eyebrow text-smoke uppercase tracking-widest font-semibold mb-6">Market Telemetry</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div>
                            <span className="block text-eyebrow text-smoke uppercase tracking-widest">Open Price</span>
                            <span className="font-sans text-body font-medium text-bone mt-1 block">${data ? data.o.toFixed(2) : '---'}</span>
                          </div>
                          <div>
                            <span className="block text-eyebrow text-smoke uppercase tracking-widest">Prev Close</span>
                            <span className="font-sans text-body font-medium text-bone mt-1 block">${data ? data.pc.toFixed(2) : '---'}</span>
                          </div>
                          <div>
                            <span className="block text-eyebrow text-smoke uppercase tracking-widest">Day High</span>
                            <span className="font-sans text-body font-medium text-copper mt-1 block">${data ? data.h.toFixed(2) : '---'}</span>
                          </div>
                          <div>
                            <span className="block text-eyebrow text-smoke uppercase tracking-widest">Day Low</span>
                            <span className="font-sans text-body font-medium text-red-500 mt-1 block">${data ? data.l.toFixed(2) : '---'}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-graphite mt-auto">
                           <VolatilityMeter data={data} ticker={activeTicker} />
                        </div>
                      </div>
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

export default function App() {
  if (!hasSupabaseConfig) {
    return <SupabaseSetup />;
  }
  return <MainApp />;
}
