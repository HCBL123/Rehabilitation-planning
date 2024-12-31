import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase';
import Navigation from '../Navigation';
import DoctorNavigation from '../DoctorNavigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<'doctor' | 'patient' | null>(null);
  const hideNavigation = ['/login', '/register', '/'].includes(location.pathname);

  useEffect(() => {
    const getUserRole = async () => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        setUserRole(snapshot.val()?.role);
      }
    };
    getUserRole();
  }, [currentUser]);

    return (
    <>
      {!hideNavigation && (userRole === 'doctor' ? <DoctorNavigation /> : <Navigation />)}
      {children}
    </>
  );
};

export default Layout;
