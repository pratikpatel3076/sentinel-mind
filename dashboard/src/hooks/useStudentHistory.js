import { useState, useEffect } from 'react';
import { getHistory } from '../api/client';

export function useStudentHistory(studentId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHistory(studentId)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId]);

  return { history, loading, error };
}
