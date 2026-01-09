
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDykU5yc3u11rPavMR6sgtckhWngJeXB58",
  authDomain: "ask-warren.firebaseapp.com",
  projectId: "ask-warren",
  storageBucket: "gs://ask-warren.firebasestorage.app",
  messagingSenderId: "460590857090",
  appId: "1:460590857090:web:45f3ce3bc47de8013eed9b"
};

// Initialisiere Firebase App Instanz einmalig
const app = initializeApp(firebaseConfig);

// Initialisiere und exportiere Services gebunden an die App-Instanz
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
