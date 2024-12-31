// src/pages/Results.jsx
import React, { useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getExerciseById } from '../data/exercises';
import CircularProgress from '../components/ui/circular-progress';
import {
  Trophy,
  Clock,
  Activity,
  TrendingUp,
  BarChart2,
  Award,
  ChevronRight,
  Target,
  Zap,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

const ResultCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ icon: Icon, title, value, description, trend }) => (
  <ResultCard>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-50">
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : null}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    )}
  </ResultCard>
);

const PerformanceGrade = ({ score }) => {
  const grade = useMemo(() => {
    if (score >= 90) return { letter: 'A+', color: 'text-green-500', message: 'Xuất sắc' };
    if (score >= 80) return { letter: 'A', color: 'text-green-400', message: 'Rất tốt' };
    if (score >= 70) return { letter: 'B', color: 'text-blue-500', message: 'Tốt' };
    if (score >= 60) return { letter: 'C', color: 'text-yellow-500', message: 'Khá' };
    if (score >= 50) return { letter: 'D', color: 'text-orange-500', message: 'Trung bình' };
    return { letter: 'F', color: 'text-red-500', message: 'Cần cải thiện' };
  }, [score]);

  return (
    <ResultCard className="text-center p-8">
      <div className={`text-7xl font-bold ${grade.color} mb-2`}>
        {grade.letter}
      </div>
      <div className="text-gray-600">{grade.message}</div>
    </ResultCard>
  );
};

const Results = () => {
  const { exerciseId } = useParams();
  const location = useLocation();
  const exercise = getExerciseById(exerciseId);

  const sessionData = location.state?.sessionData || {
    averageScore: 0,
    duration: '00:00',
    totalRepetitions: 0,
    bestStreak: 0,
    peakPerformance: 0,
    consistencyScore: 0,
    improvementRate: 0,
    performanceOverTime: [],
    areas: {
      leftArm: { score: 0, message: '' },
      rightArm: { score: 0, message: '' }
    }
  };

  // Calculate recommendations based on performance
  const recommendations = useMemo(() => {
    const tips = [];

    if (sessionData.averageScore < 60) {
      tips.push({
        type: 'warning',
        message: 'Tập trung vào việc thực hiện động tác chậm và chuẩn xác hơn'
      });
    }

    if (sessionData.consistencyScore < 70) {
      tips.push({
        type: 'info',
        message: 'Cần duy trì độ chính xác ổn định trong suốt bài tập'
      });
    }

    if (sessionData.totalRepetitions < 5) {
      tips.push({
        type: 'warning',
        message: 'Thực hiện thêm nhiều lần lặp lại để cải thiện kỹ năng'
      });
    }

    return tips;
  }, [sessionData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Kết Quả Bài Tập</h1>
            <div className="text-gray-500">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <p className="text-gray-600">Bài tập: {exercise?.name}</p>
        </div>

        {/* Main Score Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ResultCard className="flex flex-col items-center justify-center">
            <CircularProgress value={sessionData.averageScore} />
          </ResultCard>

          <ResultCard>
            <h3 className="text-lg font-semibold mb-4">Thông số chi tiết</h3>
            <div className="space-y-4">
              {Object.entries(sessionData.areas).map(([area, data]) => (
                <div key={area} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{area === 'leftArm' ? 'Tay trái' : 'Tay phải'}</span>
                    <span className="font-medium">{Math.round(data.score)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${data.score >= 80 ? 'bg-green-500' :
                          data.score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{data.message}</p>
                </div>
              ))}
            </div>
          </ResultCard>

          <PerformanceGrade score={sessionData.averageScore} />
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Zap}
            title="Điểm cao nhất"
            value={`${sessionData.peakPerformance}%`}
            description="Phong độ tốt nhất trong phiên tập"
          />
          <MetricCard
            icon={Target}
            title="Độ ổn định"
            value={`${Math.round(sessionData.consistencyScore)}%`}
            description="Mức độ ổn định trong suốt bài tập"
          />
          <MetricCard
            icon={Activity}
            title="Số lần lặp lại"
            value={sessionData.totalRepetitions}
            description="Tổng số lần thực hiện động tác"
          />
          <MetricCard
            icon={Clock}
            title="Thời gian tập"
            value={sessionData.duration}
            description="Tổng thời gian thực hiện"
          />
          <MetricCard
            icon={TrendingUp}
            title="Tiến bộ"
            value="Tích cực"
            trend={sessionData.improvementRate}
            description="So với lần tập trước"
          />
        </div>

        {/* Recommendations */}
        <ResultCard className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Nhận xét & Khuyến nghị
          </h3>
          <div className="space-y-4">
            {recommendations.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${item.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-100'
                    : 'bg-blue-50 border border-blue-100'
                  }`}
              >
                {item.message}
              </div>
            ))}
          </div>
        </ResultCard>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            to={`/compare/${exerciseId}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại bài tập
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/exercises"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Chọn bài tập khác
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
