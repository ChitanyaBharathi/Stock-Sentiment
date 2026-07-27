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
    <div className="bg-onyx border border-graphite rounded-[10px] p-6 text-left relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-eyebrow text-smoke uppercase tracking-widest font-semibold">
            Volatility Meter
          </span>
          <span className="text-[10px] font-sans text-fog font-medium bg-carbon px-2 py-1 rounded-full border border-graphite">
            SPREAD: ${spread.toFixed(2)}
          </span>
        </div>
      </div>

      {/* SVG Bar Visualizer */}
      <div className="my-4">
        <div className="relative h-1.5 w-full bg-carbon border border-graphite rounded-full">
          {/* Daily range line */}
          <div className="absolute top-0 bottom-0 left-0 right-0 rounded-full" />
          
          {/* Current position marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-paper-white border border-graphite shadow-sm transition-all duration-500 ease-out"
            style={{ left: `calc(${relativePosition}% - 7px)` }}
          />
        </div>
        <div className="flex justify-between font-sans text-[11px] text-smoke mt-3 font-medium">
          <span>L: ${payload.l.toFixed(2)}</span>
          <span className="font-semibold text-bone">C: ${payload.c.toFixed(2)}</span>
          <span>H: ${payload.h.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-2 border-t border-graphite">
        <div>
          <span className="block text-[10px] font-sans text-smoke uppercase tracking-widest font-semibold mb-1">Intraday Range</span>
          <span className="font-sans text-xs font-medium text-bone">
            {pctSpread.toFixed(2)}% of Open
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-sans text-smoke uppercase tracking-widest font-semibold mb-1">Status</span>
          <span className="font-sans text-xs font-medium text-copper uppercase">
            {pctSpread > 2 ? 'High Volatility' : 'Stable Data'}
          </span>
        </div>
      </div>
    </div>
  );
}
