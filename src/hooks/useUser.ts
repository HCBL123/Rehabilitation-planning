import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const useUser = () => {
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!currentUser) return;

      const patientRef = ref(db, `patients/${currentUser.uid}`);
      const doctorRef = ref(db, `doctors/${currentUser.uid}`);

      const [patientSnap, doctorSnap] = await Promise.all([
        get(patientRef),
        get(doctorRef)
      ]);

      if (patientSnap.exists()) {
        setUserRole('patient');
      } else if (doctorSnap.exists()) {
        setUserRole('doctor');
      }
    };

    checkUserRole();
  }, [currentUser]);

  return { userRole };
}; 