
import React from 'react';
import { WatchlistItem } from '../types';

interface WatchlistProps {
  items: WatchlistItem[];
  onRemove: (id: string) => void;
  onSelect: (query: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ items, onRemove, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-16 bg-slate-900/50 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
      <div className="bg-slate-900 px-8 py-6 border-b border-slate-800 flex justify-between items-center">
        <h3 className="serif-font text-2xl font-bold text-white tracking-wide">Ihre Watchlist</h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-slate-800 px-4 py-1.5 rounded-full">{items.length} Analysen</span>
      </div>
      <div className="divide-y divide-slate-800/50">
        {items.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
          <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-800/50 transition-all group">
            <button 
              onClick={() => onSelect(item.query)}
              className="flex-grow text-left focus:outline-none"
            >
              <div className="flex items-center space-x-5">
                <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{item.verdict.split(' ')[0]}</span>
                <div>
                  <p className="font-bold text-lg text-slate-200 group-hover:text-pink-500 transition-colors tracking-tight">{item.query}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Analysiert am {new Date(item.timestamp).toLocaleDateString('de-DE')}</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => onRemove(item.id)}
              className="p-3 text-slate-700 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-500/10"
              title="Entfernen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
