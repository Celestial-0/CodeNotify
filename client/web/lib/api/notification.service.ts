/**
 * Notification Service
 * API calls for notification-related operations
 */

import { httpClient } from './http.client';
import type {
  Notification,
  NotificationQueryDto,
  PaginatedNotificationsResponse,
  NotificationStats,
  NotificationStatsQuery,
} from '@/lib/types/notification.types';

export class NotificationService {
  /**
   * Get paginated list of notifications
   */
  static async getNotifications(query?: NotificationQueryDto): Promise<PaginatedNotificationsResponse> {
    const response = await httpClient.api.get<PaginatedNotificationsResponse>(
      '/notifications/notifications',
      { params: query }
    );
    return response.data;
  }

  /**
   * Get a single notification by ID
   */
  static async getNotificationById(id: string): Promise<Notification> {
    const response = await httpClient.api.get<Notification>(
      `/notifications/notifications/${id}`
    );
    return response.data;
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationAsRead(id: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await httpClient.api.patch<{ success: boolean; notification: Notification }>(
      `/notifications/notifications/${id}/read`
    );
    return response.data;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; modifiedCount: number }> {
    const response = await httpClient.api.patch<{ success: boolean; modifiedCount: number }>(
      `/notifications/notifications/user/${userId}/read-all`
    );
    return response.data;
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(query?: NotificationStatsQuery): Promise<NotificationStats> {
    const response = await httpClient.api.get<NotificationStats>(
      '/notifications/notifications/stats',
      { params: query }
    );
    return response.data;
  }

  /**
   * Retry a failed notification
   */
  static async retryNotification(id: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await httpClient.api.post<{ success: boolean; notification: Notification }>(
      `/notifications/notifications/${id}/retry`
    );
    return response.data;
  }

  /**
   * Get notification service status
   */
  static async getServiceStatus(): Promise<{
    email: { available: boolean; configured: boolean; provider?: string };
    whatsapp: { available: boolean; configured: boolean; provider?: string };
    push: { available: boolean; configured: boolean; provider?: string };
  }> {
    const response = await httpClient.api.get('/notifications/status');
    return response.data;
  }

  /**
   * Health check for notification services
   */
  static async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      email: { status: 'up' | 'down'; responseTime?: number; lastChecked: string };
      whatsapp: { status: 'up' | 'down'; responseTime?: number; lastChecked: string };
      push: { status: 'up' | 'down'; responseTime?: number; lastChecked: string };
    };
  }> {
    const response = await httpClient.api.get('/notifications/health');
    return response.data;
  }

  // ==================== Admin Email Methods ====================

  /**
   * Send custom email (Admin only)
   */
  static async sendCustomEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; sent: number; failed: number; errors?: Array<{ userId?: string; email?: string; error: string }> }> {
    const response = await httpClient.api.post('/notifications/emails/custom', data);
    return response.data;
  }

  /**
   * Send bulk email to users (Admin only)
   */
  static async sendBulkEmail(data: {
    userIds: string[];
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; sent: number; failed: number; errors?: Array<{ userId?: string; email?: string; error: string }> }> {
    const response = await httpClient.api.post('/notifications/emails/bulk', data);
    return response.data;
  }

  /**
   * Send announcement to all users (Admin only)
   */
  static async sendAnnouncement(data: {
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    filters?: {
      platforms?: string[];
      isActive?: boolean;
    };
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    const response = await httpClient.api.post('/notifications/emails/announcement', data);
    return response.data;
  }

  /**
   * Send contest reminder (Admin only)
   */
  static async sendContestReminder(data: {
    contestId: string;
    userIds: string[];
    customMessage?: string;
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    const response = await httpClient.api.post('/notifications/emails/contest-reminder', data);
    return response.data;
  }
}
