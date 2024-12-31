import React, { useEffect } from 'react';
import { auth } from '../config/firebase';

const AuthDebug: React.FC = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', {
        isAuthenticated: !!user,
        uid: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default AuthDebug;
