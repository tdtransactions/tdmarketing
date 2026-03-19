'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, useRef } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Database, ref, onValue, query, orderByChild, equalTo, get, Unsubscribe } from 'firebase/database';
import { Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  database: Database;
  firestore: Firestore;
  auth: Auth;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  database: Database;
  firestore: Firestore;
  auth: Auth;
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  database,
  firestore,
  auth,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const savedUser = localStorage.getItem('storepulse_session');
      if (savedUser && database) {
        try {
          const userData = JSON.parse(savedUser);
          // Quan trọng: Phải đợi xác thực hoàn tất
          await signInAnonymously(auth);
          
          const userRef = ref(database, `app_users/${userData.id}`);
          
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }

          unsubscribeRef.current = onValue(userRef, async (snapshot) => {
            const val = snapshot.val();
            if (val && val.status === 'Active') {
              const fullProfile = { ...val, id: userData.id };
              setProfile(fullProfile);
              
              // Cập nhật quyền Admin Firestore ngay lập tức khi đã có auth.currentUser
              if (val.role === 'Admin' && auth.currentUser) {
                setDoc(doc(firestore, 'admin_roles', auth.currentUser.uid), {
                  email: val.email,
                  updatedAt: serverTimestamp()
                }, { merge: true }).catch(() => {});
              }
            } else {
              setProfile(null);
              localStorage.removeItem('storepulse_session');
            }
            setLoading(false);
          }, (error) => {
            console.error("Lỗi đồng bộ phiên làm việc:", error);
            setLoading(false);
          });
        } catch (e) {
          console.error("Lỗi khởi tạo phiên làm việc:", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initSession();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [database, auth, firestore]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Xác thực vô danh để có UID Firebase Auth
      const userCred = await signInAnonymously(auth);
      
      const cleanEmail = String(email || "").toLowerCase().trim();
      const cleanPass = String(pass || "").trim();

      const usersRef = ref(database, 'app_users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(cleanEmail));
      const snapshot = await get(emailQuery);
      
      if (!snapshot.exists()) {
        throw new Error(`Tài khoản "${cleanEmail}" không tồn tại.`);
      }

      const data = snapshot.val();
      const userKey = Object.keys(data)[0];
      const userData = data[userKey];

      const dbPass = String(userData.password || "").trim();
      if (dbPass !== cleanPass) {
        throw new Error("Mật khẩu không chính xác.");
      }

      if (userData.status !== 'Active') {
        throw new Error("Tài khoản hiện đang bị khóa.");
      }

      const fullProfile = { ...userData, id: userKey };
      setProfile(fullProfile);
      localStorage.setItem('storepulse_session', JSON.stringify(fullProfile));

      // Thiết lập quyền Admin Firestore để đồng bộ với Security Rules
      if (userData.role === 'Admin' && userCred.user) {
        await setDoc(doc(firestore, 'admin_roles', userCred.user.uid), {
          email: userData.email,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      const userRef = ref(database, `app_users/${userKey}`);
      if (unsubscribeRef.current) unsubscribeRef.current();
      
      unsubscribeRef.current = onValue(userRef, (sn) => {
        const val = sn.val();
        if (val && val.status === 'Active') {
          setProfile({ ...val, id: userKey });
        } else {
          logout();
        }
      });

    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    localStorage.removeItem('storepulse_session');
    setProfile(null);
    window.location.href = '/login';
  };

  const contextValue = useMemo(() => ({
    firebaseApp,
    database,
    firestore,
    auth,
    user: profile,
    profile,
    loading,
    login,
    logout,
  }), [firebaseApp, database, firestore, auth, profile, loading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase phải được đặt trong FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useDatabase = () => useFirebase().database;
export const useFirestore = () => useFirebase().firestore;
