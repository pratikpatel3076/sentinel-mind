import { useState, useEffect } from 'react';
import { getStudents } from '../api/client';

export function useStudents(refreshTrigger) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStudents()
      .then((data) => {
        if (!cancelled) setStudents(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  return { students, loading, error };
}
