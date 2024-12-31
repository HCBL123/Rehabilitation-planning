// src/pages/DoctorDashboard.tsx
import React from 'react';
import { useDoctor } from '../../hooks/useDoctor';
import { Users, Calendar, Activity, Settings, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { loading, error, doctorData } = useDoctor();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Bệnh nhân của tôi',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      link: '/doctor/patients',
      description: 'Xem và quản lý bệnh nhân'
    },
    {
      title: 'Lịch hẹn',
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      link: '/doctor/appointments',
      description: 'Lên lịch và quản lý cuộc hẹn'
    },
    {
      title: 'Điều trị',
      icon: <Activity className="w-8 h-8 text-purple-500" />,
      link: '/doctor/analysis',
      description: 'Quản lý kế hoạch điều trị'
    },
    {
      title: 'Chat',
      icon: <MessageSquare className="w-8 h-8 text-orange-500" />,
      link: '/doctor/messages',
      description: 'Trò chuyện với bệnh nhân'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, Dr. {doctorData?.firstName} {doctorData?.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your patients and appointments
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gray-50 rounded-full mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <Users className="w-5 h-5 mr-2" />
                Add New Patient
              </button>
              <button className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Appointment
              </button>
              <button className="flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
