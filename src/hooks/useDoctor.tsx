import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebase';

export const useDoctor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorData, setDoctorData] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const doctorRef = ref(db, `doctors/${auth.currentUser.uid}`);
    const unsubscribe = onValue(doctorRef, (snapshot) => {
      if (snapshot.exists()) {
        setDoctorData({ id: snapshot.key, ...snapshot.val() });
      }
      setLoading(false);
    }, (error) => {
      setError('Failed to fetch doctor data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { loading, error, doctorData };
};

export default useDoctor; 