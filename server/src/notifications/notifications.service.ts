import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Contest, ContestDocument } from '../contests/schemas/contest.schema';
import {
  Notification,
  NotificationDocument,
  NotificationStatus,
  NotificationChannel,
  NotificationType,
} from './schemas/notification.schema';
import { EmailNotificationService } from './services/email-notification.service';
import { WhatsAppNotificationService } from './services/whatsapp-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import {
  NotificationPayload,
  NotificationResult,
} from './interfaces/notification.interface';

// Type definitions for MongoDB queries and aggregations
interface NotificationQuery extends FilterQuery<NotificationDocument> {
  userId?: string;
  contestId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface AggregationResult {
  _id: string;
  count: number;
}

export interface TypeStatsMap {
  [key: string]: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly emailService: EmailNotificationService,
    private readonly whatsappService: WhatsAppNotificationService,
    private readonly pushService: PushNotificationService,
  ) {
    this.logger.log(
      'NotificationsService initialized with database-backed notification persistence',
    );
  }

  /**
   * Find users who should be notified about upcoming contests
   */
  async getUsersForNotification(
    contest: ContestDocument,
  ): Promise<UserDocument[]> {
    const now = new Date();
    const hoursUntilStart =
      (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Find users who:
    // 1. Have this platform in their preferences
    // 2. Want to be notified this many hours before (or more)
    // 3. Are active
    // 4. Have verified their email (premium feature)
    // 5. Have alertFrequency set to 'immediate' (digest users get batched emails)
    // FIXED: Changed $gte to $lte - users should be notified if their notifyBefore
    // window includes the current time (notifyBefore >= hoursUntilStart)
    const users = await this.userModel
      .find({
        isActive: true,
        isEmailVerified: true,
        'preferences.platforms': contest.platform,
        'preferences.notifyBefore': { $gte: Math.floor(hoursUntilStart) },
        'preferences.alertFrequency': 'immediate',
      })
      .exec();

    return users;
  }

  /**
   * Check if notification was already sent to prevent duplicates
   */
  private async wasNotificationSent(
    userId: string,
    contestId: string,
  ): Promise<boolean> {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const existingNotification = await this.notificationModel
      .findOne({
        userId,
        contestId,
        status: NotificationStatus.SENT,
        sentAt: { $gte: twelveHoursAgo },
      })
      .exec();

    return !!existingNotification;
  }

  /**
   * Create notification record in database
   */
  private async createNotificationRecord(
    user: UserDocument,
    contest: ContestDocument,
    channels: NotificationChannel[],
  ): Promise<NotificationDocument> {
    const now = new Date();
    const hoursUntilStart = Math.round(
      (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    const notification = new this.notificationModel({
      userId: String(user._id),
      contestId: String(contest._id),
      type: NotificationType.CONTEST_REMINDER,
      title: `Contest Starting Soon: ${contest.name}`,
      message: `${contest.name} on ${contest.platform} starts in ${hoursUntilStart} hours`,
      payload: {
        contestName: contest.name,
        platform: contest.platform,
        startTime: contest.startTime,
        hoursUntilStart,
        websiteUrl: contest.websiteUrl,
      },
      channels,
      deliveryStatus: channels.map((channel) => ({
        channel,
        status: NotificationStatus.PENDING,
        retryCount: 0,
      })),
      status: NotificationStatus.PENDING,
      scheduledAt: now,
    });

    return notification.save();
  }

  /**
   * Update notification with delivery results
   */
  private async updateNotificationStatus(
    notificationId: string,
    results: NotificationResult[],
  ): Promise<void> {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) return;

    const now = new Date();
    const deliveryStatus = results.map((result) => ({
      channel: result.channel as NotificationChannel,
      status: result.success
        ? NotificationStatus.SENT
        : NotificationStatus.FAILED,
      sentAt: result.success ? now : undefined,
      failedAt: result.success ? undefined : now,
      error: result.error,
      retryCount: 0,
    }));

    const allSuccess = results.every((r) => r.success);
    const anySuccess = results.some((r) => r.success);

    notification.deliveryStatus = deliveryStatus;
    notification.status = allSuccess
      ? NotificationStatus.SENT
      : anySuccess
        ? NotificationStatus.SENT
        : NotificationStatus.FAILED;
    notification.sentAt = anySuccess ? now : undefined;
    notification.failedAt = allSuccess ? undefined : now;

    if (!allSuccess) {
      notification.errorHistory = results
        .filter((r) => !r.success)
        .map((r) => ({
          timestamp: now,
          error: r.error || 'Unknown error',
          channel: r.channel as NotificationChannel,
        }));
    }

    await notification.save();
  }

  /**
   * Send notification to a user via their preferred channels
   */
  async sendNotification(
    user: UserDocument,
    contest: ContestDocument,
  ): Promise<void> {
    // Check if already notified
    if (await this.wasNotificationSent(user.id, String(contest._id))) {
      this.logger.debug(
        `Skipping duplicate notification for user ${user.email} and contest ${contest.name}`,
      );
      return;
    }

    const payload = this.formatNotificationPayload(user, contest);
    const channels = user.preferences.notificationChannels || {
      whatsapp: true,
      email: true,
      push: false,
    };

    // Determine which channels to use
    const enabledChannels: NotificationChannel[] = [];
    if (channels.email && user.email && this.emailService.isEnabled()) {
      enabledChannels.push(NotificationChannel.EMAIL);
    }
    if (
      channels.whatsapp &&
      user.phoneNumber &&
      this.whatsappService.isEnabled()
    ) {
      enabledChannels.push(NotificationChannel.WHATSAPP);
    }
    if (channels.push && this.pushService.isEnabled()) {
      enabledChannels.push(NotificationChannel.PUSH);
    }

    if (enabledChannels.length === 0) {
      this.logger.debug(
        `No enabled channels for user ${user.email}, skipping notification`,
      );
      return;
    }

    // Create notification record
    const notification = await this.createNotificationRecord(
      user,
      contest,
      enabledChannels,
    );

    const promises: Promise<NotificationResult>[] = [];

    // Send via email if enabled
    if (channels.email && user.email && this.emailService.isEnabled()) {
      promises.push(this.emailService.send(user.email, payload));
    }

    // Send via WhatsApp if enabled
    if (
      channels.whatsapp &&
      user.phoneNumber &&
      this.whatsappService.isEnabled()
    ) {
      promises.push(this.whatsappService.send(user.phoneNumber, payload));
    }

    // Send via push if enabled
    if (channels.push && this.pushService.isEnabled()) {
      promises.push(this.pushService.send(user.id, payload));
    }

    const results = await Promise.all(promises);

    // Update notification record with results
    await this.updateNotificationStatus(String(notification._id), results);

    const successfulChannels = results
      .filter((r) => r.success)
      .map((r) => r.channel);
    const failedChannels = results
      .filter((r) => !r.success)
      .map((r) => r.channel);

    if (successfulChannels.length > 0) {
      this.logger.log(
        `Sent notifications to user ${user.email} for contest ${contest.name} via: ${successfulChannels.join(', ')}`,
      );
    }

    if (failedChannels.length > 0) {
      this.logger.warn(
        `Failed to send notifications to user ${user.email} via: ${failedChannels.join(', ')}`,
      );
    }
  }

  /**
   * Notify all relevant users about upcoming contests
   */
  async notifyUpcomingContests(contests: ContestDocument[]): Promise<void> {
    if (!contests || contests.length === 0) {
      this.logger.log('No contests to notify about');
      return;
    }

    this.logger.log(`Processing ${contests.length} upcoming contests`);

    for (const contest of contests) {
      try {
        const users = await this.getUsersForNotification(contest);
        this.logger.log(
          `Found ${users.length} users to notify for contest: ${contest.name}`,
        );

        for (const user of users) {
          try {
            await this.sendNotification(user, contest);
          } catch (error) {
            this.logger.error(
              `Failed to send notification to user ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Failed to process contest ${contest.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Format notification payload
   */
  private formatNotificationPayload(
    user: UserDocument,
    contest: ContestDocument,
  ): NotificationPayload {
    const now = new Date();
    const hoursUntilStart = Math.round(
      (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    return {
      userId: user.id,
      contestId: String(contest._id),
      contestName: contest.name,
      platform: contest.platform,
      startTime: contest.startTime,
      hoursUntilStart,
    };
  }

  /**
   * Get upcoming contests for a specific user based on their preferences
   */
  async getUpcomingContestsForUser(
    user: UserDocument,
    hoursAhead: number,
  ): Promise<ContestDocument[]> {
    const now = new Date();
    const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    // Get contests matching user's platforms and within timeframe
    const contests = await this.contestModel
      .find({
        platform: { $in: user.preferences.platforms },
        startTime: { $gte: now, $lte: endTime },
        phase: 'BEFORE',
        isActive: true,
      })
      .sort({ startTime: 1 })
      .exec();

    // Filter contests based on user's notifyBefore preference
    const hoursUntilStart = (contest: ContestDocument) =>
      (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const notifyBefore = user.preferences.notifyBefore || 24; // Default to 24 hours

    return contests.filter(
      (contest) => notifyBefore >= hoursUntilStart(contest),
    );
  }

  /**
   * Get users who should receive digest notifications
   */
  async getUsersForDigest(
    frequency: 'daily' | 'weekly',
  ): Promise<UserDocument[]> {
    return this.userModel
      .find({
        isActive: true,
        isEmailVerified: true,
        'preferences.alertFrequency': frequency,
      })
      .exec();
  }

  /**
   * Send digest notification to a user
   */
  async sendDigestNotification(
    user: UserDocument,
    contests: ContestDocument[],
    frequency: 'daily' | 'weekly',
  ): Promise<void> {
    if (contests.length === 0) {
      this.logger.debug(
        `No contests for ${frequency} digest for user ${user.email}`,
      );
      return;
    }

    // Format contests for digest email
    const contestsData = contests.map((contest) => {
      const now = new Date();
      const hoursUntilStart = Math.round(
        (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
      );

      return {
        name: contest.name,
        platform: contest.platform,
        startTime: contest.startTime,
        hoursUntilStart,
        websiteUrl: contest.websiteUrl,
      };
    });

    // Send digest email
    try {
      const result = await this.emailService.sendDigestEmail(
        user.email,
        contestsData,
        frequency,
      );

      // Create notification record
      const notificationType =
        frequency === 'daily'
          ? NotificationType.DAILY_DIGEST
          : NotificationType.WEEKLY_DIGEST;

      const notification = new this.notificationModel({
        userId: String(user._id),
        type: notificationType,
        title: `${frequency === 'daily' ? 'Daily' : 'Weekly'} Contest Digest`,
        message: `${contests.length} upcoming contest${contests.length > 1 ? 's' : ''}`,
        payload: {
          contests: contestsData,
          frequency,
        },
        channels: [NotificationChannel.EMAIL],
        deliveryStatus: [
          {
            channel: NotificationChannel.EMAIL,
            status: result.success
              ? NotificationStatus.SENT
              : NotificationStatus.FAILED,
            sentAt: result.success ? new Date() : undefined,
            failedAt: result.success ? undefined : new Date(),
            error: result.error,
            retryCount: 0,
          },
        ],
        status: result.success
          ? NotificationStatus.SENT
          : NotificationStatus.FAILED,
        scheduledAt: new Date(),
        sentAt: result.success ? new Date() : undefined,
        failedAt: result.success ? undefined : new Date(),
      });

      await notification.save();

      if (result.success) {
        this.logger.log(
          `Sent ${frequency} digest to ${user.email} with ${contests.length} contests`,
        );
      } else {
        this.logger.error(
          `Failed to send ${frequency} digest to ${user.email}: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending ${frequency} digest to ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get notification service status
   */
  getServiceStatus() {
    return {
      email: {
        enabled: this.emailService.isEnabled(),
        channel: this.emailService.channel,
      },
      whatsapp: {
        enabled: this.whatsappService.isEnabled(),
        channel: this.whatsappService.channel,
      },
      push: {
        enabled: this.pushService.isEnabled(),
        channel: this.pushService.channel,
      },
    };
  }

  /**
   * Health check for all notification services
   */
  async healthCheckAll() {
    const [emailHealth, whatsappHealth, pushHealth] = await Promise.all([
      this.emailService.healthCheck(),
      this.whatsappService.healthCheck(),
      this.pushService.healthCheck(),
    ]);

    return {
      email: emailHealth,
      whatsapp: whatsappHealth,
      push: pushHealth,
      overall: emailHealth || whatsappHealth || pushHealth,
    };
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: NotificationStatus;
      type?: NotificationType;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { page = 1, limit = 20, status, type, startDate, endDate } = options;

    // Validate userId to prevent MongoDB CastError
    if (!userId || userId.trim() === '') {
      return {
        notifications: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const query: NotificationQuery = { userId };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('contestId', 'name platform startTime')
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string) {
    return this.notificationModel
      .findById(notificationId)
      .populate('userId', 'email name')
      .populate('contestId', 'name platform startTime')
      .exec();
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return notification.save();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query: NotificationQuery = {};

    // Only add userId to query if it's a valid non-empty string
    if (userId && userId.trim() !== '') {
      query.userId = userId;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    const results = await Promise.all([
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({
        ...query,
        status: NotificationStatus.SENT,
      }),
      this.notificationModel.countDocuments({
        ...query,
        status: NotificationStatus.FAILED,
      }),
      this.notificationModel.countDocuments({
        ...query,
        status: NotificationStatus.PENDING,
      }),
      this.notificationModel.aggregate<AggregationResult>([
        { $match: query },
        { $unwind: '$channels' },
        {
          $group: {
            _id: '$channels',
            count: { $sum: 1 },
          },
        },
      ]),
      this.notificationModel.aggregate<AggregationResult>([
        { $match: query },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const total = results[0];
    const sent = results[1];
    const failed = results[2];
    const pending = results[3];
    const byChannel = results[4];
    const byType = results[5];

    const channelStats = {
      email: 0,
      whatsapp: 0,
      push: 0,
    };

    byChannel.forEach((item) => {
      if (item._id in channelStats) {
        channelStats[item._id as keyof typeof channelStats] = item.count;
      }
    });

    const typeStats: TypeStatsMap = {};
    byType.forEach((item) => {
      typeStats[item._id] = item.count;
    });

    const successRate = total > 0 ? (sent / total) * 100 : 0;

    return {
      total,
      sent,
      failed,
      pending,
      byChannel: channelStats,
      byType: typeStats,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Delete old notifications (cleanup)
   */
  async cleanupOldNotifications(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $ne: NotificationStatus.PENDING },
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} notifications older than ${daysOld} days`,
    );

    return {
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotification(notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.canRetry) {
      throw new Error('Notification cannot be retried');
    }

    // Get user and contest data
    const user = await this.userModel.findById(notification.userId);
    const contest = notification.contestId
      ? await this.contestModel.findById(notification.contestId)
      : null;

    if (!user || !contest) {
      throw new Error('User or contest not found');
    }

    // Update retry count
    notification.retryCount += 1;
    notification.lastRetryAt = new Date();
    notification.status = NotificationStatus.RETRYING;
    await notification.save();

    // Resend notification
    await this.sendNotification(user, contest);

    return notification;
  }
}
