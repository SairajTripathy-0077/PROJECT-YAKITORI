import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Defensive default Firebase config fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyYakitoriRPG2026Unconfigured",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yakitori-rpg.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yakitori-rpg",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yakitori-rpg.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "104210421042",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:104210421042:web:demo1042yakitori"
};

// Initialize Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
