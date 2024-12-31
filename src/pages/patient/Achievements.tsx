import React from 'react';
import { usePatient } from '../../hooks/usePatients';
import {
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Medal
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  unlocked: boolean;
  date?: Date;
  category: 'exercise' | 'streak' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const Achievements = () => {
  const { loading, error } = usePatient();

  // Mock data - replace with real data from backend
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first exercise session',
      icon: <Trophy className="w-8 h-8" />,
      progress: 100,
      unlocked: true,
      date: new Date('2024-01-15'),
      category: 'milestone',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Consistency Champion',
      description: 'Complete exercises for 7 days in a row',
      icon: <Star className="w-8 h-8" />,
      progress: 100,
      unlocked: true,
      date: new Date('2024-01-22'),
      category: 'streak',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Progress Pioneer',
      description: 'Achieve 50% overall progress',
      icon: <TrendingUp className="w-8 h-8" />,
      progress: 75,
      unlocked: false,
      category: 'milestone',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Early Bird',
      description: 'Complete 5 morning exercise sessions',
      icon: <Calendar className="w-8 h-8" />,
      progress: 60,
      unlocked: false,
      category: 'exercise',
      rarity: 'common'
    },
    {
      id: '5',
      title: 'Perfect Form',
      description: 'Get "Perfect" rating in any exercise',
      icon: <Target className="w-8 h-8" />,
      progress: 100,
      unlocked: true,
      date: new Date('2024-01-25'),
      category: 'exercise',
      rarity: 'rare'
    },
    {
      id: '6',
      title: 'Marathon Milestone',
      description: 'Complete 100 exercise sessions',
      icon: <Medal className="w-8 h-8" />,
      progress: 45,
      unlocked: false,
      category: 'milestone',
      rarity: 'legendary'
    }
  ];

  const rarityColors = {
    common: 'bg-gray-100 text-gray-600',
    rare: 'bg-blue-100 text-blue-600',
    epic: 'bg-purple-100 text-purple-600',
    legendary: 'bg-yellow-100 text-yellow-600'
  };

  const categoryIcons = {
    exercise: <Zap className="w-5 h-5" />,
    streak: <Clock className="w-5 h-5" />,
    milestone: <Target className="w-5 h-5" />,
    special: <Star className="w-5 h-5" />
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
              <p className="text-gray-600">Track your rehabilitation milestones and accomplishments</p>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Unlocked</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {achievements.filter(a => a.unlocked).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Medal className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                achievement.unlocked ? '' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${rarityColors[achievement.rarity]}`}>
                  {achievement.icon}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rarityColors[achievement.rarity]
                }`}>
                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {categoryIcons[achievement.category]}
                    <span className="text-gray-600">
                      {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </span>
                  </div>
                  {achievement.date && (
                    <span className="text-gray-500">
                      {achievement.date.toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {achievement.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 mb-4 overflow-hidden rounded bg-gray-100">
                    <div
                      style={{ width: `${achievement.progress}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        achievement.unlocked ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements; 