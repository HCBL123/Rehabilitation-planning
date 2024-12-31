import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const PatientNavigation = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navigationItems = [
    { path: '/patient/dashboard', label: 'Bảng điều khiển' },
    { path: '/patient/exercises', label: 'Bài tập' },
    { path: '/patient/schedule', label: 'Lịch trình' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/patient/dashboard" className="flex-shrink-0">
              <span className="text-xl font-semibold text-blue-600">
                MedRehab
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-1 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Profile Button */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <span>Profile</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.email}
                    </p>
                  </div>
                  <Link
                    to="/patient/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientNavigation; 