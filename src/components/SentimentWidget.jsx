import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Newspaper,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  ShieldCheck,
  BarChart2
} from 'lucide-react';

export default function SentimentWidget({ sentimentData, loading, ticker }) {
  const [filter, setFilter] = useState('ALL');
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading || !sentimentData) {
    return (
      <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-white/10 rounded-lg" />
          <div className="h-6 w-24 bg-white/10 rounded-full" />
        </div>
        <div className="h-12 w-36 bg-white/10 rounded-xl mt-2" />
        <div className="h-3 w-full bg-white/10 rounded-full mt-4" />
        <div className="space-y-3 pt-4">
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    bullishPercent = 50,
    bearishPercent = 50,
    buzzScore = 80,
    articlesCount = 0,
    sentimentLabel = 'Neutral',
    articles = []
  } = sentimentData;

  const isBullish = sentimentLabel === 'Bullish' || bullishPercent > bearishPercent;
  const isBearish = sentimentLabel === 'Bearish' || bearishPercent > bullishPercent;

  // Filter articles based on selected tab
  const filteredArticles = articles.filter((art) => {
    if (filter === 'BULLISH') return art.sentiment === 'Bullish';
    if (filter === 'BEARISH') return art.sentiment === 'Bearish';
    if (filter === 'NEUTRAL') return art.sentiment === 'Neutral';
    return true;
  });

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diffHours = Math.round((Date.now() - timestamp) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 text-left space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Glow Ambient Highlight */}
      <div
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none ${
          isBullish ? 'bg-emerald-500' : isBearish ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      {/* Top Accent Gradient Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isBullish
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
            : isBearish
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500'
            : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            <Sparkles className={`w-5 h-5 ${isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                FinBERT Sentiment Engine
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-semibold">
                BERT NLP
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider flex items-center space-x-1.5">
              <span>ProsusAI/finbert</span>
              <span>•</span>
              <span className="text-gray-300 font-bold">{ticker || sentimentData.symbol}</span>
            </p>
          </div>
        </div>

        {/* Overall Sentiment Badge */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm border ${
              isBullish
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isBearish
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : isBearish ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
            <span>{sentimentLabel}</span>
          </span>
        </div>
      </div>

      {/* Main Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#09090B] border border-white/10 p-5 rounded-2xl relative">
        {/* Left Metric: Bullish Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
              Bullish Ratio
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {articlesCount} Headlines Analyzed
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
              {bullishPercent}%
            </span>
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-mono font-bold ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {bullishPercent > bearishPercent ? `+${bullishPercent - bearishPercent}% Net Bull` : `${bearishPercent - bullishPercent}% Net Bear`}
              </span>
            </div>
          </div>

          {/* Dual Bar Indicator */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/10 p-0.5">
              <div
                className="h-full bg-emerald-400 rounded-l-full transition-all duration-700 ease-out"
                style={{ width: `${bullishPercent}%` }}
              />
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-700 ease-out"
                style={{ width: `${bearishPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-semibold">
              <span className="text-emerald-400">Bull {bullishPercent}%</span>
              <span className="text-rose-400">Bear {bearishPercent}%</span>
            </div>
          </div>
        </div>

        {/* Right Metric: Media Buzz & FinBERT Status */}
        <div className="md:border-l md:border-white/10 md:pl-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                Media Buzz Velocity
              </span>
              <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                <Zap className="w-3 h-3" />
                <span>Live Feed</span>
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-bold text-white font-mono">
                {buzzScore}
              </span>
              <span className="text-xs text-gray-500 font-mono">/ 100 Velocity</span>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-300 font-mono leading-tight">
              Classified with ProsusAI FinBERT transformer architecture fine-tuned on financial news.
            </span>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="border-t border-white/10 pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider hover:text-emerald-400 transition-colors text-left"
          >
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span>Contributing Headlines ({filteredArticles.length})</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Filter Tabs */}
          {isExpanded && (
            <div className="flex items-center space-x-1 bg-[#09090B] p-1 rounded-xl border border-white/10">
              {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    filter === tab
                      ? 'bg-white/15 text-white shadow-sm border border-white/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expandable Articles List */}
        {isExpanded && (
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-gray-500 bg-[#09090B] rounded-2xl border border-white/5">
                NO {filter} HEADLINES DETECTED.
              </div>
            ) : (
              filteredArticles.map((art, idx) => {
                const isArtBullish = art.sentiment === 'Bullish';
                const isArtBearish = art.sentiment === 'Bearish';
                const conf = art.confidence || 75;

                return (
                  <div
                    key={idx}
                    className="bg-[#09090B] border border-white/10 hover:border-white/20 p-4 rounded-2xl transition-all duration-200 space-y-3 group hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors leading-relaxed font-sans flex items-start space-x-1.5 flex-1"
                      >
                        <span>{art.headline}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 flex-shrink-0 mt-0.5" />
                      </a>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap border flex items-center space-x-1 ${
                          isArtBullish
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isArtBearish
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        <span>{art.sentiment}</span>
                      </span>
                    </div>

                    {/* Metadata & FinBERT Confidence Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-200">{art.source}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(art.time)}</span>
                      </div>

                      <div className="flex items-center space-x-2 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                        <span className="text-[9px] text-gray-400 uppercase font-semibold">FinBERT Confidence:</span>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isArtBullish ? 'bg-emerald-400' : isArtBearish ? 'bg-rose-400' : 'bg-amber-400'}`}
                            style={{ width: `${conf}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-200 font-bold">{conf}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

