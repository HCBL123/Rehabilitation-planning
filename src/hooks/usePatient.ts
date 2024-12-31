import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebase';

interface UsePatientReturn {
  loading: boolean;
  error: string | null;
  patientData: any;
  exerciseHistory: any[];
}

export const usePatient = (): UsePatientReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const historyRef = ref(db, `exerciseHistory/${auth.currentUser.uid}`);
    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const history = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setExerciseHistory(history);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { loading, error, patientData, exerciseHistory };
}; 