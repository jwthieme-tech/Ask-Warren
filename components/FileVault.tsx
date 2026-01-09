
import React, { useState, useEffect, useRef } from 'react';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { storage, db } from '../services/firebase';
// Standard type import for Firebase User
// @ts-ignore - Ignore missing export error for User as it is part of the modular SDK types
import type { User } from 'firebase/auth';
import { FileRecord } from '../types';
import { summarizeDocument } from '../services/geminiService';

interface FileVaultProps {
  user: User;
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

const FileVault: React.FC<FileVaultProps> = ({ user, onBack, usedStorage }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storagePercentage = Math.min((usedStorage / TOTAL_STORAGE_LIMIT) * 100, 100);

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'files'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList: FileRecord[] = [];
      snapshot.forEach((doc) => {
        fileList.push({ id: doc.id, ...doc.data() } as FileRecord);
      });
      setFiles(fileList);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (usedStorage + file.size > TOTAL_STORAGE_LIMIT) {
      setError("Speicherlimit von 5 GB überschritten.");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const fileId = Date.now().toString();
      const storageRef = ref(storage, `user_uploads/${user.uid}/${fileId}_${file.name}`);
      
      // Upload to Storage
      await uploadBytes(storageRef, file);
      setUploadProgress(50);
      
      const downloadURL = await getDownloadURL(storageRef);
      setUploadProgress(70);

      // Generate AI Summary
      let aiSummary = "Analyse läuft...";
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        aiSummary = await summarizeDocument(base64, file.type);
      } else {
        aiSummary = "Analyse für diesen Dateityp nicht unterstützt.";
      }
      setUploadProgress(90);

      // Sync to Firestore
      const fileRef = doc(db, 'users', user.uid, 'files', fileId);
      await setDoc(fileRef, {
        id: fileId,
        name: file.name,
        url: downloadURL,
        size: file.size,
        type: file.type,
        timestamp: Date.now(),
        aiSummary,
        storagePath: storageRef.fullPath
      });

    } catch (err: any) {
      console.error(err);
      setError("Fehler beim Hochladen der Datei.");
    } finally {
      setLoading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (file: FileRecord) => {
    if (!file.storagePath) {
      // Fallback to existing URL if path is missing for some reason
      window.open(file.url, '_blank');
      return;
    }

    try {
      const storageRef = ref(storage, file.storagePath);
      const url = await getDownloadURL(storageRef);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Download error:", err);
      setError("Fehler beim Abrufen der Datei.");
    }
  };

  const handleDelete = async (file: FileRecord) => {
    if (!confirm(`Möchten Sie "${file.name}" wirklich löschen?`)) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid, 'files', file.id));
      
      // Delete from Storage
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Löschen der Datei.");
    }
  };

  const updateNote = async (fileId: string, note: string) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'files', fileId), { note });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in py-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center space-x-3 text-pink-500 font-bold uppercase tracking-widest text-sm mb-4 hover:text-pink-400 transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Zurück</span>
          </button>
          <h2 className="serif-font text-5xl font-bold text-white mb-2">Dokumenten-Archiv</h2>
          <p className="text-slate-400">Verwalten Sie Ihre Geschäftsberichte und Dokumente mit KI-Unterstützung.</p>
        </div>

        <div className="flex flex-col items-end space-y-4">
          <div className="w-64">
            <div className="flex justify-between items-center mb-1.5">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Speicher</span>
               <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{formatBytes(usedStorage)} / 5 GB</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div 
                className="h-full bg-pink-600 transition-all duration-300"
                style={{ width: `${storagePercentage}%` }}
               ></div>
            </div>
          </div>

          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-10 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold flex items-center space-x-4 transition-all shadow-xl shadow-pink-900/20 disabled:opacity-50"
            >
              {loading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
              <span className="uppercase tracking-widest text-sm">Dokument hochladen</span>
            </button>
            {uploadProgress !== null && (
               <div className="absolute -bottom-8 left-0 right-0 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-600 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
               </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center">
          {error}
        </div>
      )}

      {files.length === 0 && !loading ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-500 serif-font text-xl">Keine Dokumente im Archiv.</p>
          <p className="text-slate-600 text-sm mt-2 uppercase tracking-widest font-bold">Laden Sie PDFs oder Bilder hoch für eine KI-Analyse.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {files.map((file) => (
            <div key={file.id} className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border-2 border-slate-800 overflow-hidden shadow-2xl group">
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                {/* File Info */}
                <div className="md:w-1/4 space-y-6">
                  <div className="w-16 h-16 bg-pink-600/10 rounded-2xl flex items-center justify-center border border-pink-600/20">
                     <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                     </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold break-words">{file.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">
                      {formatBytes(file.size)} • {new Date(file.timestamp).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleDownload(file)}
                      className="p-3 bg-slate-950 rounded-xl text-slate-400 hover:text-white transition-colors"
                      title="Anzeigen/Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(file)}
                      className="p-3 bg-slate-950 rounded-xl text-slate-700 hover:text-rose-500 transition-colors"
                      title="Löschen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-3/4 space-y-8">
                  <div className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800">
                    <h4 className="text-pink-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Warren's Zusammenfassung</h4>
                    <p className="text-slate-200 serif-font text-lg leading-relaxed italic">
                      {file.aiSummary || "Analyse läuft..."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Eigene Notizen</label>
                    <textarea 
                      defaultValue={file.note || ''}
                      onBlur={(e) => updateNote(file.id, e.target.value)}
                      placeholder="Notieren Sie hier wichtige Erkenntnisse für Ihre Watchlist..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 placeholder-slate-700 focus:border-pink-600 outline-none transition-all resize-none h-32"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileVault;
