import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Clock,
  Calendar,
  Target,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ArrowRight,
  Dumbbell,
  Activity
} from 'lucide-react';
import { usePatient } from '../../hooks/usePatients';
import { format } from 'date-fns';
import { Exercise, ExerciseHistory } from '../../types/patient';

const PatientExercises = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { loading, error, patientData } = usePatient();
  const [upcomingExercises, setUpcomingExercises] = useState<Exercise[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const exercisesRef = ref(db, `exercises/${auth.currentUser.uid}`);
    const unsubscribe = onValue(exercisesRef, (snapshot) => {
      if (snapshot.exists()) {
        const exercises = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setUpcomingExercises(exercises);
      } else {
        setUpcomingExercises([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const filterTypes = [
    { id: 'all', label: 'All' },
    { id: 'Mobility', label: 'Mobility' },
    { id: 'Strength', label: 'Strength' },
    { id: 'Balance', label: 'Balance' }
  ];

  const filteredExercises = upcomingExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || exercise.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-900">{error}</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-500';
  };

  // Add this exercise object to your existing exercises
  const exerciseExample = {
    id: "shoulder-flexion",
    name: "Shoulder Flexion",
    description: "Nâng cánh tay lên ngang vai",
    type: "Mobility",
    difficulty: "Easy",
    duration: "5 phút",
    sets: 3,
    reps: 10,
    status: "assigned",
    progress: 0,
    thumbnailUrl: "./shoulder-exercise.jpg", // Placeholder image
    assignedDate: new Date().toISOString(),
    lastCompleted: null
  };

  // In your component, add it to exercises array
  const exercises = [exerciseExample];

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Exercise Hub</h1>
          <p className="text-gray-600">Track your exercises and monitor progress</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Play className="w-5 h-5" />
          Start New Exercise
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search exercises..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg">All</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Mobility</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Strength</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Balance</button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={exercise.thumbnailUrl}
              alt={exercise.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
              <p className="text-gray-600 mb-4">{exercise.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exercise.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {exercise.difficulty}
                </div>
              </div>
              <button 
                onClick={() => navigate(`/exercise/${exercise.id}`)} 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Exercise
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientExercises;
