import React from 'react';

export default function VolatilityMeter({ data, ticker }) {
  const payload = data || { c: 0, h: 0, l: 0, o: 0 };
  const spread = payload.h - payload.l;
  const pctSpread = payload.o > 0 ? (spread / payload.o) * 100 : 0;
  
  // Calculate current price relative position: 0% at Low, 100% at High
  let relativePosition = 50;
  if (spread > 0) {
    relativePosition = ((payload.c - payload.l) / spread) * 100;
    // Bounds check
    relativePosition = Math.max(0, Math.min(100, relativePosition));
  }

  return (
    <div className="bg-cardBg border border-brandText/10 rounded-3xl p-6 text-left relative overflow-hidden flex flex-col justify-between h-[180px]">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono tracking-widest text-brandText/50 uppercase">
            Volatility Meter
          </span>
          <span className="text-[10px] font-mono text-brandText/60 font-semibold bg-brandBg/60 px-1.5 py-0.5 rounded">
            SPREAD: ${spread.toFixed(2)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-brandText/40">
          Spread index for {ticker}
        </span>
      </div>

      {/* SVG Bar Visualizer */}
      <div className="my-2">
        <div className="relative h-1 w-full bg-brandText/10 rounded-full">
          {/* Daily range line */}
          <div className="absolute top-0 bottom-0 left-0 right-0 rounded-full bg-brandText/20" />
          
          {/* Current position marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-brandAccent border-2 border-cardBg shadow-sm transition-all duration-500 ease-out"
            style={{ left: `calc(${relativePosition}% - 7px)` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-brandText/40 mt-2">
          <span>L: ${payload.l.toFixed(2)}</span>
          <span className="font-semibold text-brandText/60">C: ${payload.c.toFixed(2)}</span>
          <span>H: ${payload.h.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="block text-[9px] font-mono text-brandText/40 uppercase">Intraday Range</span>
          <span className="font-mono text-xs font-bold text-brandText">
            {pctSpread.toFixed(2)}% of Open
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-mono text-brandText/40 uppercase">Status</span>
          <span className="font-mono text-xs font-bold text-brandAccent uppercase">
            {pctSpread > 2 ? 'High Volatility' : 'Stable Data'}
          </span>
        </div>
      </div>
    </div>
  );
}
