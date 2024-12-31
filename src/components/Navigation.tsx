import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Calendar,
  Activity,
  Home,
  Search
} from 'lucide-react';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const { userRole } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New message from Dr. Smith', time: '5m ago', unread: true },
    { id: 2, message: 'Your next exercise is due', time: '1h ago', unread: true }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const links = userRole === 'doctor' ? [
    { href: '/doctor/dashboard', label: 'Bảng điều khiển', icon: <Home className="w-4 h-4" /> },
    { href: '/doctor/patients', label: 'Bệnh nhân', icon: <User className="w-4 h-4" /> },
    { href: '/doctor/appointments', label: 'Lịch hẹn', icon: <Calendar className="w-4 h-4" /> },
    { href: '/doctor/messages', label: 'Tin nhắn', icon: <MessageSquare className="w-4 h-4" /> }
  ] : [
    { href: '/patient/dashboard', label: 'Bảng điều khiển', icon: <Home className="w-4 h-4" /> },
    { href: '/patient/exercises', label: 'Bài tập', icon: <Activity className="w-4 h-4" /> },
    { href: '/patient/messages', label: 'Tin nhắn', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                MedRehab
              </span>
              <span className="hidden md:inline-block text-sm font-medium text-gray-500">
                {userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Navigation Links */}
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 ${
                          notification.unread ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {currentUser?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
                  <Link
                    to={`/${userRole}/profile`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to={`/${userRole}/settings`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                    location.pathname === link.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
