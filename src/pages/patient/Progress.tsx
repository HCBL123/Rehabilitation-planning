import React from 'react';
import { usePatient } from '../../hooks/usePatients';
import {
  Activity,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';

const Progress = () => {
  const { loading, error, patientData } = usePatient();

  // Mock data - replace with real data from backend
  const weeklyProgress = [
    { date: subDays(new Date(), 6).toISOString(), score: 65, exercises: 4 },
    { date: subDays(new Date(), 5).toISOString(), score: 72, exercises: 5 },
    { date: subDays(new Date(), 4).toISOString(), score: 78, exercises: 6 },
    { date: subDays(new Date(), 3).toISOString(), score: 75, exercises: 4 },
    { date: subDays(new Date(), 2).toISOString(), score: 82, exercises: 7 },
    { date: subDays(new Date(), 1).toISOString(), score: 85, exercises: 6 },
    { date: new Date().toISOString(), score: 88, exercises: 7 }
  ];

  const exerciseProgress = [
    { name: 'Knee Flexion', completion: 85, target: 100 },
    { name: 'Ankle Rotation', completion: 92, target: 100 },
    { name: 'Hip Stretch', completion: 78, target: 100 },
    { name: 'Leg Press', completion: 65, target: 100 },
    { name: 'Balance Training', completion: 88, target: 100 }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Overview</h1>
          <p className="text-gray-600">Track your rehabilitation journey and achievements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">88%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Goals Completed</p>
                <p className="text-2xl font-bold text-gray-900">12/15</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Exercise Time</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'EEE')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Progress Score"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exercises"
                    name="Exercises Completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exercise Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Exercise Progress</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="completion"
                    name="Completion"
                    fill="#3B82F6"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="target"
                    name="Target"
                    fill="#E5E7EB"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress; 