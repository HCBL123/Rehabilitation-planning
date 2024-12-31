import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import {
  Trophy, Clock, Activity, TrendingUp, 
  BarChart2, ChevronRight, Target, Zap
} from 'lucide-react';
import CircularProgress from '../../components/ui/CircularProgress';

const ResultCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ icon: Icon, title, value, description }) => (
  <ResultCard>
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-blue-50">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  </ResultCard>
);

const Results = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const exerciseData = location.state?.exerciseData;
  
  useEffect(() => {
    if (!exerciseData) {
      navigate('/patient/exercises');
      return;
    }

    const saveResults = async () => {
      try {
        const resultRef = collection(db, 'exercise_results');
        await addDoc(resultRef, {
          userId: currentUser.uid,
          exerciseId: exerciseData.exerciseId,
          exerciseName: exerciseData.exerciseName,
          timestamp: serverTimestamp(),
          score: exerciseData.score,
          duration: exerciseData.duration,
          repetitions: exerciseData.repetitions,
          accuracy: exerciseData.accuracy,
          feedback: exerciseData.feedback
        });

        const userExerciseRef = doc(db, 'users', currentUser.uid, 'exercise_history', exerciseData.exerciseId);
        await setDoc(userExerciseRef, {
          lastCompleted: serverTimestamp(),
          totalSessions: increment(1),
          bestScore: Math.max(exerciseData.score, 0),
        }, { merge: true });

      } catch (error) {
        console.error('Error saving results:', error);
      }
    };

    saveResults();
  }, [exerciseData, currentUser]);

  if (!exerciseData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kết quả bài tập</h1>
          <p className="text-gray-600">
            {exerciseData.exerciseName} - {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ResultCard className="flex flex-col items-center justify-center p-8">
            <CircularProgress value={exerciseData.score} />
            <h2 className="text-xl font-semibold mt-4">Điểm số tổng thể</h2>
          </ResultCard>

          <ResultCard>
            <h3 className="text-lg font-semibold mb-4">Độ chính xác</h3>
            <div className="space-y-4">
              {Object.entries(exerciseData.accuracy || {}).map(([part, score]) => (
                <div key={part} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{part}</span>
                    <span className="font-medium">{Math.round(score)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Activity}
            title="Số lần thực hiện"
            value={exerciseData.repetitions}
            description="Tổng số lần thực hiện động tác"
          />
          <MetricCard
            icon={Clock}
            title="Thời gian"
            value={exerciseData.duration}
            description="Thời gian thực hiện"
          />
          <MetricCard
            icon={Target}
            title="Độ chính xác"
            value={`${Math.round(exerciseData.accuracy?.average || 0)}%`}
            description="Độ chính xác trung bình"
          />
        </div>

        <ResultCard className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Nhận xét</h3>
          <div className="space-y-2">
            {exerciseData.feedback?.map((item, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                {item}
              </div>
            ))}
          </div>
        </ResultCard>

        <div className="flex justify-center gap-4">
          <Link
            to={`/patient/exercise/${exerciseData.exerciseId}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/patient/exercises"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Quay lại danh sách
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results; 