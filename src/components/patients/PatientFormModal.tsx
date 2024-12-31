import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Patient } from '../../types/patient';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    diagnosis: '',
    status: 'Đang điều trị'
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (patient) {
        await updateDoc(doc(db, 'patients', patient.id), formData);
      } else {
        await addDoc(collection(db, 'patients'), {
          ...formData,
          lastVisit: new Date().toISOString().split('T')[0]
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu thông tin bệnh nhân:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {patient ? 'Cập Nhật Bệnh Nhân' : 'Thêm Bệnh Nhân Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chẩn đoán</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Đang điều trị">Đang điều trị</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Tạm ngưng">Tạm ngưng</option>
              </select>
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
              {patient ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal; 