// User-related TypeScript types matching server schema

export type UserRole = 'user' | 'admin';

export type Platform = 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';

export type AlertFrequency = 'immediate' | 'daily' | 'weekly';

export interface NotificationChannels {
  whatsapp: boolean;
  email: boolean;
  push: boolean;
}

export interface UserPreferences {
  platforms: Platform[];
  alertFrequency: AlertFrequency;
  contestTypes: string[];
  notificationChannels: NotificationChannels;
  notifyBefore: number; // Hours before contest
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UpdateUserDto {
  name?: string;
  phoneNumber?: string;
  role?: UserRole;
  preferences?: Partial<UserPreferences>;
}

export interface UpdatePreferencesDto {
  platforms?: Platform[];
  alertFrequency?: AlertFrequency;
  contestTypes?: string[];
  notificationChannels?: Partial<NotificationChannels>;
  notifyBefore?: number;
}

// Admin user management
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsersResponse {
  users: UserListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

// Platform configuration for UI display
export const PLATFORM_NAMES: Record<Platform, string> = {
  codeforces: 'Codeforces',
  leetcode: 'LeetCode',
  codechef: 'CodeChef',
  atcoder: 'AtCoder',
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  codeforces: '#1F8ACB',
  leetcode: '#FFA116',
  codechef: '#5B4638',
  atcoder: '#000000',
};

export const ALERT_FREQUENCY_LABELS: Record<AlertFrequency, string> = {
  immediate: 'Immediate',
  daily: 'Daily Digest',
  weekly: 'Weekly Digest',
};

// Notification timing presets (in hours)
export const NOTIFY_BEFORE_PRESETS = [1, 3, 6, 12, 24, 48, 72, 168];
