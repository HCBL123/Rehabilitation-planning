// src/utils/initializeFirebaseData.ts
import {
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializePatientDataWithSamples = async (uid: string, email: string) => {
  try {
    // Initialize main patient document
    const patientRef = doc(db, 'patients', uid);
    await setDoc(patientRef, {
      email,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      memberSince: Timestamp.fromDate(new Date('2024-01-01')),
      exercisesCompleted: 45,
      weeklyGoal: 10,
      totalMinutes: 1240,
      averageScore: 85,
      currentStreak: 5,
      healthScore: 92,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Add sample exercises
    const exercises = [
      {
        name: 'Shoulder Mobility',
        type: 'Mobility',
        duration: '15 mins',
        difficulty: 'Medium',
        progress: 75,
        nextSession: Timestamp.fromDate(new Date(Date.now() + 86400000)), // tomorrow
        description: 'Improve shoulder range of motion and stability',
        sets: 3,
        reps: 12
      },
      {
        name: 'Knee Strengthening',
        type: 'Strength',
        duration: '20 mins',
        difficulty: 'Hard',
        progress: 60,
        nextSession: Timestamp.fromDate(new Date(Date.now() + 172800000)), // day after tomorrow
        description: 'Build strength in knee muscles and surrounding area',
        sets: 4,
        reps: 10
      }
    ];

    const exercisesRef = collection(db, 'patients', uid, 'exercises');
    for (const exercise of exercises) {
      await addDoc(exercisesRef, exercise);
    }

    // Add sample exercise history
    const history = [
      {
        exerciseName: 'Hip Mobility',
        type: 'Mobility',
        date: Timestamp.fromDate(new Date(Date.now() - 86400000)), // yesterday
        score: 92,
        duration: '15 mins'
      },
      {
        exerciseName: 'Core Stability',
        type: 'Strength',
        date: Timestamp.fromDate(new Date(Date.now() - 172800000)), // 2 days ago
        score: 88,
        duration: '20 mins'
      }
    ];

    const historyRef = collection(db, 'patients', uid, 'exerciseHistory');
    for (const record of history) {
      await addDoc(historyRef, record);
    }

    // Add sample achievements
    const achievements = [
      {
        title: 'Perfect Week',
        description: 'Completed all exercises for 7 days straight',
        date: Timestamp.fromDate(new Date(Date.now() - 172800000)),
        type: 'streak'
      },
      {
        title: 'Progress Master',
        description: 'Improved performance by 20%',
        date: Timestamp.fromDate(new Date(Date.now() - 432000000)),
        type: 'progress'
      }
    ];

    const achievementsRef = collection(db, 'patients', uid, 'achievements');
    for (const achievement of achievements) {
      await addDoc(achievementsRef, achievement);
    }

  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

// Add this to your registration process or call it manually for testing
// Example usage:
// import { initializePatientDataWithSamples } from './utils/initializeFirebaseData';
// await initializePatientDataWithSamples(user.uid, user.email);
