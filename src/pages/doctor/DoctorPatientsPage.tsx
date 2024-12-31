import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  FileText,
  Filter
} from 'lucide-react';
import { ref, remove, get, set } from 'firebase/database';
import { db } from '../../config/firebase';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

// const navigate = useNavigate();

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  doctorId: string;
  status?: string;
  createdAt: string;
  disease?: string;
  averageScore: number;
}

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      if (!auth.currentUser) {
        console.log('No authenticated user');
        return;
      }
      
      const patientsRef = ref(db, 'patients');
      const snapshot = await get(patientsRef);
      
      console.log('Raw patients data:', snapshot.val());
      
      if (!snapshot.exists()) {
        console.log('No patients found');
        setPatients([]);
        setLoading(false);
        return;
      }

      const patientsList = Object.entries(snapshot.val())
        .filter(([_, data]: [string, any]) => {
          console.log('Checking patient:', data);
          console.log('Current doctor ID:', auth.currentUser?.uid);
          return data.doctorId === auth.currentUser?.uid;
        })
        .map(([id, data]: [string, any]) => ({
          id,
          ...(data as object)
        })) as Patient[];

      console.log('Filtered patients:', patientsList);
      setPatients(patientsList);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', error);
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
      try {
        await remove(ref(db, `patients/${patientId}`));
        setPatients(patients.filter(patient => patient.id !== patientId));
      } catch (error) {
        console.error('Lỗi khi xóa bệnh nhân:', error);
      }
    }
  };

  const handleEditPatient = async (updatedData: Partial<Patient>) => {
    if (!editingPatient) return;
    
    try {
      await set(ref(db, `patients/${editingPatient.id}`), {
        ...editingPatient,
        ...updatedData
      });
      
      setPatients(patients.map(p => 
        p.id === editingPatient.id ? { ...p, ...updatedData } : p
      ));
      setShowEditModal(false);
      setEditingPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    if (!patient || !patient.firstName) return false;
    
    const fullName = `${patient.firstName} ${patient.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  console.log('Current patients state:', patients);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
                <div className="flex space-x-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  {/* Filter Dropdown */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang điều trị</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="paused">Tạm dừng</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No patients found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disease
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
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
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {patient.firstName[0]}{patient.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {`${patient.firstName} ${patient.lastName}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.disease || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.averageScore || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {patient.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => {
                                setEditingPatient(patient);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {showEditModal && editingPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Patient</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditPatient({
                firstName: e.currentTarget.firstName.value,
                lastName: e.currentTarget.lastName.value,
                disease: e.currentTarget.disease.value,
                status: e.currentTarget.status.value,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    name="firstName"
                    defaultValue={editingPatient.firstName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={editingPatient.lastName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingPatient.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Disease</label>
                  <input
                    name="disease"
                    defaultValue={editingPatient.disease || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Average Score</label>
                  <input
                    type="text"
                    value={editingPatient.averageScore || 0}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    defaultValue={editingPatient.status || 'active'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsPage; 