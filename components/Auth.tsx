
import React, { useState } from 'react';
// Modular imports from firebase/auth for SDK v9+
// @ts-ignore - Consolidate imports to single line to apply suppressions to all members missing in types
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// @ts-ignore - User interface is part of the modular SDK
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const syncUserToFirestore = async (user: User, displayName?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: displayName || user.displayName || 'Investor',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: Date.now()
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserToFirestore(result.user);
    } catch (err: any) {
      console.error(err);
      setError('Anmeldung mit Google fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setRegisteredEmail(email);
        setResetEmailSent(true);
      } else if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          setRegisteredEmail(user.email || '');
          setVerificationSent(true);
          await signOut(auth);
        } else {
          // Sync existing user to Firestore if missing
          await syncUserToFirestore(user);
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwörter stimmen nicht überein.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: name,
        });

        // Create initial Firestore doc
        await syncUserToFirestore(user, name);

        await sendEmailVerification(user);
        setRegisteredEmail(user.email || '');
        setVerificationSent(true);
        await signOut(auth);
      }
    } catch (err: any) {
      console.error(err);
      if (isForgotPassword) {
        setError('E-Mail Adresse nicht gefunden oder fehlerhaft.');
      } else if (isLogin) {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          setError('Password or Email Incorrect');
        } else {
          setError('Ein Fehler ist aufgetreten. Bitte erneut versuchen.');
        }
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError('User already exists. Sign in?');
        } else {
          setError(err.message || 'Fehler bei der Registrierung.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setVerificationSent(false);
    setResetEmailSent(false);
    setIsForgotPassword(false);
    setIsLogin(true);
    setError(null);
  };

  if (verificationSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
        <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-pink-600/30 shadow-2xl text-center">
          <div className="mx-auto w-20 h-20 bg-pink-600/10 rounded-full flex items-center justify-center mb-6 border border-pink-600/20">
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h2 className="serif-font text-3xl font-bold text-white mb-4">E-Mail bestätigen</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            We have sent you a verification email to <span className="text-pink-500 font-bold">{registeredEmail}</span>. Verify it and log in.
          </p>
          <div className="pt-8">
            <button
              onClick={resetToLogin}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-pink-900/20 uppercase tracking-widest text-xs"
            >
              Zum Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
        <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-pink-600/30 shadow-2xl text-center">
          <div className="mx-auto w-20 h-20 bg-pink-600/10 rounded-full flex items-center justify-center mb-6 border border-pink-600/20">
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="serif-font text-3xl font-bold text-white mb-4">Link gesendet</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            We sent you a password change link to <span className="text-pink-500 font-bold">{registeredEmail}</span>.
          </p>
          <div className="pt-8">
            <button
              onClick={resetToLogin}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-pink-900/20 uppercase tracking-widest text-xs"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-pink-600/30 shadow-2xl">
        <div className="text-center">
          <h2 className="serif-font text-4xl font-bold text-white mb-2">
            {isForgotPassword ? 'Passwort zurücksetzen' : (isLogin ? 'Willkommen zurück' : 'Konto erstellen')}
          </h2>
          <p className="text-slate-400 text-sm">
            {isForgotPassword 
              ? 'Geben Sie Ihre E-Mail ein, um einen Reset-Link zu erhalten.' 
              : (isLogin ? 'Melden Sie sich an, um Warren zu fragen.' : 'Starten Sie Ihre Reise zum intelligenten Investor.')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl text-center font-medium cursor-pointer"
              onClick={() => {
                if (error === 'User already exists. Sign in?') {
                  setIsLogin(true);
                  setError(null);
                }
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Vollständiger Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-pink-500 outline-none transition-all placeholder-slate-700"
                    placeholder="Warren Buffett"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">E-Mail Adresse</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-pink-500 outline-none transition-all placeholder-slate-700"
                placeholder="investor@berkshire.com"
              />
            </div>
            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Passwort</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                      }}
                      className="text-[10px] font-bold text-pink-500 hover:text-pink-400 uppercase tracking-wider"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-pink-500 outline-none transition-all placeholder-slate-700"
                  placeholder="••••••••"
                />
              </div>
            )}
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Passwort wiederholen</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-pink-500 outline-none transition-all placeholder-slate-700"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
          >
            {loading ? 'Verarbeite...' : (isForgotPassword ? 'Get Reset Link' : (isLogin ? 'Anmelden' : 'Registrieren'))}
          </button>
        </form>

        {!isForgotPassword && (
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="border-t border-slate-800 w-full"></div>
              <div className="absolute bg-[#0b1224] px-4 text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase">ODER</div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-bold hover:bg-slate-900 transition-all text-xs uppercase tracking-widest group"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg" 
                alt="Google" 
                className="w-5 h-5 group-hover:scale-110 transition-transform"
              />
              <span>Weiter mit Google</span>
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (isForgotPassword) {
                setIsForgotPassword(false);
              } else {
                setIsLogin(!isLogin);
              }
              setError(null);
            }}
            className="text-pink-500 text-sm font-medium hover:text-pink-400 transition-colors"
          >
            {isForgotPassword 
              ? 'Zurück zum Login' 
              : (isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Hier anmelden')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
