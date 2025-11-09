/**
 * Base notification payload that all notification channels use
 */
export interface NotificationPayload {
  userId: string;
  contestId: string;
  contestName: string;
  platform: string;
  startTime: Date;
  hoursUntilStart: number;
}

/**
 * Result of a notification send operation
 */
export interface NotificationResult {
  success: boolean;
  channel: string;
  messageId?: string;
  error?: string;
}

/**
 * Interface that all notification services must implement
 */
export interface INotificationService {
  /**
   * The channel name (email, whatsapp, push)
   */
  readonly channel: string;

  /**
   * Check if the service is enabled and configured
   */
  isEnabled(): boolean;

  /**
   * Send a notification to a recipient
   * @param recipient - Email, phone number, or user ID depending on channel
   * @param payload - Contest notification data
   */
  send(
    recipient: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult>;

  /**
   * Health check for the notification service
   */
  healthCheck(): Promise<boolean>;
}
