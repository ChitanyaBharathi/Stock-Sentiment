import React from 'react';
import { useStockData } from '../hooks/useStockData';
import CustomChart from './CustomChart';
import { X } from 'lucide-react';

function WatchlistItem({ ticker, isActive, onClick, onRemove }) {
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
      className={`interactive-card p-5 rounded-[10px] cursor-pointer transition-all duration-200 border-2 text-left group relative hover:scale-[1.005] ${
        isActive
          ? 'bg-[#141418] text-white border-[#E8B4B8]/40 shadow-[0_0_25px_-5px_rgba(232,180,184,0.15)]'
          : 'bg-[#0C0C0E] hover:bg-[#141418] border-white/5 hover:border-[#E8B4B8]/30 text-neutral-400'
      }`}
    >
      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(ticker);
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all opacity-80 md:opacity-0 group-hover:opacity-100 ${
            isActive
              ? 'hover:bg-white/10 text-[#E8B4B8]'
              : 'hover:bg-white/10 text-neutral-500 hover:text-white'
          }`}
          title={`Remove ${ticker} from watchlist`}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex justify-between items-start pr-6">
        <div>
          <span className="font-serif text-2xl tracking-tight text-white">{ticker}</span>
          <p className={`text-[10px] uppercase font-semibold mt-1 tracking-wider ${isActive ? 'text-[#E8B4B8]' : 'text-neutral-400'}`}>
            Equities Asset
          </p>
        </div>
        <div className="text-right">
          <div className={`font-sans text-xl font-bold px-1.5 py-0.5 rounded transition-colors duration-300 ${isActive ? 'text-white' : 'text-neutral-200'} ${flashClass}`}>
            ${price}
          </div>
          <span
            className={`font-sans text-sm font-medium block mt-1 ${
              isPositive ? 'text-emerald-400' : 'text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>
      
      {/* Dynamic Render of Custom Graph for Active Item */}
      {isActive && (
        <div className="mt-5 pt-5 border-t border-white/5 animate-fade-in">
          <CustomChart
            ticker={ticker}
            currentPrice={data?.c}
            priceChange={data?.d}
            percentChange={data?.dp}
            isPositive={isPositive}
          />
        </div>
      )}
    </div>
  );
}

export default function Watchlist({ tickers, activeTicker, onSelectTicker, onRemoveTicker }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-1 border-b border-white/5 pb-2">
        <span className="text-[10px] font-sans font-semibold tracking-wider text-neutral-400 uppercase">
          Watchlist Coverage
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-sans text-neutral-500">
            {tickers.length} Assets Tracked
          </span>
          <div className="flex space-x-1">
            <span className="bg-[#E8B4B8]/10 text-[#E8B4B8] border border-[#E8B4B8]/20 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase">ALL</span>
            <span className="text-neutral-500 border border-white/5 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase hover:text-white transition-colors cursor-pointer">TECH</span>
          </div>
        </div>
      </div>
      <div className="watchlist-list grid gap-3">
        {tickers.map((ticker) => (
          <WatchlistItem
            key={ticker}
            ticker={ticker}
            isActive={ticker === activeTicker}
            onClick={() => onSelectTicker(ticker)}
            onRemove={onRemoveTicker}
          />
        ))}
      </div>
    </div>
  );
}
