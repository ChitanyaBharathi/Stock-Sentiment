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
  Filter
} from 'lucide-react';

export default function SentimentWidget({ sentimentData, loading, ticker }) {
  const [filter, setFilter] = useState('ALL');
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading || !sentimentData) {
    return (
      <div className="bg-[#131316] border border-brandBorder rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded-full" />
        </div>
        <div className="h-8 w-28 bg-white/10 rounded mt-2" />
        <div className="h-3 w-full bg-white/10 rounded-full mt-4" />
        <div className="space-y-3 pt-4">
          <div className="h-16 bg-white/5 rounded-2xl" />
          <div className="h-16 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    bullishPercent = 65,
    bearishPercent = 35,
    buzzScore = 80,
    articlesCount = 0,
    sentimentLabel = 'Bullish',
    articles = []
  } = sentimentData;

  const isBullish = bullishPercent >= 50;

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
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="bg-[#131316] border border-brandBorder rounded-3xl p-6 text-left space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Gradient Accent Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isBullish
            ? 'bg-gradient-to-r from-brandAccent via-emerald-400 to-teal-400'
            : 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-brandAccent/10 border border-brandAccent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brandAccent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              AI Headline Sentiment Engine
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
              NLP Headline Analysis • {ticker || sentimentData.symbol}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
            isBullish
              ? 'bg-brandAccent/10 text-brandAccent border border-brandAccent/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {sentimentLabel}
        </span>
      </div>

      {/* Big Confidence Score & Buzz Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0C0C0E] border border-white/5 p-4 rounded-2xl">
        <div>
          <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">
            Bullish Ratio
          </span>
          <div className="flex items-center space-x-2.5 mt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {bullishPercent}%
            </span>
            {isBullish ? (
              <TrendingUp className="w-5 h-5 text-brandAccent" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <span className="text-[10px] text-brandText/45 mt-1 block">
            {articlesCount} Recent Market Headlines Analyzed
          </span>
        </div>

        <div className="sm:border-l sm:border-white/5 sm:pl-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-brandText/40 uppercase tracking-widest block">
              Media Buzz Velocity
            </span>
            <span className="text-2xl font-bold text-white font-mono mt-1 block">
              {buzzScore} <span className="text-xs text-brandText/40 font-normal">/ 100</span>
            </span>
          </div>

          {/* Progress distribution */}
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-[9px] font-mono text-brandText/50">
              <span className="text-brandAccent">Bull {bullishPercent}%</span>
              <span className="text-red-400">Bear {bearishPercent}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
              <div className="h-full bg-brandAccent transition-all duration-500" style={{ width: `${bullishPercent}%` }} />
              <div className="h-full bg-red-500/80 transition-all duration-500" style={{ width: `${bearishPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Toggle Header for Articles Breakdown */}
      <div className="border-t border-brandBorder pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider hover:text-brandAccent transition-colors text-left"
          >
            <Newspaper className="w-4 h-4 text-brandAccent" />
            <span>Contributing News Headlines & NLP Breakdowns ({articles.length})</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-brandText/50" /> : <ChevronDown className="w-4 h-4 text-brandText/50" />}
          </button>

          {/* Filter Tabs */}
          {isExpanded && (
            <div className="flex items-center space-x-1.5 bg-[#0C0C0E] p-1 rounded-xl border border-white/5">
              {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                    filter === tab
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-brandText/40 hover:text-white/70'
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
          <div className="space-y-3 pt-1">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-brandText/40 bg-[#0C0C0E] rounded-2xl border border-white/5">
                NO {filter} HEADLINES DETECTED FOR THIS TICKER.
              </div>
            ) : (
              filteredArticles.map((art, idx) => {
                const isArtBullish = art.sentiment === 'Bullish';
                const isArtBearish = art.sentiment === 'Bearish';

                return (
                  <div
                    key={idx}
                    className="bg-[#0C0C0E] border border-white/5 hover:border-white/15 p-4 rounded-2xl transition-all duration-200 space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Title & Link */}
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white group-hover:text-brandAccent transition-colors leading-snug font-sans flex items-start space-x-1.5"
                      >
                        <span className="flex-1">{art.headline}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-brandText/30 group-hover:text-brandAccent flex-shrink-0 mt-0.5" />
                      </a>

                      {/* Sentiment Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold whitespace-nowrap ${
                          isArtBullish
                            ? 'bg-brandAccent/10 text-brandAccent border border-brandAccent/20'
                            : isArtBearish
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-white/5 text-brandText/60 border border-white/10'
                        }`}
                      >
                        {art.sentiment} ({art.score > 0 ? `+${art.score}` : art.score})
                      </span>
                    </div>

                    {/* Metadata & NLP Signals */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04] text-[10px] font-mono text-brandText/40">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white/70">{art.source}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(art.time)}</span>
                      </div>

                      {/* NLP Extracted Signal Tokens */}
                      {art.keywords && art.keywords.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] text-brandText/30 uppercase tracking-tighter mr-1">NLP Signals:</span>
                          {art.keywords.slice(0, 4).map((kw, kIdx) => (
                            <span
                              key={kIdx}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold ${
                                kw.startsWith('+')
                                  ? 'bg-brandAccent/10 text-brandAccent'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
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
