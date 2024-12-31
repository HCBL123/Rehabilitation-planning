import { usePatient } from '../../hooks/usePatients';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Heart,
  Weight,
  Clock,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { PatientData, Progress, Achievement } from '../../types/patient';

const PatientProfile = () => {
  const { loading, error, patientData } = usePatient();

  // Mock data - replace with real data from patientData
  const progressData = [
    { date: '2024-01', score: 65 },
    { date: '2024-02', score: 72 },
    { date: '2024-03', score: 78 },
    { date: '2024-04', score: 85 }
  ];

  const achievements = [
    {
      id: '1',
      title: 'Perfect Week',
      description: 'Completed all exercises for 7 days straight',
      date: new Date(),
      type: 'streak' as const,
    },
    {
      id: '2',
      title: 'Progress Master',
      description: 'Improved performance by 20%',
      date: new Date(),
      type: 'progress' as const,
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-900">{error || 'Patient data not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0">
              {patientData.firstName[0]}
            </div>
            <div className="md:ml-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                {patientData.firstName} {patientData.lastName}
              </h1>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>{patientData.email}</span>
                </div>
                {patientData.phone && (
                  <div className="flex items-center justify-center md:justify-start text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <span>{patientData.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Member since {patientData.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Weekly Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((patientData.exercisesCompleted || 0) / (patientData.weeklyGoal || 1) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{patientData.healthScore || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{patientData.totalMinutes || 0}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{patientData.currentStreak || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Progress Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientData.progress || progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
              <div className="space-y-6">
                {(patientData.achievements || achievements).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-gray-50 rounded-lg p-4 transform hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center mb-2">
                      {achievement.type === 'streak' ? (
                        <Award className="w-8 h-8 text-yellow-500" />
                      ) : (
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      )}
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(achievement.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
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

export default PatientProfile;
