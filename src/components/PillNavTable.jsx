import React from 'react';
import { useStockData } from '../hooks/useStockData';
import { EyeOff } from 'lucide-react';

function PillItem({ ticker, isActive, onClick }) {
  const { data, flashDirection } = useStockData(ticker);

  const price = data ? data.c.toFixed(2) : '...';
  const change = data ? data.dp : 0;
  const isPositive = change >= 0;

  let flashClass = '';
  if (flashDirection === 'up') {
    flashClass = 'bg-brandAccent/20 text-brandAccent';
  } else if (flashDirection === 'down') {
    flashClass = 'bg-red-500/20 text-red-500';
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 flex items-center space-x-2 border ${
        isActive
          ? 'bg-brandText text-brandPrimary border-brandText shadow-sm'
          : 'bg-cardBg hover:bg-brandPrimary/40 border-brandText/10 text-brandText/70'
      } ${flashClass}`}
    >
      <span className="font-bold">{ticker}</span>
      <span className="opacity-50">|</span>
      <span>${price}</span>
      <span className={`text-[10px] font-semibold ${isPositive ? 'text-brandAccent' : 'text-red-500'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
      </span>
    </button>
  );
}

export default function PillNavTable({ tickers, activeTicker, onSelectTicker, activeData }) {
  const { data, flashDirection } = useStockData(activeTicker);
  const currentData = data || activeData;

  const price = currentData ? currentData.c.toFixed(2) : '---';
  const change = currentData ? currentData.dp : 0;
  const isPositive = change >= 0;
  const spread = currentData ? (currentData.h - currentData.l) : 0;
  const pctSpread = currentData && currentData.o > 0 ? (spread / currentData.o) * 100 : 0;

  let flashClass = '';
  if (flashDirection === 'up') {
    flashClass = 'flash-green';
  } else if (flashDirection === 'down') {
    flashClass = 'flash-red';
  }

  return (
    <div className="space-y-8 text-left">
      {/* Horizontal Pill Navigation Row */}
      <div className="flex flex-wrap gap-2.5 items-center pb-4 border-b border-brandText/10">
        <span className="text-[10px] font-mono tracking-widest text-brandText/40 uppercase mr-2">
          Pill Navigation:
        </span>
        {tickers.map((ticker) => (
          <PillItem
            key={ticker}
            ticker={ticker}
            isActive={ticker === activeTicker}
            onClick={() => onSelectTicker(ticker)}
          />
        ))}
      </div>

      {/* High Fidelity Clean Minimal Table */}
      <div className="bg-cardBg border border-brandText/10 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header / Asset Brief */}
        <div className="p-6 border-b border-brandText/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight font-sans text-brandText">
                {activeTicker}
              </span>
              <span className="text-[10px] font-mono bg-brandBg/60 text-brandText/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                EQUITIES INSTRUMENT
              </span>
            </div>
            <p className="text-xs text-brandText/40 font-mono mt-1">
              ISIN US0378331005 • live socket connection active
            </p>
          </div>
          <div className="text-right flex items-baseline space-x-3">
            <span className={`font-mono text-4xl font-extrabold tracking-tighter px-2 py-0.5 rounded transition-colors duration-300 ${flashClass}`}>
              ${price}
            </span>
            <span className={`font-mono text-sm font-semibold ${isPositive ? 'text-brandAccent' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Minimalist Data Rows */}
        <div className="divide-y divide-brandText/10 font-mono text-xs">
          {/* Row 1: Session Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 p-5 gap-4">
            <div>
              <span className="text-[10px] text-brandText/40 block mb-1">OPEN PRICE</span>
              <span className="font-semibold text-brandText">${currentData ? currentData.o.toFixed(2) : '---'}</span>
            </div>
            <div>
              <span className="text-[10px] text-brandText/40 block mb-1">PREV CLOSE</span>
              <span className="font-semibold text-brandText">${currentData ? currentData.pc.toFixed(2) : '---'}</span>
            </div>
            <div>
              <span className="text-[10px] text-brandText/40 block mb-1">INTRADAY HIGH</span>
              <span className="font-semibold text-brandAccent">${currentData ? currentData.h.toFixed(2) : '---'}</span>
            </div>
            <div>
              <span className="text-[10px] text-brandText/40 block mb-1">INTRADAY LOW</span>
              <span className="font-semibold text-red-500">${currentData ? currentData.l.toFixed(2) : '---'}</span>
            </div>
          </div>

          {/* Row 2: Range & Volatility bar */}
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className="text-[10px] text-brandText/40 block mb-2">VOLATILITY RANGE SPREAD</span>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-brandText/50">${currentData ? currentData.l.toFixed(2) : '---'}</span>
                <div className="h-1.5 flex-1 bg-brandText/10 rounded-full relative">
                  <div
                    className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-brandAccent/60 rounded-full"
                    style={currentData ? {
                      left: `${Math.max(0, Math.min(90, ((currentData.c - currentData.l) / spread) * 100))}%`,
                      width: '4px'
                    } : {}}
                  />
                </div>
                <span className="text-xs text-brandText/50">${currentData ? currentData.h.toFixed(2) : '---'}</span>
              </div>
            </div>
            <div className="md:w-64">
              <span className="text-[10px] text-brandText/40 block mb-1">SPREAD RATIO</span>
              <span className="font-semibold text-brandText">{pctSpread.toFixed(2)}% ({pctSpread > 2 ? 'HIGH RANGE' : 'COMPRESSED'})</span>
            </div>
          </div>

          {/* Row 3: Offline AI & Sentiment Status */}
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brandBg/10">
            <div className="flex items-center space-x-2 text-brandText/50">
              <EyeOff className="w-4 h-4" />
              <span>MARKET SENTIMENT AI</span>
            </div>
            <div className="font-sans text-[10px] text-brandText/40 uppercase tracking-wider flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span>[ PHASE 2 INTEGRATION - OFFLINE ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
