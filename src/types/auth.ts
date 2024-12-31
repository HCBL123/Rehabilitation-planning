import { User as FirebaseUser } from 'firebase/auth';

interface User extends FirebaseUser {
  role?: 'doctor' | 'patient';
}

export type { User };