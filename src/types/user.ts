// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export type UserRole = 'admin' | 'trainer' | 'analyst' | 'viewer';

export type Permission = 
  | 'train_models'
  | 'manage_documents'
  | 'view_analytics'
  | 'manage_users'
  | 'system_config'
  | 'export_data'
  | 'delete_sessions'
  | 'access_api';

export interface UserPreferences {
  language: 'fa' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    trainingComplete: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'training' | 'documents' | 'analytics';
    chartsPerPage: number;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
  };
}

export interface UserStatistics {
  totalTrainingSessions: number;
  completedSessions: number;
  totalDocumentsProcessed: number;
  averageSessionDuration: number;
  bestModelAccuracy: number;
  totalTrainingTime: number; // minutes
  lastActivityDate: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
}