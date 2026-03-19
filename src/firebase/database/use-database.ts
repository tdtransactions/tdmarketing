'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off, Query, query as dbQuery, orderByChild, equalTo } from 'firebase/database';
import { useDatabase } from '../provider';

/**
 * Hook to listen to a list of data from Realtime Database
 */
export function useDatabaseList<T = any>(path: string, filter?: { field: string; value: any }) {
  const db = useDatabase();
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;
    
    let finalQuery: Query = ref(db, path);
    if (filter && filter.field && filter.value !== undefined) {
      finalQuery = dbQuery(finalQuery, orderByChild(filter.field), equalTo(filter.value));
    }

    const handleValue = (snapshot: any) => {
      try {
        const val = snapshot.val();
        if (val) {
          // RTDB returns an object or an array. We normalize it to a list with IDs.
          const results = Object.entries(val).map(([key, value]: [string, any]) => ({
            ...(typeof value === 'object' ? value : { value }),
            id: key
          }));
          setData(results as any);
        } else {
          setData([]);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error parsing RTDB snapshot:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    const handleError = (err: Error) => {
      console.error(`RTDB List Error at path "${path}":`, err);
      setError(err);
      setLoading(false);
    };

    onValue(finalQuery, handleValue, handleError);
    return () => off(finalQuery, 'value', handleValue);
  }, [db, path, JSON.stringify(filter)]);

  return { data, loading, error };
}

/**
 * Hook to listen to a single object from Realtime Database
 */
export function useDatabaseObject<T = any>(path: string) {
  const db = useDatabase();
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    const dbRef = ref(db, path);
    const handleValue = (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        setData({ 
          ...(typeof val === 'object' ? val : { value: val }), 
          id: snapshot.key 
        } as any);
      } else {
        setData(null);
      }
      setLoading(false);
      setError(null);
    };

    const handleError = (err: Error) => {
      console.error(`RTDB Object Error at path "${path}":`, err);
      setError(err);
      setLoading(false);
    };

    onValue(dbRef, handleValue, handleError);
    return () => off(dbRef, 'value', handleValue);
  }, [db, path]);

  return { data, loading, error };
}
