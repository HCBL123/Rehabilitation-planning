// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { initializePatientDataWithSamples } from '../utils/initializeFirebaseData';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, userData: { 
    firstName: string;
    lastName: string;
    role: 'doctor' | 'patient';
  }) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, userData: { 
    firstName: string;
    lastName: string;
    role: 'doctor' | 'patient';
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        email: email,
        createdAt: serverTimestamp()
      });

      return userCredential;
    } catch (error) {
      console.error('Error in register:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
