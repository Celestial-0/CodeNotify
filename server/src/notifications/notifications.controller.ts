import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, EmailVerifiedGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { NotificationsService } from './notifications.service';
import { EmailNotificationService } from './services/email-notification.service';
import { WhatsAppNotificationService } from './services/whatsapp-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { AdminEmailService } from './services/admin-email.service';
import type {
  SendCustomEmailDto,
  SendBulkEmailDto,
  SendAnnouncementDto,
  SendContestReminderDto,
} from './dto/email.dto';
import {
  SendCustomEmailSchema,
  SendBulkEmailSchema,
  SendAnnouncementSchema,
  SendContestReminderSchema,
} from './dto/email.dto';
import {
  NotificationQuerySchema,
  NotificationStatsSchema,
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailNotificationService,
    private readonly whatsappService: WhatsAppNotificationService,
    private readonly pushService: PushNotificationService,
    private readonly adminEmailService: AdminEmailService,
  ) {}

  /**
   * Test endpoint to send a test email notification (Admin only)
   * POST /notifications/test/email
   */
  @Post('test/email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() body: { email: string }) {
    const testPayload = {
      userId: 'test-user',
      contestId: 'test-contest',
      contestName: 'Test Contest - Codeforces Round #123',
      platform: 'codeforces',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      hoursUntilStart: 2,
    };

    const result = await this.emailService.send(body.email, testPayload);

    return {
      ...result,
      message: result.success
        ? `Test email sent to ${body.email}`
        : `Failed to send email: ${result.error}`,
      payload: testPayload,
    };
  }

  /**
   * Test endpoint to send a test WhatsApp notification (Admin only)
   * POST /notifications/test/whatsapp
   */
  @Post('test/whatsapp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async testWhatsApp(@Body() body: { phoneNumber: string }) {
    const testPayload = {
      userId: 'test-user',
      contestId: 'test-contest',
      contestName: 'Test Contest - LeetCode Weekly Contest 400',
      platform: 'leetcode',
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      hoursUntilStart: 3,
    };

    const result = await this.whatsappService.send(
      body.phoneNumber,
      testPayload,
    );

    return {
      ...result,
      message: result.success
        ? `Test WhatsApp sent to ${body.phoneNumber}`
        : `Failed to send WhatsApp: ${result.error}`,
      payload: testPayload,
    };
  }

  /**
   * Test endpoint to send a test push notification (Admin only)
   * POST /notifications/test/push
   */
  @Post('test/push')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async testPush(@Body() body: { userId: string }) {
    const testPayload = {
      userId: body.userId,
      contestId: 'test-contest',
      contestName: 'Test Contest - AtCoder Beginner Contest 350',
      platform: 'atcoder',
      startTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      hoursUntilStart: 1,
    };

    const result = await this.pushService.send(body.userId, testPayload);

    return {
      ...result,
      message: result.success
        ? `Test push notification sent to user ${body.userId}`
        : `Failed to send push: ${result.error}`,
      payload: testPayload,
    };
  }

  /**
   * Check all notification services status
   * GET /notifications/status
   */
  @Get('status')
  getStatus() {
    return this.notificationsService.getServiceStatus();
  }

  /**
   * Health check for all notification services
   * GET /notifications/health
   */
  @Get('health')
  async healthCheck() {
    return await this.notificationsService.healthCheckAll();
  }

  // ==================== EMAIL ENDPOINTS ====================

  /**
   * Send custom email to specific addresses (Admin only)
   * POST /notifications/emails/custom
   */
  @Post('emails/custom')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendCustomEmail(@Body() body: SendCustomEmailDto) {
    const validated = SendCustomEmailSchema.parse(body);
    return await this.adminEmailService.sendCustomEmail(validated);
  }

  /**
   * Send bulk email to specific users by IDs (Admin only)
   * POST /notifications/emails/bulk
   */
  @Post('emails/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendBulkEmail(@Body() body: SendBulkEmailDto) {
    const validated = SendBulkEmailSchema.parse(body);
    return await this.adminEmailService.sendBulkEmail(validated);
  }

  /**
   * Send announcement to all users or filtered users (Admin only)
   * POST /notifications/emails/announcement
   */
  @Post('emails/announcement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendAnnouncement(@Body() body: SendAnnouncementDto) {
    const validated = SendAnnouncementSchema.parse(body);
    return await this.adminEmailService.sendAnnouncement(validated);
  }

  /**
   * Send contest reminder to specific users (Admin only)
   * POST /notifications/emails/contest-reminder
   */
  @Post('emails/contest-reminder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendContestReminder(@Body() body: SendContestReminderDto) {
    const validated = SendContestReminderSchema.parse(body);
    return await this.adminEmailService.sendContestReminder(validated);
  }

  // ==================== NOTIFICATION HISTORY ENDPOINTS ====================

  /**
   * Get notification history for a user
   * GET /notifications/notifications?userId=xxx&status=SENT&page=1&limit=20
   */
  @Get('notifications')
  async getNotifications(@Query() query: Record<string, unknown>) {
    const validated = NotificationQuerySchema.parse(query);
    const { userId, status, type, startDate, endDate, page, limit } = validated;

    return await this.notificationsService.getNotificationHistory(
      userId || '',
      {
        page,
        limit,
        status,
        type,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    );
  }

  /**
   * Get notification statistics
   * GET /notifications/notifications/stats?userId=xxx&startDate=xxx&endDate=xxx
   * NOTE: This route MUST be defined BEFORE the :id route to avoid "stats" being captured as an ID
   */
  @Get('notifications/stats')
  async getNotificationStats(@Query() query: Record<string, unknown>) {
    const validated = NotificationStatsSchema.parse(query);
    const { userId, startDate, endDate } = validated;

    return await this.notificationsService.getNotificationStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Cleanup old notifications
   * DELETE /notifications/notifications/cleanup?daysOld=90
   * NOTE: This route MUST be defined BEFORE the :id route to avoid "cleanup" being captured as an ID
   */
  @Delete('notifications/cleanup')
  async cleanupNotifications(@Query('daysOld') daysOld?: string) {
    const days = daysOld ? parseInt(daysOld, 10) : 90;
    return await this.notificationsService.cleanupOldNotifications(days);
  }

  /**
   * Get notification by ID
   * GET /notifications/notifications/:id
   */
  @Get('notifications/:id')
  async getNotificationById(@Param('id') id: string) {
    const notification =
      await this.notificationsService.getNotificationById(id);
    if (!notification) {
      return { error: 'Notification not found' };
    }
    return notification;
  }

  /**
   * Mark notification as read
   * PATCH /notifications/notifications/:id/read
   */
  @Patch('notifications/:id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      const notification =
        await this.notificationsService.markNotificationAsRead(id);
      return {
        success: true,
        notification,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mark all notifications as read for a user
   * PATCH /notifications/notifications/user/:userId/read-all
   */
  @Patch('notifications/user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return await this.notificationsService.markAllNotificationsAsRead(userId);
  }

  /**
   * Retry failed notification
   * POST /notifications/notifications/:id/retry
   */
  @Post('notifications/:id/retry')
  async retryNotification(@Param('id') id: string) {
    try {
      const notification =
        await this.notificationsService.retryFailedNotification(id);
      return {
        success: true,
        notification,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
