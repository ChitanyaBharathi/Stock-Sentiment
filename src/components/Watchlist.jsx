import React from 'react';
import { useStockData } from '../hooks/useStockData';

function WatchlistItem({ ticker, isActive, onClick }) {
  const { data, flashDirection } = useStockData(ticker);

  const price = data ? data.c.toFixed(2) : '---';
  const change = data ? data.dp : 0;
  const isPositive = change >= 0;

  let flashClass = '';
  if (flashDirection === 'up') {
    flashClass = 'flash-green';
  } else if (flashDirection === 'down') {
    flashClass = 'flash-red';
  }

  return (
    <div
      onClick={onClick}
      className={`interactive-card p-5 rounded-2xl cursor-pointer transition-all border text-left ${
        isActive
          ? 'bg-brandText text-brandPrimary border-brandText shadow-md'
          : 'bg-cardBg hover:bg-brandPrimary/40 border-brandText/10 text-brandText'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono font-bold text-sm tracking-wider">{ticker}</span>
          <p className={`text-[10px] uppercase tracking-widest mt-1 ${isActive ? 'text-brandPrimary/60' : 'text-brandText/40'}`}>
            Equities Asset
          </p>
        </div>
        <div className="text-right">
          <div className={`font-mono text-base font-bold px-1.5 py-0.5 rounded transition-colors duration-300 ${flashClass}`}>
            ${price}
          </div>
          <span
            className={`font-mono text-xs font-medium block mt-1 ${
              isActive
                ? isPositive ? 'text-brandAccent' : 'text-red-400'
                : isPositive ? 'text-brandAccent' : 'text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist({ tickers, activeTicker, onSelectTicker }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-mono tracking-widest text-brandText/50 uppercase">
          Watchlist Coverage
        </span>
        <span className="text-[10px] font-mono text-brandText/40">
          {tickers.length} Assets Tracked
        </span>
      </div>
      <div className="watchlist-list grid gap-3">
        {tickers.map((ticker) => (
          <WatchlistItem
            key={ticker}
            ticker={ticker}
            isActive={ticker === activeTicker}
            onClick={() => onSelectTicker(ticker)}
          />
        ))}
      </div>
    </div>
  );
}
