import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration reading from .env / .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCUYUpUQWKVlBiJpB1SP8rEHZ1rBpVnbqA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yakitori-5f00f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yakitori-5f00f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yakitori-5f00f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "696330825101",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:696330825101:web:b5ae1b70c3c478886a21c4"
};

// Initialize Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
