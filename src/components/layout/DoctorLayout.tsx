import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorNavigation from '../DoctorNavigation';

const DoctorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavigation />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout; 