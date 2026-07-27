import React, { useState, useMemo } from 'react';

function createSeededRandom(seedString) {
  let h = 0;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(31, h) + seedString.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export default function CustomChart({ ticker, currentPrice, priceChange, percentChange, isPositive }) {
  const timelines = ['1H', '1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  const [activeTimeline, setActiveTimeline] = useState('1W');

  // Generate historical data points based on ticker, timeline, and current price
  const points = useMemo(() => {
    if (!currentPrice) return [];

    const rng = createSeededRandom(ticker + activeTimeline);
    
    let count = 30;
    let volatility = 0.015;
    if (activeTimeline === '1H') { count = 15; volatility = 0.005; }
    else if (activeTimeline === '1D') { count = 20; volatility = 0.01; }
    else if (activeTimeline === '1W') { count = 30; volatility = 0.025; }
    else if (activeTimeline === '1M') { count = 40; volatility = 0.05; }
    else if (activeTimeline === '3M') { count = 50; volatility = 0.08; }
    else if (activeTimeline === '6M') { count = 60; volatility = 0.12; }
    else if (activeTimeline === '1Y') { count = 80; volatility = 0.20; }
    else if (activeTimeline === 'ALL') { count = 100; volatility = 0.35; }

    const rawValues = [];
    let price = currentPrice * (1 + (rng() - 0.5) * volatility);
    
    for (let i = 0; i < count; i++) {
      rawValues.push(price);
      const step = (rng() - 0.48) * volatility * (price / count);
      price += step;
    }

    const diff = currentPrice - rawValues[rawValues.length - 1];
    const scaledValues = rawValues.map((val, idx) => {
      const correction = (idx / (count - 1)) * diff;
      return val + correction;
    });

    const minVal = Math.min(...scaledValues) * 0.998;
    const maxVal = Math.max(...scaledValues) * 1.002;
    const range = maxVal - minVal || 1;

    const w = 800;
    const h = 200; // slightly reduced height for layout proportions
    return scaledValues.map((val, idx) => {
      const x = (idx / (count - 1)) * w;
      const y = h - ((val - minVal) / range) * h;
      return { x, y, value: val };
    });
  }, [ticker, activeTimeline, currentPrice]);

  const svgPathData = useMemo(() => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  const svgFillPathData = useMemo(() => {
    if (!svgPathData) return '';
    return `${svgPathData} L 800 200 L 0 200 Z`;
  }, [svgPathData]);

  const strokeColor = isPositive ? '#17B877' : '#EF4444';
  const gradientId = `chartGradient-${ticker}-${activeTimeline}`;

  return (
    <div className="w-full bg-onyx rounded-[10px] p-6 md:p-8 flex flex-col justify-between text-left select-none relative overflow-hidden space-y-4">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-carbon px-2.5 py-1 rounded-full border border-graphite">
            <span className="text-[11px]">🇺🇸</span>
            <span className="font-sans text-[12px] font-medium text-bone">USD</span>
          </div>
          <span className="text-[13px] font-sans text-smoke uppercase tracking-widest font-semibold">
            NASDAQ
          </span>
        </div>
      </div>

      {/* SVG Vector Line Chart Container */}
      <div className="relative h-44 w-full flex items-center justify-center">
        {points.length === 0 ? (
          <div className="text-center space-y-2">
            <span className="font-sans text-xs text-smoke uppercase tracking-widest block font-medium">
              {!currentPrice ? 'NO MARKET DATA FOR SYMBOL' : 'LOADING CHART STREAMS...'}
            </span>
          </div>
        ) : (
          <svg
            viewBox="0 0 800 200"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gildedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(174, 147, 87)" />
                <stop offset="40%" stopColor="rgb(255, 240, 204)" />
                <stop offset="70%" stopColor="rgb(174, 147, 87)" />
                <stop offset="100%" stopColor="rgba(189, 157, 79, 0)" />
              </linearGradient>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

            {/* Gradient Fill Path */}
            <path
              d={svgFillPathData}
              fill={`url(#${gradientId})`}
              className="transition-all duration-300 ease-out"
            />

            {/* Glowing Chart Stroke Line */}
            <path
              d={svgPathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />

            {/* Active wiggling end dot */}
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4.5"
              fill={strokeColor}
              className="animate-pulse"
            />
          </svg>
        )}
      </div>

      {/* Bottom Info & Timelines Row */}
      <div className="flex justify-between items-end pt-2">
        {/* Live Price display */}
        <div className="space-y-1">
          <div className="font-serif text-[64px] leading-none tracking-[0.01em] text-paper-white">
            ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
          </div>
          <div className="font-sans text-[16px] text-bone">
            {isPositive ? '+' : ''}${priceChange ? priceChange.toFixed(2) : '0.00'} ({isPositive ? '+' : ''}{percentChange ? percentChange.toFixed(2) : '0.00'}%)
          </div>
        </div>

        {/* Timeline Selector */}
        <div className="flex space-x-1">
          {timelines.map((timeline) => (
            <button
              key={timeline}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTimeline(timeline);
              }}
              className={`px-3 py-1.5 rounded-full font-sans text-[13px] font-medium transition-all ${
                activeTimeline === timeline
                  ? 'bg-paper-white text-obsidian'
                  : 'bg-transparent border border-graphite text-fog hover:text-white'
              }`}
            >
              {timeline}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
