// src/App.tsx - Updated routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthDebug from './components/AuthDebug';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorMessagesPage from './pages/doctor/DoctorMessagesPage';
import ExercisePlanner from './pages/doctor/ExercisePlanner';
import ModelAnalysisPage from './pages/doctor/ModelAnalysisPage';
import Results from './pages/Results';

// Lazy load patient pages
const PatientProfile = lazy(() => import('./pages/patient/PatientProfile'));
const PatientExercises = lazy(() => import('./pages/patient/PatientExercises'));
const PatientSchedule = lazy(() => import('./pages/patient/PatientSchedule'));
const PatientSettings = lazy(() => import('./pages/patient/PatientSettings'));
const PatientProgress = lazy(() => import('./pages/patient/Progress'));
const PatientHealth = lazy(() => import('./pages/patient/Health'));
const PatientMessages = lazy(() => import('./pages/patient/Messages'));
const PatientAchievements = lazy(() => import('./pages/patient/Achievements'));
const PatientReports = lazy(() => import('./pages/patient/Reports'));

// Lazy load doctor pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorTreatments = lazy(() => import('./pages/doctor/DoctorTreatments'));
const DoctorSettings = lazy(() => import('./pages/doctor/DoctorSettings'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const PatientDetail = lazy(() => import('./pages/doctor/PatientDetail'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthDebug />
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/exercises" element={<PatientExercises />} />
              <Route path="/patient/schedule" element={<PatientSchedule />} />
              <Route path="/patient/settings" element={<PatientSettings />} />
              <Route path="/patient/progress" element={<PatientProgress />} />
              <Route path="/patient/health" element={<PatientHealth />} />
              <Route path="/patient/messages" element={<PatientMessages />} />
              <Route path="/patient/achievements" element={<PatientAchievements />} />
              <Route path="/patient/reports" element={<PatientReports />} />
              {/* <Route path="/patient/results" element={<PatientResults />} /> */}
              <Route path="/results" element={<Results />} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              <Route path="/doctor/treatments" element={<DoctorTreatments />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />
              <Route path="/doctor/patient/:patientId" element={<PatientDetail />} />
              <Route path="/exercise/:id" element={<ExercisePage />} />
              <Route path="/doctor/messages" element={<DoctorMessagesPage />} />
              <Route path="/doctor/exercise-planner" element={<ExercisePlanner />} />
              <Route path="/doctor/analysis" element={<ModelAnalysisPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
