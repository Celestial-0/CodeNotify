import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ContestsService } from './contests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SCHEDULER, NOTIFICATIONS } from '../common/constants';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ContestSchedulerService {
  private readonly logger = new Logger(ContestSchedulerService.name);
  private readonly syncEnabled: boolean;
  private readonly syncInterval: string;
  private readonly syncJobName = 'sync-all-contests-dynamic';

  constructor(
    private readonly contestsService: ContestsService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.syncEnabled = this.configService.get<boolean>(
      'CONTEST_SYNC_ENABLED',
      SCHEDULER.CONTEST_SYNC_ENABLED,
    );
    this.syncInterval = this.configService.get<string>(
      'CONTEST_SYNC_INTERVAL',
      SCHEDULER.CONTEST_SYNC_INTERVAL,
    );

    this.logger.log(
      `Contest Scheduler initialized - Enabled: ${this.syncEnabled}, Interval: ${this.syncInterval}`,
    );

    this.registerContestSyncJob();
  }

  private registerContestSyncJob(): void {
    if (!this.syncEnabled) {
      this.logger.log('Contest sync cron registration skipped (disabled)');
      return;
    }

    try {
      const existingJob = this.schedulerRegistry.doesExist(
        'cron',
        this.syncJobName,
      );
      if (existingJob) {
        this.schedulerRegistry.deleteCronJob(this.syncJobName);
      }

      const job = new CronJob(
        this.syncInterval,
        () => {
          void this.handleContestSync();
        },
        null,
        false,
        'UTC',
      );

      this.schedulerRegistry.addCronJob(this.syncJobName, job);
      job.start();
      this.logger.log(
        `Registered contest sync cron with expression: ${this.syncInterval}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to register contest sync cron (${this.syncInterval}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Scheduled job to sync contests from all platforms
   * Runs every 6 hours
   */
  async handleContestSync(): Promise<void> {
    if (!this.syncEnabled) {
      this.logger.debug('Contest sync is disabled via configuration');
      return;
    }

    this.logger.log('Starting scheduled contest sync');

    try {
      const results = await this.contestsService.syncAllPlatformsWithOptions({
        source: 'scheduler',
      });

      // Log results for each platform
      Object.entries(results).forEach(([platform, stats]) => {
        this.logger.log(
          `${platform}: ${stats.synced} new, ${stats.updated} updated, ${stats.failed} failed${stats.skipped ? ' (skipped)' : ''}`,
        );
      });

      // Calculate totals
      const totals = Object.values(results).reduce(
        (acc, stats) => ({
          synced: acc.synced + stats.synced,
          updated: acc.updated + stats.updated,
          failed: acc.failed + stats.failed,
          skipped: acc.skipped + (stats.skipped ? 1 : 0),
        }),
        { synced: 0, updated: 0, failed: 0, skipped: 0 },
      );

      this.logger.log(
        `Scheduled sync completed - Total: ${totals.synced} new, ${totals.updated} updated, ${totals.failed} failed, ${totals.skipped} skipped`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled contest sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Cleanup old finished contests
   * Runs daily at 2 AM UTC
   */
  @Cron('0 2 * * *', {
    name: 'cleanup-old-contests',
    timeZone: 'UTC',
  })
  async handleCleanup() {
    const cleanupEnabled = this.configService.get<boolean>(
      'CONTEST_CLEANUP_ENABLED',
      SCHEDULER.CONTEST_CLEANUP_ENABLED,
    );

    if (!cleanupEnabled) {
      this.logger.debug('Contest cleanup is disabled via configuration');
      return;
    }

    const daysToKeep = this.configService.get<number>(
      'CONTEST_CLEANUP_DAYS',
      SCHEDULER.CONTEST_CLEANUP_DAYS,
    );

    this.logger.log(
      `Starting cleanup of contests older than ${daysToKeep} days`,
    );

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deletedCount =
        await this.contestsService.cleanupOldFinishedContests(cutoffDate);

      this.logger.log(
        `Cleanup completed - Deleted ${deletedCount} old contests`,
      );
    } catch (error) {
      this.logger.error(
        `Contest cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Check for upcoming contests and prepare notifications
   * Runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'check-upcoming-contests',
    timeZone: 'UTC',
  })
  async handleUpcomingContests() {
    const notificationsEnabled = this.configService.get<boolean>(
      'NOTIFICATIONS_ENABLED',
      NOTIFICATIONS.ENABLED,
    );

    if (!notificationsEnabled) {
      this.logger.debug('Notifications are disabled via configuration');
      return;
    }

    try {
      const now = new Date();
      const notificationWindow = this.configService.get<number>(
        'NOTIFICATION_WINDOW_HOURS',
        NOTIFICATIONS.WINDOW_HOURS,
      );

      const windowEnd = new Date(
        now.getTime() + notificationWindow * 60 * 60 * 1000,
      );

      // Find contests starting within the notification window
      const upcomingContests =
        await this.contestsService.findUpcomingForNotificationWindow(
          now,
          windowEnd,
        );

      if (upcomingContests.length > 0) {
        this.logger.log(
          `Found ${upcomingContests.length} contests starting within ${notificationWindow} hours`,
        );

        // Send notifications using the notifications service
        await this.notificationsService.notifyUpcomingContests(
          upcomingContests,
        );

        await this.contestsService.markContestsAsNotified(
          upcomingContests.map((contest) => String(contest._id)),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to check upcoming contests: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send daily digest emails to users
   * Runs daily at 8 AM UTC
   */
  @Cron('0 8 * * *', {
    name: 'daily-digest',
    timeZone: 'UTC',
  })
  async handleDailyDigest() {
    const notificationsEnabled = this.configService.get<boolean>(
      'NOTIFICATIONS_ENABLED',
      NOTIFICATIONS.ENABLED,
    );

    if (!notificationsEnabled) {
      this.logger.debug('Notifications are disabled via configuration');
      return;
    }

    this.logger.log('Starting daily digest processing');

    try {
      const users = await this.notificationsService.getUsersForDigest('daily');
      this.logger.log(`Found ${users.length} users for daily digest`);

      let sentCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          const contests =
            await this.notificationsService.getUpcomingContestsForUser(
              user,
              24, // next 24 hours
            );

          if (contests.length > 0) {
            await this.notificationsService.sendDigestNotification(
              user,
              contests,
              'daily',
            );
            sentCount++;
          }
        } catch (error) {
          failedCount++;
          this.logger.error(
            `Failed to send daily digest to ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(
        `Daily digest completed - Sent: ${sentCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Daily digest processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send weekly digest emails to users
   * Runs every Monday at 8 AM UTC
   */
  @Cron('0 8 * * 1', {
    name: 'weekly-digest',
    timeZone: 'UTC',
  })
  async handleWeeklyDigest() {
    const notificationsEnabled = this.configService.get<boolean>(
      'NOTIFICATIONS_ENABLED',
      NOTIFICATIONS.ENABLED,
    );

    if (!notificationsEnabled) {
      this.logger.debug('Notifications are disabled via configuration');
      return;
    }

    this.logger.log('Starting weekly digest processing');

    try {
      const users = await this.notificationsService.getUsersForDigest('weekly');
      this.logger.log(`Found ${users.length} users for weekly digest`);

      let sentCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          const contests =
            await this.notificationsService.getUpcomingContestsForUser(
              user,
              168, // next 7 days
            );

          if (contests.length > 0) {
            await this.notificationsService.sendDigestNotification(
              user,
              contests,
              'weekly',
            );
            sentCount++;
          }
        } catch (error) {
          failedCount++;
          this.logger.error(
            `Failed to send weekly digest to ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(
        `Weekly digest completed - Sent: ${sentCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Weekly digest processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Manual trigger for contest sync (for testing or admin use)
   */
  async triggerManualSync(): Promise<void> {
    this.logger.log('Manual contest sync triggered');
    const results = await this.contestsService.syncAllPlatformsWithOptions({
      source: 'manual',
      forceSync: true,
    });

    Object.entries(results).forEach(([platform, stats]) => {
      this.logger.log(
        `Manual sync - ${platform}: ${stats.synced} new, ${stats.updated} updated, ${stats.failed} failed${stats.skipped ? ' (skipped)' : ''}`,
      );
    });
  }
}
