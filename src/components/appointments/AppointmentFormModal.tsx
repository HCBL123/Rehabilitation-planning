import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Patient } from '../../types/patient';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
  onSuccess: () => void;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    status: 'scheduled' as const,
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
    if (appointment) {
      setFormData(appointment);
    }
  }, [appointment]);

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (appointment) {
        await updateDoc(doc(db, 'appointments', appointment.id), formData);
      } else {
        await addDoc(collection(db, 'appointments'), formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {appointment ? 'Cập Nhật Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bệnh nhân</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.patientId}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    patientId: e.target.value,
                    patientName: patient?.name || ''
                  });
                }}
              >
                <option value="">Chọn bệnh nhân</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giờ</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {appointment ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal; 