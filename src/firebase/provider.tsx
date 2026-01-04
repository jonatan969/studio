'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { Auth, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { User as AppUser } from '@/lib/types';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Combine Firebase Auth user with our custom app user data
export type CombinedUser = FirebaseUser & AppUser;

// Internal state for user authentication
interface UserAuthState {
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; 
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  refreshUser: () => Promise<void>;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  refreshUser: () => Promise<void>;
}

// Return type for useUser()
export interface UserHookResult {
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  refreshUser: () => Promise<void>;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);


export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  const fetchAppUser = useCallback(async (firebaseUser: FirebaseUser | null): Promise<CombinedUser | null> => {
    if (!firebaseUser || !firestore) return null;
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const appUserData = userDocSnap.data() as AppUser;
      return { ...firebaseUser, ...appUserData };
    }
    
    // This case can happen during signup before the user doc is created.
    // We can return the basic Firebase user and let the app handle the missing fields.
    return { ...firebaseUser, uid: firebaseUser.uid, email: firebaseUser.email, nickname: firebaseUser.displayName, photoURL: firebaseUser.photoURL };

  }, [firestore]);


  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const combinedUser = await fetchAppUser(auth.currentUser);
        setUserAuthState(prevState => ({ ...prevState, user: combinedUser }));
      } catch (error) {
        console.error("FirebaseProvider: Error reloading user:", error);
      }
    }
  }, [auth, fetchAppUser]);

  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUserAuthState(prevState => ({ ...prevState, isUserLoading: true }));
        const combinedUser = await fetchAppUser(firebaseUser);
        setUserAuthState({ user: combinedUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth, fetchAppUser]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      refreshUser,
    };
  }, [firebaseApp, firestore, auth, userAuthState, refreshUser]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    refreshUser: context.refreshUser,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError, refreshUser } = useFirebase();
  return { user, isUserLoading, userError, refreshUser };
};
