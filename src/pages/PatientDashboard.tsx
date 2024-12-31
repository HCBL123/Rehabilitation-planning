import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Timer,
  AlertCircle,
  TrendingUp,
  CheckCircle2
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
import { format } from 'date-fns';
import { PatientData, Exercise, ExerciseHistory } from '../types/patient';
import { getPatientData, getUpcomingExercises, getExerciseHistory } from '../services/patientService';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [upcomingExercises, setUpcomingExercises] = useState<Exercise[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patient, upcoming, history] = await Promise.all([
          getPatientData(),
          getUpcomingExercises(),
          getExerciseHistory()
        ]);

        setPatientData(patient);
        setUpcomingExercises(upcoming);
        setExerciseHistory(history);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold">
            Welcome back, {patientData?.firstName}!
          </h1>
          <p className="mt-2 text-blue-100">
            Let's continue your recovery journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Weekly Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((patientData?.exercisesCompleted || 0) / (patientData?.weeklyGoal || 1) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Timer className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Minutes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patientData?.totalMinutes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patientData?.averageScore || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patientData?.currentStreak || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Exercises */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Today's Exercises
              </h2>
              <div className="space-y-4">
                {upcomingExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/exercise/${exercise.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{exercise.duration} mins</span>
                          <span className="mx-2">•</span>
                          <span>{exercise.sets} sets</span>
                          <span className="mx-2">•</span>
                          <span>{exercise.reps} reps</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
                {upcomingExercises.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No exercises scheduled for today
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Exercise History
              </h2>
              <div className="space-y-4">
                {exerciseHistory.map((history) => (
                  <div key={history.id} className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className={`w-5 h-5 ${history.score >= 80 ? 'text-green-500' :
                          history.score >= 60 ? 'text-yellow-500' :
                            'text-red-500'
                        }`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {history.exerciseName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(history.date, 'MMM d, yyyy')} • Score: {history.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Appointment */}
        {patientData?.nextAppointment && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Next Appointment
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {format(patientData.nextAppointment, 'EEEE, MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <button
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => window.open('https://meet.google.com', '_blank')}
                >
                  Join Video Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Progress Chart */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Weekly Progress
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  />
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

        {/* Achievement Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Achievements
              </h2>
              <button className="text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: '7-Day Streak',
                  description: 'Completed exercises for 7 days in a row',
                  icon: <Award className="w-8 h-8 text-yellow-500" />,
                  date: '2 days ago'
                },
                {
                  title: 'Perfect Form',
                  description: 'Achieved 100% accuracy in exercise form',
                  icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
                  date: '1 week ago'
                },
                {
                  title: 'Quick Learner',
                  description: 'Mastered 5 new exercises',
                  icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
                  date: '2 weeks ago'
                }
              ].map((achievement, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    {achievement.icon}
                    <p className="text-xs text-gray-500 ml-auto">
                      {achievement.date}
                    </p>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
