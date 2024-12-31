import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BarChart2 
} from 'lucide-react';

const PatientDetail = () => {
  const { patientId } = useParams();

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xl font-medium">JP</span>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">John Patient</h1>
              <p className="text-gray-500">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Session Completion</p>
                <p className="text-2xl font-bold">12/15</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Performance</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {/* Add session history chart or list here */}
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <BarChart2 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Exercise Progress */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Exercise Progress</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((exercise) => (
              <div key={exercise} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Exercise {exercise}</h3>
                  <span className="text-sm text-gray-500">85% completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail; 