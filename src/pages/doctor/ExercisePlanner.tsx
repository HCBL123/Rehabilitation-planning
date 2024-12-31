import React, { useState, useEffect } from 'react';
import { ref, push, get, set } from 'firebase/database';
import { db, auth } from '../../config/firebase';
import {
  Plus,
  Save,
  Users,
  Clock,
  Target,
  Dumbbell,
  AlertCircle
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ExercisePlan {
  name: string;
  description: string;
  type: 'Mobility' | 'Strength' | 'Balance';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  sets: number;
  reps: number;
  patientId: string;
  doctorId: string;
  progress: number;
  status: 'assigned' | 'in-progress' | 'completed';
}

const ExercisePlanner = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercisePlan, setExercisePlan] = useState<Partial<ExercisePlan>>({
    type: 'Mobility',
    difficulty: 'Easy',
    progress: 0,
    status: 'assigned'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      if (!auth.currentUser) return;

      const patientsRef = ref(db, 'patients');
      const snapshot = await get(patientsRef);
      
      if (snapshot.exists()) {
        const patientsData = snapshot.val();
        const patientsList = Object.entries(patientsData)
          .filter(([_, data]: [string, any]) => data.doctorId === auth.currentUser?.uid)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }));
        setPatients(patientsList);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch patients');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedPatient) return;

    try {
      const exercisesRef = ref(db, `exercises/${selectedPatient}`);
      await push(exercisesRef, {
        ...exercisePlan,
        doctorId: auth.currentUser.uid,
        patientId: selectedPatient,
        createdAt: new Date().toISOString()
      });

      // Reset form
      setExercisePlan({
        type: 'Mobility',
        difficulty: 'Easy',
        progress: 0,
        status: 'assigned'
      });
      setSelectedPatient('');
      
      alert('Exercise plan created successfully!');
    } catch (err) {
      setError('Failed to create exercise plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Exercise Plan</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Name
              </label>
              <input
                type="text"
                value={exercisePlan.name || ''}
                onChange={(e) => setExercisePlan({ ...exercisePlan, name: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={exercisePlan.description || ''}
                onChange={(e) => setExercisePlan({ ...exercisePlan, description: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={exercisePlan.type}
                  onChange={(e) => setExercisePlan({ ...exercisePlan, type: e.target.value as any })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Mobility">Mobility</option>
                  <option value="Strength">Strength</option>
                  <option value="Balance">Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={exercisePlan.difficulty}
                  onChange={(e) => setExercisePlan({ ...exercisePlan, difficulty: e.target.value as any })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={exercisePlan.duration || ''}
                  onChange={(e) => setExercisePlan({ ...exercisePlan, duration: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sets
                </label>
                <input
                  type="number"
                  value={exercisePlan.sets || ''}
                  onChange={(e) => setExercisePlan({ ...exercisePlan, sets: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reps
                </label>
                <input
                  type="number"
                  value={exercisePlan.reps || ''}
                  onChange={(e) => setExercisePlan({ ...exercisePlan, reps: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Create Exercise Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExercisePlanner; 