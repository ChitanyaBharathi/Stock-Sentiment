import React from 'react';
import { EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPanel({ ticker, data, flashDirection, loading }) {
  if (loading && !data) {
    return (
      <div className="bg-cardBg border border-brandText/10 rounded-3xl p-8 h-full flex flex-col justify-center items-center min-h-[400px]">
        <div className="font-mono text-xs text-brandText/50 animate-pulse">
          INITIALIZING TELEMETRY STREAM FOR {ticker}...
        </div>
      </div>
    );
  }

  const payload = data || { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0 };
  const isPositive = payload.dp >= 0;

  let flashClass = '';
  if (flashDirection === 'up') {
    flashClass = 'flash-green';
  } else if (flashDirection === 'down') {
    flashClass = 'flash-red';
  }

  return (
    <div className="space-y-6">
      {/* Detail Block */}
      <div className="bg-cardBg border border-brandText/10 rounded-3xl p-8 text-left relative overflow-hidden">
        {/* Subtle decorative background info */}
        <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-brandText/20 select-none uppercase">
          TKR // {ticker}
        </div>

        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest text-brandText/50 uppercase">
            Active Asset Stream
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-brandText mt-1">
            {ticker}
          </h2>
        </div>

        {/* Massive Price display with flash class */}
        <div className="mb-8">
          <div className="flex items-baseline space-x-3">
            <span className={`font-mono text-5xl md:text-6xl font-extrabold tracking-tighter px-2 py-1 rounded transition-colors duration-300 ${flashClass}`}>
              ${payload.c.toFixed(2)}
            </span>
            <div className="flex flex-col">
              <span className={`font-mono text-sm font-semibold flex items-center ${isPositive ? 'text-brandAccent' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {isPositive ? '+' : ''}{payload.d.toFixed(2)}
              </span>
              <span className={`font-mono text-xs font-medium ${isPositive ? 'text-brandAccent/80' : 'text-red-500/80'}`}>
                {isPositive ? '+' : ''}{payload.dp.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-brandText/10 pt-6">
          <div>
            <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-wider">
              Open Price
            </span>
            <span className="font-mono text-base font-bold text-brandText mt-1 block">
              ${payload.o.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-wider">
              Daily High
            </span>
            <span className="font-mono text-base font-bold text-brandText mt-1 block">
              ${payload.h.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-wider">
              Daily Low
            </span>
            <span className="font-mono text-base font-bold text-brandText mt-1 block">
              ${payload.l.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-brandText/40 uppercase tracking-wider">
              Prev Close
            </span>
            <span className="font-mono text-base font-bold text-brandText mt-1 block">
              ${payload.pc.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Market Sentiment AI Card */}
      <div className="relative border border-brandText/10 rounded-3xl p-6 overflow-hidden bg-brandPrimary/30 min-h-[140px] flex flex-col justify-between text-left">
        {/* Backdrop Blur effect */}
        <div className="absolute inset-0 backdrop-blur-[4px] bg-brandBg/10 z-10 flex flex-col justify-center items-center text-center p-4">
          <EyeOff className="w-5 h-5 text-brandText/40 mb-2" />
          <span className="font-mono text-xs font-bold tracking-wider text-brandText/60">
            [ Phase 2 Integration - Offline ]
          </span>
          <p className="text-[10px] text-brandText/40 font-sans mt-1">
            Predictive sentiment heuristics currently disabled.
          </p>
        </div>

        {/* Blurred Content Placeholder */}
        <div className="filter blur-md select-none opacity-40">
          <span className="text-[10px] font-mono tracking-widest text-brandText/50 uppercase">
            Market Sentiment AI
          </span>
          <h3 className="font-sans font-bold text-lg mt-1 text-brandText">
            Bullish Divergence Detected
          </h3>
          <p className="text-xs text-brandText/60 mt-2 font-mono">
            Social velocity is increasing by +14.2% across key channels.
          </p>
        </div>
      </div>
    </div>
  );
}
