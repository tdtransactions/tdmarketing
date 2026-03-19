
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      database={firebaseServices.database}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
