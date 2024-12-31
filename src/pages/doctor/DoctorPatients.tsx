import React, { useState, useEffect } from 'react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  diagnosis: string;
  status: 'Đang điều trị' | 'Hoàn thành' | 'Tạm ngưng';
  lastVisit: string;
  doctorId: string;
}

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!currentUser) {
          setError('No authenticated user');
          return;
        }

        const patientsRef = ref(db, 'patients');
        const patientsQuery = query(patientsRef, orderByChild('doctorId'), equalTo(currentUser.uid));
        const snapshot = await get(patientsQuery);
        
        const patientsList = Object.entries(snapshot.val() || {}).map(([id, data]) => ({
          id,
          ...(data as any)
        })) as Patient[];
        
        setPatients(patientsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {patients.length === 0 ? (
          <p>No patients found</p>
        ) : (
          patients.map(patient => (
            <div key={patient.id} className="bg-white p-4 mt-4 rounded shadow">
              {patient.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorPatients; 