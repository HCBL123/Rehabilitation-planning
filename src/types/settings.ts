// src/types/settings.ts
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  exerciseReminders: boolean;
  appointmentReminders: boolean;
  progressUpdates: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  shareProgress: boolean;
  allowDataAnalysis: boolean;
}

export interface PatientSettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export type SettingsSection = 'notifications' | 'privacy';
