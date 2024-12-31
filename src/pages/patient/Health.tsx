import React, { useState } from 'react';
import { usePatient } from '../../hooks/usePatients';
import {
  Heart,
  Activity,
  Weight,
  Thermometer,
  Droplets,
  Clock,
  Moon,
  AlertCircle,
  Plus,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

const Health = () => {
  const { loading, error, patientData } = usePatient();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from backend
  const vitalsHistory = [
    { date: subDays(new Date(), 6).toISOString(), heartRate: 72, bloodPressure: 120, sleep: 7.5 },
    { date: subDays(new Date(), 5).toISOString(), heartRate: 75, bloodPressure: 118, sleep: 8 },
    { date: subDays(new Date(), 4).toISOString(), heartRate: 70, bloodPressure: 122, sleep: 6.5 },
    { date: subDays(new Date(), 3).toISOString(), heartRate: 73, bloodPressure: 119, sleep: 7 },
    { date: subDays(new Date(), 2).toISOString(), heartRate: 71, bloodPressure: 121, sleep: 7.8 },
    { date: subDays(new Date(), 1).toISOString(), heartRate: 74, bloodPressure: 117, sleep: 8.2 },
    { date: new Date().toISOString(), heartRate: 72, bloodPressure: 120, sleep: 7.5 }
  ];

  const medications = [
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM' },
    { name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily', time: '8:00 AM' },
    { name: 'Calcium', dosage: '500mg', frequency: 'Once daily', time: '8:00 AM' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'vitals', label: 'Vitals' },
    { id: 'medications', label: 'Medications' },
    { id: 'sleep', label: 'Sleep' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
          <p className="text-gray-600">Monitor your vital signs and overall wellness</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-2xl font-bold text-gray-900">72 BPM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="text-2xl font-bold text-gray-900">120/80</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Moon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sleep</p>
                <p className="text-2xl font-bold text-gray-900">7.5h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Activity Level</p>
                <p className="text-2xl font-bold text-gray-900">Good</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="h-80">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Health Trends</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalsHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'EEE')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ fill: '#EF4444' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bloodPressure"
                        name="Blood Pressure"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sleep"
                        name="Sleep (hours)"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medication
                  </button>
                </div>
                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Next dose: {medication.time}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vitalsHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), 'EEE')}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                          />
                          <Line
                            type="monotone"
                            dataKey="heartRate"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={{ fill: '#EF4444' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vitalsHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), 'EEE')}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                          />
                          <Line
                            type="monotone"
                            dataKey="bloodPressure"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sleep' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Pattern</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalsHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => format(new Date(date), 'EEE')}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                        />
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          name="Sleep Duration"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health; 