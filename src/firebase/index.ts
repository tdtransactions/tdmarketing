'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { useMemo } from 'react';

/**
 * Khởi tạo Firebase SDK
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    database: getDatabase(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

/**
 * Hook để memoize các query Firestore theo yêu cầu của useCollection/useDoc
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T & { __memo: boolean } {
  const memoized = useMemo(factory, deps);
  if (memoized) {
    (memoized as any).__memo = true;
  }
  return memoized as T & { __memo: boolean };
}

export * from './provider';
export * from './client-provider';
export * from './database/use-database';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export { useUser } from './auth/use-user';
