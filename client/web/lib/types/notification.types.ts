// Notification-related TypeScript types matching server schema

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

export enum NotificationType {
  CONTEST_REMINDER = 'CONTEST_REMINDER',
  CONTEST_STARTING = 'CONTEST_STARTING',
  CONTEST_ENDING = 'CONTEST_ENDING',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export interface ChannelDeliveryStatus {
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  failedAt?: Date;
  error?: string;
  retryCount: number;
  lastRetryAt?: Date;
}

export interface NotificationPayload {
  userId?: string;
  contestId?: string;
  contestName?: string;
  platform?: string;
  startTime?: Date;
  hoursUntilStart?: number;
  [key: string]: string | number | Date | boolean | undefined;
}

export interface Notification {
  id: string;
  _id?: string; // MongoDB ObjectId (id is the virtual)
  userId: string;
  contestId?: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: NotificationPayload;
  channels: NotificationChannel[];
  deliveryStatus: ChannelDeliveryStatus[];
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  nextRetryAt?: Date;
  error?: string;
  errorHistory?: Array<{
    timestamp: Date;
    error: string;
    channel?: NotificationChannel;
  }>;
  isRead: boolean;
  readAt?: Date;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  isDelivered?: boolean;
  isFailed?: boolean;
  isPending?: boolean;
  canRetry?: boolean;
  successfulChannels?: NotificationChannel[];
  failedChannels?: NotificationChannel[];
}

export interface NotificationQueryDto {
  userId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  byChannel: {
    email: number;
    whatsapp: number;
    push: number;
  };
  byType: Record<string, number>;
}

export interface NotificationStatsQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// UI-specific types
export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: 'Pending',
  [NotificationStatus.SENT]: 'Sent',
  [NotificationStatus.FAILED]: 'Failed',
  [NotificationStatus.RETRYING]: 'Retrying',
};

export const NOTIFICATION_STATUS_COLORS: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: 'bg-yellow-500',
  [NotificationStatus.SENT]: 'bg-green-500',
  [NotificationStatus.FAILED]: 'bg-red-500',
  [NotificationStatus.RETRYING]: 'bg-blue-500',
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: 'Email',
  [NotificationChannel.WHATSAPP]: 'WhatsApp',
  [NotificationChannel.PUSH]: 'Push',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.CONTEST_REMINDER]: 'Contest Reminder',
  [NotificationType.CONTEST_STARTING]: 'Contest Starting',
  [NotificationType.CONTEST_ENDING]: 'Contest Ending',
  [NotificationType.SYSTEM_ALERT]: 'System Alert',
};
