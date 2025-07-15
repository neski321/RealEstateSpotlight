import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from "@/lib/api";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  logCurrentUserIdToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  function signUp(email: string, password: string, firstName?: string, lastName?: string) {
    return createUserWithEmailAndPassword(auth, email, password).then(async (result) => {
      if (firstName || lastName) {
        await updateProfile(result.user, {
          displayName: `${firstName || ''} ${lastName || ''}`.trim()
        });
        // Force refresh the ID token so the backend sees the new user info
        await result.user.getIdToken(true);
        // Now send first and last name to backend to store in DB
        await api.put('/user/profile', { firstName, lastName });
      }
    });
  }

  function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signOutUser() {
    return signOut(auth);
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserProfile(displayName: string, photoURL?: string) {
    if (!currentUser) throw new Error('No user logged in');
    return updateProfile(currentUser, { displayName, photoURL });
  }

  // Add a helper to log the current user's ID token
  const logCurrentUserIdToken = async () => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken(true);
      console.log('Firebase ID Token:', token); // TEMPORARY DEBUG LOG
    } else {
      console.log('No user is currently signed in.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    logCurrentUserIdToken, // Expose the helper
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 