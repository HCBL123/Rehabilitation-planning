import React, { useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
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
import CircularProgress from '../components/ui/circular-progress';

const ResultCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
}

const MetricCard = ({ icon: Icon, title, value, description, trend }: MetricCardProps) => (
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
        <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : null}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
  </ResultCard>
);

const Results = () => {
  const { exerciseId } = useParams();
  const location = useLocation();
  const exerciseData = location.state?.exerciseData;

  const sessionData = {
    averageScore: exerciseData?.score || 85,
    duration: exerciseData?.duration || '15:00',
    totalRepetitions: exerciseData?.repetitions || 10,
    bestStreak: 8,
    peakPerformance: 92,
    consistencyScore: 88,
    improvementRate: 15,
    performanceOverTime: [],
    areas: {
      leftArm: { 
        score: exerciseData?.accuracy?.leftArm || 82, 
        message: 'Thực hiện tốt, giữ vững phong độ' 
      },
      rightArm: { 
        score: exerciseData?.accuracy?.rightArm || 88, 
        message: 'Rất tốt, tiếp tục duy trì' 
      }
    }
  };

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
    return tips;
  }, [sessionData]);

  const getTextEvaluation = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Rất tốt';
    if (score >= 70) return 'Tốt';
    if (score >= 60) return 'Khá';
    return 'Cần cải thiện';
  };

  const progressMetrics = [
    {
      label: 'So với lần trước',
      value: '+15%',
      icon: TrendingUp,
      description: 'Cải thiện đáng kể về độ chính xác'
    },
    {
      label: 'Độ ổn định',
      value: '88%',
      icon: Activity,
      description: 'Duy trì được độ chính xác trong suốt bài tập'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
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
        </div>

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
                      className={`h-full transition-all duration-500 ${
                        data.score >= 80 ? 'bg-green-500' : 
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

          <div className="space-y-4">
            <MetricCard
              icon={Clock}
              title="Thời gian tập"
              value={sessionData.duration}
            />
            <MetricCard
              icon={Activity}
              title="Số lần lặp lại"
              value={sessionData.totalRepetitions}
              trend={sessionData.improvementRate}
            />
            <MetricCard
              icon={Trophy}
              title="Điểm cao nhất"
              value={sessionData.peakPerformance}
            />
            <MetricCard
              icon={TrendingUp}
              title="Độ ổn định"
              value={`${sessionData.consistencyScore}%`}
            />
          </div>
        </div>

        <ResultCard className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Nhận xét</h3>
          <div className="space-y-4">
            {exerciseData?.feedback?.map((feedback: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-gray-600">{feedback}</p>
              </div>
            ))}
          </div>
        </ResultCard>

        <ResultCard className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tiến bộ</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {progressMetrics.map((metric, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <metric.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-green-500">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ResultCard>

        <ResultCard className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Đánh giá tổng quát</h3>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-blue-50">
              <Award className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {getTextEvaluation(sessionData.averageScore)}
              </p>
              <p className="text-gray-600">
                Bạn đã hoàn thành {sessionData.totalRepetitions} lần lặp lại với độ chính xác {sessionData.averageScore}%
              </p>
            </div>
          </div>
        </ResultCard>

        <div className="flex justify-center gap-4">
          <Link
            to={`/exercise/${exerciseId}`}
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