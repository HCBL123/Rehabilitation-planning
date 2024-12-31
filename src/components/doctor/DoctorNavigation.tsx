import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ClipboardList,
  UserCog
} from 'lucide-react';

const DoctorNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationLinks = [
    {
      name: 'Bảng điều khiển',
      path: '/doctor/dashboard',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Lịch hẹn',
      path: '/doctor/appointments',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      name: 'Bệnh nhân',
      path: '/doctor/patients',
      icon: <UserCog className="w-5 h-5" />
    },
    {
      name: 'Kế hoạch điều trị',
      path: '/doctor/analysis',
      icon: <ClipboardList className="w-5 h-5" />
    },
    {
      name: 'Cài đặt',
      path: '/doctor/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/doctor/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">MedRehab</span>
              <span className="ml-2 text-sm font-medium text-gray-500">Doctor Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(link.path)
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {currentUser?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(link.path)
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    {link.icon}
                    <span className="ml-2">{link.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DoctorNavigation; 