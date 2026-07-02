import React, { useState } from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function SupabaseSetup() {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem('SUPABASE_URL', url.trim());
      localStorage.setItem('SUPABASE_ANON_KEY', anonKey.trim());
      window.location.reload();
    } else {
      alert('Please fill out both fields.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-brandText flex items-center justify-center p-6 select-none relative overflow-hidden font-sans">
      
      {/* Noise Background */}
      <div className="noise-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="max-w-md w-full bg-[#131316] border border-brandBorder rounded-3xl p-8 space-y-6 shadow-2xl relative z-10 text-left">
        
        {/* Header Branding */}
        <div className="flex items-center space-x-3.5 border-b border-white/5 pb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              className="w-5 h-5 text-white"
            >
              <path d="M4 3c0 2 1 4 3 5l2 1.5V13c0 .5.5 1 1 1h4c.5 0 1-.5 1-1V9.5l2-1.5c2-1 3-3 3-5M12 14v4m-3 0h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider">SENTIMETER</h2>
            <p className="text-[9px] font-mono text-brandText/40 tracking-widest mt-0.5">CLOUD SYSTEM INITIALIZATION</p>
          </div>
        </div>

        {/* Warning Indicator */}
        <div className="flex items-start space-x-3 bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl text-xs text-indigo-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Supabase Connection Required</h4>
            <p className="text-[11px] leading-relaxed text-indigo-300/80">
              This application utilizes Supabase for secure cloud authentication, portfolio balances, and watchlists storage.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Project URL */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-brandText/50 uppercase tracking-widest">
              Supabase Project URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Public Anon Key */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-brandText/50 uppercase tracking-widest">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="Paste anon key string..."
              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-black font-sans font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md mt-4"
          >
            Connect Cloud Database
          </button>
        </form>

        {/* Info Box */}
        <div className="flex items-start space-x-2.5 text-[10px] text-brandText/45 leading-relaxed bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brandText/60" />
          <p>
            You can find these credentials inside your **Supabase Dashboard** under **Project Settings &gt; API**. Setting these stores them locally in your browser cache.
          </p>
        </div>

      </div>
    </div>
  );
}
