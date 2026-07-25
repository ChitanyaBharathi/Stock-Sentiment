import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

export default function StockCandleChart({ candleData, activePrice, timeRange = '1Y' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // 1. Initialize Chart Container
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#9CA3AF",
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.05)" },
          horzLines: { color: "rgba(255, 255, 255, 0.05)" },
        },
        width: chartContainerRef.current.clientWidth || 400,
        height: 400,
        timeScale: {
          timeVisible: true,
          borderColor: "rgba(255, 255, 255, 0.1)",
        },
      });

      // 2. Add Area Series instead of candlestick to avoid format issues
      const areaSeries = chart.addAreaSeries({
        lineColor: '#10B981',
        topColor: 'rgba(16, 185, 129, 0.4)',
        bottomColor: 'rgba(16, 185, 129, 0.0)',
        lineWidth: 2,
      });

      // Transform data safely
      if (candleData && Array.isArray(candleData.t) && candleData.t.length > 0) {
        let daysToSubtract = 365;
        if (timeRange === '1M') daysToSubtract = 30;
        if (timeRange === '3M') daysToSubtract = 90;
        if (timeRange === '6M') daysToSubtract = 180;
        
        const now = Math.floor(Date.now() / 1000);
        const cutoffTime = now - (daysToSubtract * 24 * 60 * 60);

        const dataPoints = [];
        
        for (let i = 0; i < candleData.t.length; i++) {
          const timestamp = Number(candleData.t[i]);
          if (isNaN(timestamp) || timestamp < cutoffTime) continue;

          const date = new Date(timestamp * 1000);
          const timeString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const closePrice = Number(candleData.c[i]);
          
          if (!isNaN(closePrice)) {
            dataPoints.push({
              time: timeString,
              timestamp: timestamp,
              value: closePrice,
            });
          }
        }

        // Strictly ascending
        dataPoints.sort((a, b) => a.timestamp - b.timestamp);

        const uniqueData = [];
        const seenDates = new Set();
        
        for (const item of dataPoints) {
          if (!seenDates.has(item.time)) {
            seenDates.add(item.time);
            uniqueData.push({ time: item.time, value: item.value });
          }
        }

        if (uniqueData.length > 0) {
          try {
            areaSeries.setData(uniqueData);
            chart.timeScale().fitContent();
          } catch (err) {
            console.error("[StockCandleChart] setData error:", err);
          }
        }
      }

      chartRef.current = chart;
      seriesRef.current = areaSeries;

      // Responsive Resize Handler with ResizeObserver
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          try {
             chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
          } catch(e) {}
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          try { chartRef.current.remove(); } catch(e) {}
          chartRef.current = null;
        }
      };
    } catch (globalErr) {
      console.error("[StockCandleChart] Initialization error:", globalErr);
    }
  }, [candleData, timeRange]);

  // 3. Dynamic Real-Time Update
  useEffect(() => {
    try {
      if (seriesRef.current && activePrice !== undefined) {
         const date = new Date();
         const timeString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
         const price = Number(activePrice);
         
         if (!isNaN(price)) {
            seriesRef.current.update({
              time: timeString,
              value: price,
            });
         }
      }
    } catch (e) {
      console.warn("[StockCandleChart] Update skipped to avoid crash:", e);
    }
  }, [activePrice]);

  return (
    <div className="w-full h-[400px] rounded-xl bg-[#111827] overflow-hidden border border-white/5 relative">
       {(!candleData || !candleData.t || candleData.t.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center text-brandText/40 font-mono text-xs z-10 pointer-events-none">
             WAITING FOR MARKET DATA OR NO DATA AVAILABLE...
          </div>
       )}
       <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}
