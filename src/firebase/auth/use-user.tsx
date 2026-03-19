
'use client';

import { signOut as firebaseSignOut } from 'firebase/auth';
import { useFirebase } from '../provider';

/**
 * Hook để lấy thông tin người dùng và profile từ Context chung
 */
export function useUser() {
  const { user, profile, loading, auth } = useFirebase();

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { 
    user, 
    profile, 
    loading,
    isUserLoading: loading,
    signOut 
  };
}
