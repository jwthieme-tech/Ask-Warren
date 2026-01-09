
import React, { useState, useEffect } from 'react';
// Correctly import modular auth functions and type
// @ts-ignore - Ignore missing export error for onAuthStateChanged as it is provided by the modular SDK at runtime
import { onAuthStateChanged } from 'firebase/auth';
// @ts-ignore - User interface is part of the modular SDK
import type { User } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import Layout from './components/Layout';
import Auth from './components/Auth';
import AnalysisResult from './components/AnalysisResult';
import Watchlist from './components/Watchlist';
import Training from './components/Training';
import Profile from './components/Profile';
import FileVault from './components/FileVault';
import MarketTicker from './components/MarketTicker';
import WisdomCard from './components/WisdomCard';
import { analyzeCompany, fetchMarketTicker } from './services/geminiService';
import { AnalysisResponse, WatchlistItem, TickerInfo, UserProfile, GroundingChunk } from './types';

type ViewMode = 'analysis' | 'training' | 'profile' | 'vault';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('analysis');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('ask_warren_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load initial watchlist", e);
      return [];
    }
  });
  
  const [tickerData, setTickerData] = useState<TickerInfo[]>([]);
  const [tickerSources, setTickerSources] = useState<GroundingChunk[]>([]);

  useEffect(() => {
    // @ts-ignore
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    });

    // Listen to files for storage calculation
    const unsubscribeFiles = onSnapshot(collection(db, 'users', user.uid, 'files'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().size || 0), 0);
      setUsedStorage(total);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeFiles();
    };
  }, [user]);

  const refreshTickerData = async () => {
    const { tickers, sources } = await fetchMarketTicker();
    setTickerData(tickers);
    setTickerSources(sources);
  };

  useEffect(() => {
    refreshTickerData();
  }, []);

  useEffect(() => {
    localStorage.setItem('ask_warren_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const performAnalysis = async (searchQuery: string) => {
    setView('analysis');
    setQuery(searchQuery);
    
    const cached = watchlist.find(item => item.query.toLowerCase() === searchQuery.toLowerCase());
    if (cached && cached.fullAnalysis) {
      setAnalysis(cached.fullAnalysis);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCompany(searchQuery);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    performAnalysis(query);
  };

  const addToWatchlist = () => {
    if (!analysis) return;
    
    const verdictMatch = analysis.text.match(/🔮 Urteil des Orakels von Omaha\s*([\s\S]*?)(?:\n|$)/);
    const verdictText = verdictMatch ? verdictMatch[1].trim().split('\n')[0] : 'Unbekannt';
    
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      query: analysis.query,
      verdict: verdictText,
      timestamp: Date.now(),
      fullAnalysis: analysis
    };
    
    setWatchlist(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== analysis.query.toLowerCase());
      return [newItem, ...filtered];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const isAnalysisSaved = analysis ? watchlist.some(item => item.query.toLowerCase() === analysis.query.toLowerCase()) : false;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-600/20 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <MarketTicker data={tickerData} sources={tickerSources} />
      <Layout 
        user={user} 
        userProfile={userProfile} 
        onProfileClick={() => setView('profile')}
        onVaultClick={() => setView('vault')}
      >
        {!user ? (
          <Auth />
        ) : (
          <>
            {view !== 'profile' && view !== 'vault' && (
              <div className="flex justify-center mb-20">
                <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl flex space-x-1 border border-slate-800 shadow-2xl">
                  <button 
                    onClick={() => setView('analysis')}
                    className={`px-10 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'analysis' ? 'bg-pink-600 shadow-lg text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Analyse
                  </button>
                  <button 
                    onClick={() => setView('training')}
                    className={`px-10 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'training' ? 'bg-pink-600 shadow-lg text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Akademie
                  </button>
                </div>
              </div>
            )}

            {view === 'analysis' && (
              <>
                <div className="text-center mb-10">
                  <h2 className="serif-font text-5xl font-bold text-white mb-8 tracking-tight">Investiere nach Buffett-Prinzipien</h2>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed font-light">
                    Erhalten Sie eine präzise Fundamental-Analyse auf Basis der Prinzipien des Orakels von Omaha.
                  </p>
                </div>

                <div className="space-y-16">
                  <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="z.B. Apple, BRK.B, Coca-Cola..."
                      className="w-full pl-10 pr-52 py-6 text-xl rounded-2xl border-2 border-pink-600 bg-slate-900 text-white font-bold placeholder-slate-700 focus:border-pink-400 focus:ring-4 focus:ring-pink-600/20 outline-none transition-all shadow-2xl shadow-pink-900/10 group-hover:border-pink-500"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="absolute right-3 top-3 bottom-3 px-8 rounded-xl bg-pink-600 text-white font-bold uppercase tracking-[0.15em] text-xs hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {loading ? 'Lädt...' : 'Frage Warren'}
                    </button>
                  </form>

                  {!analysis && !loading && (
                    <div className="space-y-16">
                      <WisdomCard />
                    </div>
                  )}

                  <Watchlist 
                    items={watchlist} 
                    onRemove={removeFromWatchlist} 
                    onSelect={performAnalysis} 
                  />
                </div>

                {error && (
                  <div className="mt-12 p-8 bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-3xl text-center font-medium backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {loading && !analysis && (
                  <div className="mt-20 text-center space-y-10">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 border-4 border-pink-600/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-pink-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-slate-400 italic text-2xl font-serif animate-pulse max-w-md mx-auto leading-relaxed">
                      „Der kluge Investor ist ein Realist, der an Optimisten verkauft und von Pessimisten kauft.“
                    </p>
                  </div>
                )}

                {analysis && (
                  <AnalysisResult 
                    analysis={analysis} 
                    onSave={addToWatchlist} 
                    isSaved={isAnalysisSaved} 
                  />
                )}
              </>
            )}

            {view === 'training' && <Training />}
            
            {view === 'profile' && userProfile && (
              <Profile 
                user={user} 
                userProfile={userProfile} 
                onBack={() => setView('analysis')} 
                usedStorage={usedStorage}
              />
            )}

            {view === 'vault' && user && (
              <FileVault user={user} onBack={() => setView('analysis')} usedStorage={usedStorage} />
            )}
          </>
        )}
      </Layout>
    </>
  );
};

export default App;
