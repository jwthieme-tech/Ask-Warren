
import React from 'react';
import Disclaimer from './Disclaimer';
import { auth } from '../services/firebase';
// Separate type import to avoid 'no exported member' errors for interfaces
// @ts-ignore - Ignore missing export error for signOut as it is provided by the modular SDK at runtime
import { signOut } from 'firebase/auth';
// @ts-ignore - User interface is part of the modular SDK
import type { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  userProfile?: UserProfile | null;
  onProfileClick?: () => void;
  onVaultClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, userProfile, onProfileClick, onVaultClick }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="bg-slate-950 py-8 md:py-12 border-b-8 border-pink-600 relative">
        <div className="container mx-auto px-4">
          {user && (
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/50 p-1 rounded-full border border-slate-800 backdrop-blur-md">
              <button 
                onClick={onProfileClick}
                className="flex items-center space-x-3 px-3 py-1 hover:bg-slate-800 rounded-full transition-colors group"
              >
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">
                    {userProfile?.name || user.displayName || user.email}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Aktionär</p>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-pink-500 text-[10px] font-bold serif-font">
                      {(userProfile?.name || user.displayName || "I").charAt(0)}
                    </span>
                  )}
                </div>
              </button>
              
              <div className="flex items-center space-x-0.5 border-l border-slate-800 ml-1 pl-1">
                <button 
                  onClick={onVaultClick}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Archiv"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1m-6 9h4m-2-2v4" />
                  </svg>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                  title="Abmelden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="max-w-2xl mx-auto border-4 border-pink-600/50 p-8 text-center bg-slate-900/30 backdrop-blur-sm shadow-2xl flex flex-col items-center">
            <h1 className="serif-font text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">ASK WARREN</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>

      <footer className="bg-slate-900/50 border-t border-slate-800 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <Disclaimer />
          </div>
          
          <div className="text-center text-slate-500 text-sm">
            <p className="mb-4">© {new Date().getFullYear()} ASK WARREN. Analysen basierend auf dem Wissen von Berkshire Hathaway.</p>
            <div className="mt-8 flex justify-center space-x-6 opacity-50">
               <div className="w-12 h-0.5 bg-slate-800"></div>
               <div className="w-2 h-2 rounded-full bg-pink-600"></div>
               <div className="w-12 h-0.5 bg-slate-800"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
