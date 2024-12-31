import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, X } from 'lucide-react';
import { ref, get, set, remove } from 'firebase/database';
import { db, auth } from '../../config/firebase';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      if (!auth.currentUser) return;
      
      const appointmentsRef = ref(db, 'appointments');
      const snapshot = await get(appointmentsRef);
      
      if (!snapshot.exists()) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const appointmentsList = Object.entries(snapshot.val())
        .filter(([_, data]: [string, any]) => data.doctorId === auth.currentUser?.uid)
        .map(([id, data]: [string, any]) => ({
          id,
          ...data
        })) as Appointment[];

      setAppointments(appointmentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      if (!auth.currentUser) return;
      
      const patientsRef = ref(db, 'patients');
      const snapshot = await get(patientsRef);
      
      if (snapshot.exists()) {
        const patientsList = Object.entries(snapshot.val())
          .filter(([_, data]: [string, any]) => data.doctorId === auth.currentUser?.uid)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }));
        setPatients(patientsList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      await set(ref(db, `appointments/${appointmentId}/status`), status);
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status } : apt
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: formData.get('patientId') as string,
        doctorId: auth.currentUser?.uid || '',
        patientName: patients.find(p => p.id === formData.get('patientId'))?.firstName + ' ' + 
                    patients.find(p => p.id === formData.get('patientId'))?.lastName,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        status: 'scheduled',
        notes: formData.get('notes') as string || ''
      };

      await set(ref(db, `appointments/${newAppointment.id}`), newAppointment);
      setAppointments([...appointments, newAppointment]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No appointments scheduled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointment(appointment.id, 'completed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">New Appointment</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    name="patientId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    name="time"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage; 