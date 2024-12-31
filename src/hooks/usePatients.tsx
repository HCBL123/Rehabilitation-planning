// src/hooks/usePatient.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebase';

export const usePatient = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const patientRef = ref(db, `patients/${auth.currentUser.uid}`);
    const unsubscribe = onValue(patientRef, (snapshot) => {
      if (snapshot.exists()) {
        setPatientData({ id: snapshot.key, ...snapshot.val() });
      }
      setLoading(false);
    }, (error) => {
      setError('Failed to fetch patient data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { loading, error, patientData };
};

export default usePatient;
