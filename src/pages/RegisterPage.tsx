// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, Stethoscope } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../config/firebase';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsRef = ref(db, 'doctors');
      const snapshot = await get(doctorsRef);
      if (snapshot.exists()) {
        const doctorsList = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setDoctors(doctorsList);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData = {
        email,
        firstName,
        lastName,
        role,
        createdAt: new Date().toISOString()
      };
      
      if (role === 'patient') {
        await set(ref(db, `patients/${userCredential.user.uid}`), {
          ...userData,
          doctorId: selectedDoctorId,
          exercisesCompleted: 0,
          weeklyGoal: 10,
          totalMinutes: 0,
          averageScore: 0,
          currentStreak: 0,
          healthScore: 0,
          disease: '',
          progression: '',
          exercises: {},
          exerciseHistory: {}
        });
        
        // Initialize empty lists
        await set(ref(db, `patients/${userCredential.user.uid}/exercises`), {});
        await set(ref(db, `patients/${userCredential.user.uid}/exerciseHistory`), {});
      } else {
        await set(ref(db, `doctors/${userCredential.user.uid}`), userData);
      }

      navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start your journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
              role === 'patient'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className={`h-6 w-6 ${role === 'patient' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={role === 'patient' ? 'text-blue-500' : 'text-gray-500'}>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
              role === 'doctor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Stethoscope className={`h-6 w-6 ${role === 'doctor' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={role === 'doctor' ? 'text-blue-500' : 'text-gray-500'}>Doctor</span>
          </button>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {role === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor: any) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
