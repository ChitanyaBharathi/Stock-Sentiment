import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldCheck, Mail, Lock, User, AlertTriangle } from 'lucide-react';

export default function AuthView() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'James Gandolfini' // Fallback username
            }
          }
        });
        if (error) throw error;
        alert('Registration complete! Please log in with your new credentials.');
        setMode('login');
      }
    } catch (err) {
      let friendlyMessage = err.message;
      if (err.message.includes('Password')) {
        friendlyMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.message.includes('email') || err.message.includes('invalid email')) {
        friendlyMessage = 'The email address provided is invalid. Supabase requires a strictly formatted valid email.';
      } else if (err.message.includes('already registered')) {
        friendlyMessage = 'This email is already registered. Please sign in instead.';
      }
      setErrorMsg(`Authentication Error: ${friendlyMessage}`);
    } finally {
      setLoading(false);
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
        
        {/* Header Title */}
        <div className="text-center space-y-2 pb-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Access your Terminal' : 'Create Quant Account'}
          </h2>
          <p className="text-xs text-brandText/45 max-w-xs mx-auto">
            {mode === 'login' 
              ? 'Connect securely to stream live quotes and manage your portfolio.' 
              : 'Sign up to configure watchlists and save trade balances.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-brandText/50 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="James Gandolfini"
                  className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl py-3 pl-10 pr-4 font-sans text-xs text-white focus:outline-none focus:border-white/20 transition-all"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-brandText/35" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-brandText/50 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sentimeter.io"
                className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl py-3 pl-10 pr-4 font-sans text-xs text-white focus:outline-none focus:border-white/20 transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-brandText/35" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-brandText/50 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl py-3 pl-10 pr-4 font-sans text-xs text-white focus:outline-none focus:border-white/20 transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brandText/35" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-sans font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md mt-4 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing Sockets...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrorMsg('');
            }}
            className="text-[11px] font-semibold text-brandText/55 hover:text-white transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>

      </div>
    </div>
  );
}
