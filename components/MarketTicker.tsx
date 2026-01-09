
import React from 'react';
import { TickerInfo, GroundingChunk } from '../types';

interface MarketTickerProps {
  data: TickerInfo[];
  sources?: GroundingChunk[];
}

const MarketTicker: React.FC<MarketTickerProps> = ({ data, sources }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-950 text-white py-2 overflow-hidden border-b border-slate-800 relative z-50 flex flex-col">
      <div className="flex items-center">
        <div className="flex whitespace-nowrap animate-marquee flex-grow">
          {[...data, ...data, ...data].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-6 px-8 border-r border-slate-800 last:border-0">
              <span className="font-bold text-slate-400 text-xs tracking-tighter">{item.symbol}</span>
              <span className="font-semibold text-sm">{item.name}</span>
              <span className="font-mono text-sm">{item.price}</span>
              <span className={`text-xs font-bold ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.isUp ? '▲' : '▼'} {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complying with Google Search Grounding: List sources */}
      {sources && sources.length > 0 && (
        <div className="px-4 py-1 bg-slate-900/50 flex flex-wrap gap-4 items-center">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Datenquellen:</span>
          {sources.map((source, i) => (
            <a 
              key={i} 
              href={source.web?.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] text-slate-400 hover:text-pink-500 transition-colors truncate max-w-[150px]"
            >
              {source.web?.title || 'Quelle'}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;
