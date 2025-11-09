import { z } from 'zod';
import {
  NotificationStatus,
  NotificationChannel,
  NotificationType,
} from '../schemas/notification.schema';

// Query DTO for fetching notifications
export const NotificationQuerySchema = z.object({
  userId: z.string().optional(),
  contestId: z.string().optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  sortBy: z.enum(['createdAt', 'sentAt', 'scheduledAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type NotificationQueryDto = z.infer<typeof NotificationQuerySchema>;

// Update notification DTO
export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
});

export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;

// Notification stats DTO
export const NotificationStatsSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type NotificationStatsDto = z.infer<typeof NotificationStatsSchema>;

// Response DTOs
export interface NotificationResponseDto {
  id: string;
  userId: string;
  contestId?: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  deliveryStatus: Array<{
    channel: NotificationChannel;
    status: NotificationStatus;
    sentAt?: Date;
    failedAt?: Date;
    error?: string;
    retryCount: number;
  }>;
  scheduledAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStatsResponseDto {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byChannel: {
    email: number;
    whatsapp: number;
    push: number;
  };
  byType: {
    [key in NotificationType]: number;
  };
  successRate: number;
  averageDeliveryTime?: number;
}

export interface PaginatedNotificationsResponseDto {
  notifications: NotificationResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
