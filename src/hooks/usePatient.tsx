import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { auth, db } from '../config/firebase';

export const usePatient = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [upcomingExercises, setUpcomingExercises] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const patientId = auth.currentUser.uid;

    // Subscribe to patient data
    const patientRef = ref(db, `patients/${patientId}`);
    const unsubscribePatient = onValue(patientRef, (snapshot) => {
      if (snapshot.exists()) {
        setPatientData({ id: snapshot.key, ...snapshot.val() });
      } else {
        setError('Patient data not found');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching patient data:', error);
      setError('Failed to fetch patient data');
      setLoading(false);
    });

    // Subscribe to upcoming exercises
    const exercisesRef = ref(db, `patients/${patientId}/exercises`);
    const exercisesQuery = query(exercisesRef, orderByChild('nextSession'), limitToLast(10));
    const unsubscribeExercises = onValue(exercisesQuery, (snapshot) => {
      const exercises: any[] = [];
      snapshot.forEach((child) => {
        exercises.push({
          id: child.key,
          ...child.val()
        });
      });
      setUpcomingExercises(exercises.filter(ex => new Date(ex.nextSession) >= new Date()));
    });

    // Subscribe to exercise history
    const historyRef = ref(db, `patients/${patientId}/exerciseHistory`);
    const historyQuery = query(historyRef, orderByChild('date'), limitToLast(10));
    const unsubscribeHistory = onValue(historyQuery, (snapshot) => {
      const history: any[] = [];
      snapshot.forEach((child) => {
        history.push({
          id: child.key,
          ...child.val(),
          date: new Date(child.val().date)
        });
      });
      setExerciseHistory(history);
    });

    return () => {
      unsubscribePatient();
      unsubscribeExercises();
      unsubscribeHistory();
    };
  }, []);

  return { loading, error, patientData, exerciseHistory, upcomingExercises };
}; 