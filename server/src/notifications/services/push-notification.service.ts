import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';

@Injectable()
export class PushNotificationService implements INotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly enabled: boolean;
  private readonly serverKey: string | undefined;

  readonly channel = 'push';

  constructor(private readonly configService: ConfigService) {
    this.serverKey = this.configService.get<string>('FIREBASE_SERVER_KEY');
    this.enabled = !!this.serverKey;

    if (this.enabled) {
      this.logger.log('Push notification service initialized');
    } else {
      this.logger.warn(
        'Push notification service disabled - FIREBASE_SERVER_KEY not configured',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async send(
    userId: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.enabled) {
      this.logger.warn(
        `[PUSH DISABLED] Would send to user ${userId}: Contest "${payload.contestName}" starts in ${payload.hoursUntilStart} hours`,
      );
      return {
        success: false,
        channel: this.channel,
        error: 'Push notification service not configured',
      };
    }

    this.logger.log(`[PUSH] Sending notification to user ${userId}`);

    try {
      // TODO: Implement Firebase Cloud Messaging (FCM) integration
      // Example with Firebase Admin SDK:
      // const message = {
      //   notification: {
      //     title: `Contest Alert: ${payload.platform}`,
      //     body: `${payload.contestName} starts in ${payload.hoursUntilStart} hours`,
      //   },
      //   data: {
      //     contestId: payload.contestId,
      //     platform: payload.platform,
      //     startTime: payload.startTime.toISOString(),
      //   },
      //   token: userDeviceToken, // Get from user's device registration
      // };
      //
      // const response = await admin.messaging().send(message);

      // STUB IMPLEMENTATION - Remove when implementing actual service
      this.logger.warn(
        `[PUSH STUB] Contest "${payload.contestName}" on ${payload.platform} starts in ${payload.hoursUntilStart} hours`,
      );

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        channel: this.channel,
        messageId: 'stub-push-message-id',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[PUSH FAILED] Failed to send to user ${userId}: ${errorMessage}`,
      );

      return {
        success: false,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      // TODO: Implement actual health check when Firebase is integrated
      // For now, just check if server key is configured
      await Promise.resolve(); // Satisfy async requirement
      return !!this.serverKey;
    } catch (error) {
      this.logger.error(
        `Push notification service health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
