import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Notification,
  NotificationStatus,
  NotificationChannel,
} from './schemas/notification.schema';
import type { NotificationDocument } from './schemas/notification.schema';
import { EmailNotificationService } from './services/email-notification.service';
import { TelegramNotificationService } from './services/telegram-notification.service';
import { DiscordNotificationService } from './services/discord-notification.service';
import { User } from '../users/schemas/user.schema';
import type { UserDocument } from '../users/schemas/user.schema';
import type { NotificationResult } from './interfaces/notification.interface';
import { isContestReminderPayload } from '../common/types';

@Injectable()
export class NotificationRetryService {
  private readonly logger = new Logger(NotificationRetryService.name);
  private readonly maxRetries: number;
  private readonly retryDelayMinutes: number;
  private readonly enabled: boolean;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailNotificationService,
    private readonly telegramService: TelegramNotificationService,
    private readonly discordService: DiscordNotificationService,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>(
      'NOTIFICATION_MAX_RETRIES',
      3,
    );
    this.retryDelayMinutes = this.configService.get<number>(
      'NOTIFICATION_RETRY_DELAY_MINUTES',
      5,
    );
    this.enabled =
      this.configService.get<string>('ENABLE_NOTIFICATION_RETRY', 'true') ===
      'true';
  }

  /**
   * Scheduled job to retry failed notifications every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const retryThreshold = new Date(
      Date.now() - this.retryDelayMinutes * 60 * 1000,
    );

    try {
      // Find notifications with failed channel deliveries that can be retried
      const failedNotifications = await this.notificationModel
        .find({
          isActive: true,
          'deliveryStatus.status': NotificationStatus.FAILED,
          'deliveryStatus.retryCount': { $lt: this.maxRetries },
          $or: [
            { 'deliveryStatus.lastRetryAt': { $lt: retryThreshold } },
            { 'deliveryStatus.lastRetryAt': { $exists: false } },
          ],
        })
        .limit(100)
        .exec();

      if (failedNotifications.length === 0) {
        return;
      }

      this.logger.log(
        `Processing ${failedNotifications.length} notifications for retry`,
      );

      for (const notification of failedNotifications) {
        await this.retryNotification(notification);
      }
    } catch (error) {
      this.logger.error('Failed to process retry queue:', error);
    }
  }

  /**
   * Retry a single notification's failed channels
   */
  private async retryNotification(
    notification: NotificationDocument,
  ): Promise<void> {
    const userId = (
      notification.userId as unknown as Types.ObjectId
    ).toString();
    const notificationId = (
      notification._id as unknown as Types.ObjectId
    ).toString();
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      this.logger.warn(
        `User ${userId} not found for notification ${notificationId}`,
      );
      return;
    }

    const failedChannels = notification.deliveryStatus.filter(
      (d) =>
        d.status === NotificationStatus.FAILED &&
        d.retryCount < this.maxRetries,
    );

    for (const channelStatus of failedChannels) {
      try {
        const result = await this.sendToChannel(
          channelStatus.channel,
          user,
          notification,
        );

        await this.updateChannelDeliveryStatus(
          notificationId,
          channelStatus.channel,
          result,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Retry failed for notification ${notificationId} channel ${channelStatus.channel}: ${errorMessage}`,
        );

        await this.updateChannelDeliveryStatus(
          notificationId,
          channelStatus.channel,
          {
            success: false,
            channel: channelStatus.channel,
            error: errorMessage,
          },
        );
      }
    }

    // Update overall notification status
    await this.updateOverallStatus(notificationId);
  }

  /**
   * Send notification to a specific channel
   */
  private async sendToChannel(
    channel: NotificationChannel,
    user: UserDocument,
    notification: NotificationDocument,
  ): Promise<NotificationResult> {
    const notificationPayload = notification.payload;
    const isContestReminder = isContestReminderPayload(notificationPayload);

    const payload: import('./interfaces/notification.interface').NotificationPayload = {
      userId: (notification.userId as unknown as Types.ObjectId).toString(),
      contestId: notification.contestId
        ? (notification.contestId as unknown as Types.ObjectId).toString()
        : '',
      contestName: isContestReminder
        ? notificationPayload.contestName
        : notification.title,
      platform: isContestReminder ? notificationPayload.platform : 'Unknown',
      startTime: isContestReminder ? notificationPayload.startTime : new Date(),
      hoursUntilStart: isContestReminder
        ? notificationPayload.hoursUntilStart
        : 0,
      contestUrl: isContestReminder ? notificationPayload.contestUrl : undefined,
    };

    switch (channel) {
      case NotificationChannel.EMAIL:
        return this.emailService.send(user.email, payload);

      case NotificationChannel.TELEGRAM: {
        const telegramChatId = user.telegramChatId;
        if (!telegramChatId) {
          return {
            success: false,
            channel: 'telegram',
            error: 'User has no linked Telegram account',
          };
        }
        return this.telegramService.send(String(telegramChatId), payload);
      }

      case NotificationChannel.DISCORD: {
        const discordId = user.discordId;
        if (!discordId) {
          return {
            success: false,
            channel: 'discord',
            error: 'User has no linked Discord account',
          };
        }
        return this.discordService.send(discordId, payload);
      }

      default:
        return {
          success: false,
          channel: channel,
          error: `Channel ${channel} not supported for retry`,
        };
    }
  }

  /**
   * Update delivery status for a specific channel
   */
  async updateChannelDeliveryStatus(
    notificationId: string,
    channel: NotificationChannel,
    result: NotificationResult,
  ): Promise<void> {
    const now = new Date();

    if (result.success) {
      await this.notificationModel
        .updateOne(
          { _id: notificationId, 'deliveryStatus.channel': channel },
          {
            $set: {
              'deliveryStatus.$.status': NotificationStatus.SENT,
              'deliveryStatus.$.sentAt': now,
              'deliveryStatus.$.error': undefined,
            },
          },
        )
        .exec();
    } else {
      await this.notificationModel
        .updateOne(
          { _id: notificationId, 'deliveryStatus.channel': channel },
          {
            $set: {
              'deliveryStatus.$.status': NotificationStatus.FAILED,
              'deliveryStatus.$.failedAt': now,
              'deliveryStatus.$.error': result.error,
              'deliveryStatus.$.lastRetryAt': now,
            },
            $inc: {
              'deliveryStatus.$.retryCount': 1,
            },
            $push: {
              errorHistory: {
                timestamp: now,
                error: result.error || 'Unknown error',
                channel,
              },
            },
          },
        )
        .exec();
    }
  }

  /**
   * Update overall notification status based on channel delivery statuses
   */
  private async updateOverallStatus(notificationId: string): Promise<void> {
    const notification = await this.notificationModel
      .findById(notificationId)
      .exec();

    if (!notification) return;

    const allSent = notification.deliveryStatus.every(
      (d) => d.status === NotificationStatus.SENT,
    );
    const allFailed = notification.deliveryStatus.every(
      (d) =>
        d.status === NotificationStatus.FAILED &&
        d.retryCount >= this.maxRetries,
    );
    const anyFailed = notification.deliveryStatus.some(
      (d) => d.status === NotificationStatus.FAILED,
    );

    let newStatus: NotificationStatus;

    if (allSent) {
      newStatus = NotificationStatus.SENT;
    } else if (allFailed) {
      newStatus = NotificationStatus.FAILED;
    } else if (anyFailed) {
      newStatus = NotificationStatus.RETRYING;
    } else {
      newStatus = NotificationStatus.PENDING;
    }

    await this.notificationModel
      .updateOne(
        { _id: notificationId },
        {
          $set: {
            status: newStatus,
            ...(allSent && { sentAt: new Date() }),
            ...(allFailed && { failedAt: new Date() }),
          },
        },
      )
      .exec();
  }

  /**
   * Get retry queue statistics
   */
  async getRetryQueueStats(): Promise<{
    pending: number;
    retrying: number;
    failed: number;
    lastProcessed?: Date;
  }> {
    const [pending, retrying, failed] = await Promise.all([
      this.notificationModel
        .countDocuments({
          isActive: true,
          'deliveryStatus.status': NotificationStatus.PENDING,
        })
        .exec(),
      this.notificationModel
        .countDocuments({
          isActive: true,
          status: NotificationStatus.RETRYING,
        })
        .exec(),
      this.notificationModel
        .countDocuments({
          isActive: true,
          status: NotificationStatus.FAILED,
          'deliveryStatus.retryCount': { $gte: this.maxRetries },
        })
        .exec(),
    ]);

    return { pending, retrying, failed };
  }
}
