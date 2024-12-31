// src/types/patient.ts

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  memberSince: string;
  exercisesCompleted?: number;
  weeklyGoal?: number;
  totalMinutes?: number;
  averageScore?: number;
  currentStreak?: number;
  nextAppointment?: Date;
  medicalConditions?: string[];
  healthScore?: number;
  achievements?: Achievement[];
  progress?: Progress[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'streak' | 'progress' | 'milestone';
}

export interface Progress {
  date: string;
  score: number;
}

export interface Exercise {
  id: string;
  name: string;
  type: 'Mobility' | 'Strength' | 'Balance' | 'Flexibility';
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  progress: number;
  nextSession?: string;
  description: string;
  sets?: number;
  reps?: number;
}

export interface ExerciseHistory {
  id: string;
  exerciseName: string;
  date: Date;
  score: number;
  duration: string;
  type: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  diagnosis: string;
  status: 'Đang điều trị' | 'Hoàn thành' | 'Tạm ngưng';
  lastVisit?: string;
}
