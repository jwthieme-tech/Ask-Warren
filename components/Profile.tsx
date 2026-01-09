
import React, { useState, useRef } from 'react';
// Modular function imports from firebase/auth
// @ts-ignore
import { deleteUser, updateProfile } from 'firebase/auth';
// @ts-ignore
import type { User } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { UserProfile } from '../types';

interface ProfileProps {
  user: User;
  userProfile: UserProfile;
  onBack: () => void;
  usedStorage: number;
}

const TOTAL_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Profile: React.FC<ProfileProps> = ({ user, userProfile, onBack, usedStorage }) => {
  const [name, setName] = useState(userProfile.name);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storagePercentage = Math.min((usedStorage / TOTAL_STORAGE_LIMIT) * 100, 100);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name });

      // Update Auth Profile
      await updateProfile(user, { displayName: name });

      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Fehler beim Aktualisieren des Profils.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    setMessage(null);

    try {
      const storageRef = ref(storage, `user_uploads/${user.uid}/profile_image`);
      
      // Upload to Storage
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // Update Auth
      await updateProfile(user, { photoURL: downloadURL });

      setMessage({ type: 'success', text: 'Profilbild aktualisiert.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Fehler beim Hochladen des Bildes.' });
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageDelete = async () => {
    if (!userProfile.photoURL) return;
    
    setImageLoading(true);
    setMessage(null);

    try {
      const storageRef = ref(storage, `user_uploads/${user.uid}/profile_image`);
      
      // Delete from Storage (ignore if doesn't exist)
      try {
        await deleteObject(storageRef);
      } catch (e) {
        console.warn("Could not delete from storage, might not exist", e);
      }

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: "" });

      // Update Auth
      await updateProfile(user, { photoURL: "" });

      setMessage({ type: 'success', text: 'Profilbild entfernt.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Fehler beim Entfernen des Bildes.' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // 1. Delete all items in the user's Storage folder: /user_uploads/{uid}
      const storageFolderRef = ref(storage, `user_uploads/${user.uid}`);
      const folderContent = await listAll(storageFolderRef);
      const deleteFilePromises = folderContent.items.map((item) => deleteObject(item));
      await Promise.all(deleteFilePromises);

      // 2. Delete all documents in the user's Firestore 'files' subcollection
      const filesSubcollectionRef = collection(db, 'users', user.uid, 'files');
      const filesSnapshot = await getDocs(filesSubcollectionRef);
      const deleteFirestoreFilePromises = filesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deleteFirestoreFilePromises);

      // 3. Delete the main user document in Firestore: /users/{uid}
      await deleteDoc(doc(db, 'users', user.uid));

      // 4. Finally, delete the Firebase Authentication user record
      await deleteUser(user);
      
      // The application will automatically redirect to the auth screen via App.tsx's onAuthStateChanged listener
    } catch (err: any) {
      console.error('Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ 
          type: 'error', 
          text: 'Sicherheitsrelevante Aktion: Bitte melden Sie sich erneut an, um Ihr Konto endgültig zu löschen.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Fehler beim Löschen des Kontos. Bitte versuchen Sie es später erneut.' 
        });
      }
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in py-8">
      <button 
        onClick={onBack}
        className="flex items-center space-x-3 text-pink-500 font-bold uppercase tracking-widest text-sm mb-8 hover:text-pink-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Zurück</span>
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Storage Usage Section */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 p-8 shadow-xl">
           <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Speicherplatz</h3>
                <p className="text-slate-500 text-xs mt-1">Ihr Archivlimit von 5 GB</p>
              </div>
              <div className="text-right">
                <p className="text-pink-500 font-bold text-sm">{formatBytes(usedStorage)}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">belegt</p>
              </div>
           </div>
           
           <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-500 ease-out ${storagePercentage > 90 ? 'bg-rose-500' : 'bg-pink-600'}`}
                style={{ width: `${storagePercentage}%` }}
              ></div>
           </div>
           
           <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">0 GB</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">5 GB</span>
           </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border-2 border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-48 h-48 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>

          <div className="relative z-10">
            <h2 className="serif-font text-4xl font-bold text-white mb-2">Mein Profil</h2>
            <p className="text-slate-400 mb-10">Verwalten Sie Ihre persönlichen Informationen und Ihr Konto.</p>

            <div className="flex flex-col items-center mb-12">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
                  {imageLoading ? (
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profil" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <span className="text-pink-500 font-bold text-4xl serif-font">{userProfile.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              
              <div className="mt-4 flex space-x-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-pink-500 uppercase tracking-widest hover:text-pink-400 transition-colors"
                >
                  Bild ändern
                </button>
                {userProfile.photoURL && (
                  <button 
                    onClick={handleImageDelete}
                    className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl text-center text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Vollständiger Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-pink-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">E-Mail (nicht änderbar)</label>
                  <input
                    type="email"
                    disabled
                    value={userProfile.email}
                    className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Konto erstellt</p>
                    <p className="text-slate-300 text-sm">{new Date(userProfile.createdAt).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
              >
                {loading ? 'Speichere...' : 'Profil aktualisieren'}
              </button>
            </form>

            <div className="mt-16 pt-10 border-t border-slate-800">
              <h3 className="text-rose-500 font-bold uppercase tracking-widest text-xs mb-4">Gefahrenzone</h3>
              <p className="text-slate-500 text-sm mb-6">Das Löschen Ihres Kontos ist permanent und kann nicht rückgängig gemacht werden. Alle Ihre Daten werden unwiderruflich gelöscht.</p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Konto löschen
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-white font-bold text-sm">Sind Sie sicher?</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-900/20"
                    >
                      {loading ? 'Lösche...' : 'Ja, Konto endgültig löschen'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
