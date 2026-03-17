/**
 * Strongly typed notification payload definitions
 * Replaces Record<string, any> with specific payload types
 */

import { NotificationType } from '../../notifications/schemas/notification.schema';

/**
 * Base payload fields shared across all notification types
 */
export interface BaseNotificationPayload {
  contestName?: string;
  platform?: string;
  startTime?: Date;
  hoursUntilStart?: number;
  websiteUrl?: string;
}

/**
 * Contest reminder notification payload
 */
export interface ContestReminderPayload extends BaseNotificationPayload {
  contestName: string;
  platform: string;
  startTime: Date;
  hoursUntilStart: number;
  websiteUrl?: string;
  contestUrl?: string;
}

/**
 * Daily/Weekly digest notification payload
 */
export interface DigestNotificationPayload {
  digestType: 'daily' | 'weekly';
  contestCount: number;
  contests: Array<{
    name: string;
    platform: string;
    startTime: Date;
    websiteUrl?: string;
  }>;
}

/**
 * System alert notification payload
 */
export interface SystemAlertPayload {
  alertType: 'maintenance' | 'announcement' | 'warning' | 'info';
  message: string;
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Union type for all notification payloads
 */
export type NotificationPayloadType =
  | ContestReminderPayload
  | DigestNotificationPayload
  | SystemAlertPayload
  | BaseNotificationPayload;

/**
 * Type guard to check if payload is a contest reminder
 */
export function isContestReminderPayload(
  payload: NotificationPayloadType | undefined,
): payload is ContestReminderPayload {
  return (
    payload !== undefined &&
    'contestName' in payload &&
    'platform' in payload &&
    'startTime' in payload &&
    'hoursUntilStart' in payload
  );
}

/**
 * Type guard to check if payload is a digest notification
 */
export function isDigestPayload(
  payload: NotificationPayloadType | undefined,
): payload is DigestNotificationPayload {
  return (
    payload !== undefined &&
    'digestType' in payload &&
    'contests' in payload &&
    Array.isArray(payload.contests)
  );
}

/**
 * Type guard to check if payload is a system alert
 */
export function isSystemAlertPayload(
  payload: NotificationPayloadType | undefined,
): payload is SystemAlertPayload {
  return (
    payload !== undefined && 'alertType' in payload && 'message' in payload
  );
}

/**
 * Get payload type from notification type
 */
export type PayloadForNotificationType<T extends NotificationType> = T extends
  | NotificationType.CONTEST_REMINDER
  | NotificationType.CONTEST_STARTING
  | NotificationType.CONTEST_ENDING
  ? ContestReminderPayload
  : T extends NotificationType.DAILY_DIGEST | NotificationType.WEEKLY_DIGEST
    ? DigestNotificationPayload
    : T extends NotificationType.SYSTEM_ALERT
      ? SystemAlertPayload
      : BaseNotificationPayload;
