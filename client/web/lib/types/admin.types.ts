/**
 * Admin-specific types for CodeNotify
 */

// ==================== User Management ====================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  preferences: {
    platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
    alertFrequency: 'immediate' | 'daily' | 'weekly';
    contestTypes: string[];
    notificationChannels?: {
      whatsapp: boolean;
      email: boolean;
      push: boolean;
    };
    notifyBefore?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateUserRoleDto {
  role: 'user' | 'admin';
}

// ==================== Contest Sync ====================

export interface SyncResult {
  synced: number;
  updated: number;
  failed: number;
}

export interface PlatformSyncResult extends SyncResult {
  message: string;
  platform: string;
}

export interface AllPlatformsSyncResult {
  message: string;
  results: Record<string, SyncResult>;
}

export interface SyncRequestDto {
  forceSync?: boolean;
}

// ==================== Admin Email ====================

export interface SendCustomEmailDto {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendBulkEmailDto {
  userIds: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendAnnouncementDto {
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  filters?: {
    platforms?: string[];
    isActive?: boolean;
  };
}

export interface SendContestReminderDto {
  contestId: string;
  userIds: string[];
  customMessage?: string;
}

export interface EmailSendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{
    userId?: string;
    email?: string;
    error: string;
  }>;
}

// ==================== Notification Testing ====================

export interface TestNotificationDto {
  email?: string;
  phoneNumber?: string;
  userId?: string;
}

export interface TestNotificationResult {
  success: boolean;
  message: string;
  error?: string;
  deliveryId?: string;
  timestamp?: string;
}

// ==================== Service Status ====================

export interface ServiceStatus {
  email: {
    available: boolean;
    configured: boolean;
    provider?: string;
  };
  whatsapp: {
    available: boolean;
    configured: boolean;
    provider?: string;
  };
  push: {
    available: boolean;
    configured: boolean;
    provider?: string;
  };
}

export interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    email: {
      status: 'up' | 'down';
      responseTime?: number;
      lastChecked: string;
    };
    whatsapp: {
      status: 'up' | 'down';
      responseTime?: number;
      lastChecked: string;
    };
    push: {
      status: 'up' | 'down';
      responseTime?: number;
      lastChecked: string;
    };
  };
}

// ==================== Analytics ====================

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  totalContests: number;
  upcomingContests: number;
  runningContests: number;
  finishedContests: number;
  notificationsSentToday: number;
  notificationsSentThisWeek: number;
  notificationSuccessRate: number;
  platformDistribution: Record<string, number>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
}
