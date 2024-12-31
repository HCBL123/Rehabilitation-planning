// src/services/patientService.ts
import {
  ref,
  get,
  set,
  update,
  query,
  orderByChild,
  limitToLast,
  push
} from 'firebase/database';
import { db, auth } from '../config/firebase';
import { PatientData, Exercise, ExerciseHistory } from '../types/patient';

export const getPatientData = async (): Promise<PatientData | null> => {
  try {
    if (!auth.currentUser) return null;

    const patientRef = ref(db, `patients/${auth.currentUser.uid}`);
    const snapshot = await get(patientRef);

    if (!snapshot.exists()) return null;

    return {
      id: auth.currentUser.uid,
      ...snapshot.val()
    } as PatientData;
  } catch (error) {
    console.error('Error fetching patient data:', error);
    throw error;
  }
};

export const updatePatientData = async (data: Partial<PatientData>): Promise<void> => {
  try {
    if (!auth.currentUser) throw new Error('No authenticated user');

    const patientRef = ref(db, `patients/${auth.currentUser.uid}`);
    await update(patientRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating patient data:', error);
    throw error;
  }
};

export const getUpcomingExercises = async (): Promise<Exercise[]> => {
  try {
    if (!auth.currentUser) return [];

    const exercisesRef = ref(db, `patients/${auth.currentUser.uid}/exercises`);
    const exercisesQuery = query(exercisesRef, orderByChild('nextSession'), limitToLast(10));
    const snapshot = await get(exercisesQuery);

    if (!snapshot.exists()) return [];

    const exercises: Exercise[] = [];
    snapshot.forEach((child) => {
      exercises.push({
        id: child.key!,
        ...child.val()
      });
    });

    return exercises.filter(ex => ex.nextSession && new Date(ex.nextSession) >= new Date());
  } catch (error) {
    console.error('Error fetching upcoming exercises:', error);
    throw error;
  }
};

export const getExerciseHistory = async (): Promise<ExerciseHistory[]> => {
  try {
    if (!auth.currentUser) return [];

    const historyRef = ref(db, `patients/${auth.currentUser.uid}/exerciseHistory`);
    const historyQuery = query(historyRef, orderByChild('date'), limitToLast(10));
    const snapshot = await get(historyQuery);

    if (!snapshot.exists()) return [];

    const history: ExerciseHistory[] = [];
    snapshot.forEach((child) => {
      history.push({
        id: child.key!,
        ...child.val(),
        date: new Date(child.val().date)
      });
    });

    return history;
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    throw error;
  }
};

export const initializePatientData = async (uid: string, email: string): Promise<void> => {
  try {
    const patientRef = ref(db, `patients/${uid}`);
    await set(patientRef, {
      email,
      firstName: '',
      lastName: '',
      memberSince: new Date().toISOString(),
      exercisesCompleted: 0,
      weeklyGoal: 10,
      totalMinutes: 0,
      averageScore: 0,
      currentStreak: 0,
      healthScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initializing patient data:', error);
    throw error;
  }
};
