import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { playSound } from '../utils/sound';
import { api, ApiError } from '../utils/api';

// MongoDB user profile shape (mirrors server User model)
export interface DbUserProfile {
  firebaseUid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  provider: 'google' | 'email' | 'anonymous';
  role: 'user' | 'admin';
  lastLoginAt: string;
  loginCount: number;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  dbProfile: DbUserProfile | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbProfile, setDbProfile] = useState<DbUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sync the Firebase user to MongoDB backend.
   * Creates user doc on first login, updates on subsequent logins.
   */
  const syncUserToBackend = useCallback(async (firebaseUser: User) => {
    setSyncing(true);
    try {
      // Determine provider from Firebase providerData
      let provider: 'google' | 'email' | 'anonymous' = 'email';
      if (firebaseUser.isAnonymous) {
        provider = 'anonymous';
      } else if (firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
        provider = 'google';
      }

      const result = await api.post<{ user: DbUserProfile }>('/api/auth/sync', {
        displayName: firebaseUser.displayName || 'Adventurer',
        photoURL: firebaseUser.photoURL,
        provider,
      });

      if (result.data?.user) {
        setDbProfile(result.data.user);
      }
    } catch (err) {
      // Don't block login if backend sync fails — log and continue
      console.warn('[AuthContext] Backend sync failed:', err instanceof ApiError ? err.message : err);
    } finally {
      setSyncing(false);
    }
  }, []);

  /**
   * Fetch current profile from backend (useful for refreshing after changes).
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const result = await api.get<{ user: DbUserProfile }>('/api/auth/me');
      if (result.data?.user) {
        setDbProfile(result.data.user);
      }
    } catch (err) {
      console.warn('[AuthContext] Profile refresh failed:', err);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to MongoDB on every auth state change
        await syncUserToBackend(currentUser);
      } else {
        // User signed out — clear DB profile
        setDbProfile(null);
      }
    });

    return () => unsubscribe();
  }, [syncUserToBackend]);

  const clearError = () => setError(null);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      playSound('purchase');
    } catch (err: unknown) {
      playSound('error');
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setError(msg);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, pass);
      playSound('purchase');
    } catch (err: unknown) {
      playSound('error');
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, pass);
      playSound('levelUp');
    } catch (err: unknown) {
      playSound('error');
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg);
      throw err;
    }
  };

  const loginAnonymously = async () => {
    try {
      setError(null);
      await signInAnonymously(auth);
      playSound('purchase');
    } catch (err: unknown) {
      playSound('error');
      const msg = err instanceof Error ? err.message : 'Guest sign in failed';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Notify backend before Firebase signout (while token is still valid)
      try {
        await api.post('/api/auth/logout');
      } catch {
        // Backend logout is best-effort, don't block client logout
      }
      await signOut(auth);
      setDbProfile(null);
      playSound('questComplete');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      setError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbProfile,
        loading,
        syncing,
        error,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAnonymously,
        logout,
        clearError,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
