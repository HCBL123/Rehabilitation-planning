import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../../config/firebase';
import { Activity, Calendar, Clock, Award, TrendingUp } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  completed: boolean;
  score: number;
  date: string;
}

interface PatientData {
  firstName: string;
  lastName: string;
  exercisesCompleted: number;
  currentStreak: number;
  totalMinutes: number;
  averageScore: number;
  healthScore: number;
  weeklyGoal: number;
}

const PatientDashboardPage = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const patientRef = ref(db, `patients/${auth.currentUser.uid}`);
    const exercisesRef = ref(db, `exercises/${auth.currentUser.uid}`);

    // Listen for patient data changes
    const unsubscribePatient = onValue(patientRef, (snapshot) => {
      console.log('Patient data:', snapshot.val());
      if (snapshot.exists()) {
        setPatientData(snapshot.val());
      }
      setLoading(false);
    });

    // Listen for exercises changes
    const unsubscribeExercises = onValue(exercisesRef, (snapshot) => {
      console.log('Exercises data:', snapshot.val());
      if (snapshot.exists()) {
        const exercisesData = snapshot.val();
        const exercisesList = Object.entries(exercisesData)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5); // Get only the 5 most recent exercises
        setRecentExercises(exercisesList);
      }
    });

    return () => {
      unsubscribePatient();
      unsubscribeExercises();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Bài tập đã hoàn thành",
      value: patientData?.exercisesCompleted || 6,
      icon: <Activity className="h-6 w-6 text-white" />,
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      increase: "+5 tuần này"
    },
    {
      title: "Chuỗi ngày liên tiếp",
      value: `${patientData?.currentStreak || 3} ngày`,
      icon: <Calendar className="h-6 w-6 text-white" />,
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      increase: "Kỷ lục: 15 ngày"
    },
    {
      title: "Tổng số phút",
      value: patientData?.totalMinutes || 12,
      icon: <Clock className="h-6 w-6 text-white" />,
      bgColor: "bg-gradient-to-r from-green-500 to-green-600",
      increase: "+45 phút hôm nay"
    },
    {
      title: "Điểm trung bình",
      value: `${patientData?.averageScore || 80}%`,
      icon: <Award className="h-6 w-6 text-white" />,
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      increase: "+2% cải thiện"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Gradient */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Xin chào, {patientData?.firstName || 'Bệnh nhân'}
          </h1>
          <p className="mt-2 text-blue-100">
            Chào mừng trở lại với chương trình phục hồi chức năng của bạn
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Weekly Progress</span>
              <span>{patientData?.exercisesCompleted || 0}/{patientData?.weeklyGoal || 10} exercises</span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-2.5">
              <div 
                className="bg-blue-300 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${((patientData?.exercisesCompleted || 0) / (patientData?.weeklyGoal || 10)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg p-3 bg-white/10">
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-white/80">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-sm text-white/60 mt-1">{stat.increase}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bài tập gần đây */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Bài tập gần đây
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentExercises.length > 0 ? (
              recentExercises.map((exercise) => (
                <div key={exercise.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-sm text-gray-500">{exercise.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full 
                        ${exercise.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {exercise.completed ? 'Đã hoàn thành' : 'Đang thực hiện'}
                      </span>
                      <div className="flex items-center">
                        <Award className={`h-5 w-5 ${
                          exercise.score >= 80 ? 'text-green-500' :
                          exercise.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                        } mr-1`} />
                        <span className="text-sm font-medium text-gray-900">
                          {exercise.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="bg-gray-50 rounded-lg p-6">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Chưa có bài tập nào gần đây</p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Bắt đầu bài tập đầu tiên
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage; 