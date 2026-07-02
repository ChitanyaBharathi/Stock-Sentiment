import React, { useEffect, useRef } from 'react';

export default function TelemetryFeed({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Keep the latest log at the top
    }
  }, [logs]);

  return (
    <div className="bg-brandText text-brandPrimary border border-brandText/20 rounded-3xl p-6 h-[180px] flex flex-col justify-between text-left relative overflow-hidden">
      <div className="flex justify-between items-center border-b border-brandPrimary/10 pb-3 mb-3 select-none">
        <span className="text-[10px] font-mono tracking-widest text-brandPrimary/60 uppercase">
          Live Telemetry Feed
        </span>
        <div className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brandAccent animate-ping" />
          <span className="text-[9px] font-mono text-brandPrimary/40">STREAMING</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brandPrimary/20 scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="text-brandPrimary/30 animate-pulse">&gt; Establishing secure data sockets...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-brandAccent mr-1.5">&gt;</span>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
