import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { usePatient } from '../../hooks/usePatients';

const PatientSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const { loading, error, upcomingExercises, patientData } = usePatient();

  // Mock appointments data - replace with real data from Firebase
  const appointments = [
    {
      id: 1,
      type: 'Video Consultation',
      doctor: 'Dr. Sarah Wilson',
      date: addDays(new Date(), 1),
      time: '10:00 AM',
      duration: '30 min',
      status: 'upcoming'
    },
    {
      id: 2,
      type: 'Physical Therapy',
      doctor: 'Dr. Michael Chen',
      date: addDays(new Date(), 3),
      time: '2:30 PM',
      duration: '45 min',
      status: 'upcoming'
    }
  ];

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getDaySchedule = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-900">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
              <p className="text-gray-600">Manage your appointments and exercise sessions</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentWeekStart, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentWeekStart(new Date())}
                className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-4">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`text-center p-2 rounded-lg cursor-pointer transition-colors ${isSameDay(day, selectedDate)
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
                  }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm text-gray-600">{format(day, 'EEE')}</div>
                <div className="font-semibold">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule for Selected Day */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Appointments for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <div className="space-y-4">
                {getDaySchedule(selectedDate).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.type}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <User className="w-4 h-4 mr-1" />
                          <span>{appointment.doctor}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Video className="w-4 h-4 mr-1" />
                          <span>{appointment.duration}</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        Join Call
                      </button>
                    </div>
                  </div>
                ))}
                {getDaySchedule(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No appointments scheduled for this day
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scheduled Exercises */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Today's Exercises
              </h2>
              <div className="space-y-4">
                {upcomingExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${exercise.type === 'Mobility' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {exercise.type}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{exercise.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSchedule;
