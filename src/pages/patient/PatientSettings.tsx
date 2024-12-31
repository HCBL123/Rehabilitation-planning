import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Settings,
  Moon,
  Sun,
  Globe,
  Phone,
  Mail,
  Shield,
  Save,
  AlertCircle,
  Check,
} from 'lucide-react';
import { usePatient } from '../../hooks/usePatients';
import { updatePatientData } from '../../services/patientService';
import {
  PatientSettingsFormData,
  SettingsSection,
  NotificationSettings,
  PrivacySettings
} from '../../types/settings';

const PatientSettings = () => {
  const { loading, error, patientData } = usePatient();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Form states with proper typing
  const [formData, setFormData] = useState<PatientSettingsFormData>({
    firstName: patientData?.firstName || '',
    lastName: patientData?.lastName || '',
    email: patientData?.email || '',
    phone: patientData?.phone || '',
    language: 'English',
    timezone: 'UTC-8',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      exerciseReminders: true,
      appointmentReminders: true,
      progressUpdates: true
    },
    privacy: {
      showProfile: true,
      shareProgress: false,
      allowDataAnalysis: true
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (section: SettingsSection, setting: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting as keyof typeof prev[typeof section]]
      }
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePatientData(formData);
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {(Object.keys(formData.notifications) as Array<keyof NotificationSettings>).map((key) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {key.split(/(?=[A-Z])/).join(' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Receive notifications for {key.toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('notifications', key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.notifications[key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {(Object.keys(formData.privacy) as Array<keyof PrivacySettings>).map((key) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {key.split(/(?=[A-Z])/).join(' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Control your privacy settings
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('privacy', key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.privacy[key] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.privacy[key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleSelectChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleSelectChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              {successMessage && (
                <div className="mr-4 flex items-center text-green-600">
                  <Check className="w-5 h-5 mr-2" />
                  {successMessage}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;
