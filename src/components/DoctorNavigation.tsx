import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Users, 
  Calendar, 
  MessageSquare,
  Bell,
  ChevronDown,
  FileText
} from 'lucide-react';

const DoctorNavigation = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="flex items-center h-14 px-4">
        {/* Logo */}
        <Link to="/doctor/dashboard" className="flex items-center">
          <span className="text-lg font-bold text-blue-600 mr-1">Rehab</span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex items-center ml-8 space-x-6">
          <Link 
            to="/doctor/dashboard"
            className={`flex items-center space-x-1.5 ${
              location.pathname === '/doctor/dashboard' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Home size={18} />
            <span className="text-sm">Dashboard</span>
          </Link>

          <Link 
            to="/doctor/patients"
            className={`flex items-center space-x-1.5 ${
              location.pathname === '/doctor/patients' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Users size={18} />
            <span className="text-sm">Patients</span>
          </Link>

          <Link 
            to="/doctor/appointments"
            className={`flex items-center space-x-1.5 ${
              location.pathname === '/doctor/appointments' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Calendar size={18} />
            <span className="text-sm">Appointments</span>
          </Link>

          <Link 
            to="/doctor/messages"
            className={`flex items-center space-x-1.5 ${
              location.pathname === '/doctor/messages' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MessageSquare size={18} />
            <span className="text-sm">Messages</span>
          </Link>

          <Link 
            to="/doctor/analysis"
            className={`flex items-center space-x-1.5 ${
              location.pathname === '/doctor/analysis' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FileText size={18} />
            <span className="text-sm">Analysis</span>
          </Link>
        </nav>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center ml-auto space-x-3">
          <button className="relative p-1.5 text-gray-600 hover:text-blue-600">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-1 cursor-pointer">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">D</span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorNavigation; 