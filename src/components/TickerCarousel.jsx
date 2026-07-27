import React from 'react';

const mockData = [
  { symbol: 'BTC', price: '97,204', change: '+4.72%', isPositive: true },
  { symbol: 'AMD', price: '128.44', change: '-2.01%', isPositive: false },
  { symbol: 'AAPL', price: '227.48', change: '+1.24%', isPositive: true },
  { symbol: 'NVDA', price: '138.07', change: '+3.11%', isPositive: true },
  { symbol: 'TSLA', price: '412.90', change: '-0.86%', isPositive: false },
  { symbol: 'MSFT', price: '441.58', change: '+0.42%', isPositive: true },
  { symbol: 'AMZN', price: '223.75', change: '+2.05%', isPositive: true },
  { symbol: 'META', price: '501.10', change: '+1.15%', isPositive: true },
  { symbol: 'GOOGL', price: '172.50', change: '-0.45%', isPositive: false },
];

export default function TickerCarousel() {
  // Duplicate array for seamless infinite scroll
  const items = [...mockData, ...mockData, ...mockData];

  return (
    <div className="w-full bg-[#08080a] border-b border-white/5 overflow-hidden py-2.5 flex items-center select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2 mx-6 text-[11px] font-sans font-bold tracking-wider">
            <span className="text-white">{item.symbol}</span>
            <span className="text-neutral-400 font-medium">{item.price}</span>
            <span className={item.isPositive ? 'text-emerald-400' : 'text-red-500'}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
