import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Resend } from 'resend';
import { EmailNotificationService } from './email-notification.service';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  Contest,
  ContestDocument,
} from '../../contests/schemas/contest.schema';
import {
  SendCustomEmailDto,
  SendBulkEmailDto,
  SendAnnouncementDto,
  SendContestReminderDto,
} from '../dto/email.dto';
import type {
  EmailResult,
  UserEmailResult,
  CustomEmailResponse,
  BulkEmailResponse,
  AnnouncementResponse,
  ContestReminderResponse,
} from '../types/email-result.types';

@Injectable()
export class AdminEmailService {
  private readonly logger = new Logger(AdminEmailService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    private readonly emailService: EmailNotificationService,
  ) {}

  /**
   * Send custom email to specific email addresses
   */
  async sendCustomEmail(dto: SendCustomEmailDto): Promise<CustomEmailResponse> {
    if (!this.emailService.isEnabled()) {
      throw new Error('Email service is not configured');
    }

    // Access private resend instance safely
    const resend = (this.emailService as unknown as { resend: Resend | null })
      .resend;
    const fromEmail = (this.emailService as unknown as { fromEmail: string })
      .fromEmail;

    if (!resend) {
      throw new Error('Resend client not initialized');
    }

    const recipients = Array.isArray(dto.to) ? dto.to : [dto.to];
    const results: EmailResult[] = [];

    for (const email of recipients) {
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: dto.subject,
          html: dto.html,
          text: dto.text,
          replyTo: dto.replyTo,
        });

        results.push({
          email,
          success: !result.error,
          messageId: result.data?.id,
          error: result.error?.message,
        });

        this.logger.log(`Custom email sent to ${email}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          email,
          success: false,
          error: errorMessage,
        });
        this.logger.error(
          `Failed to send custom email to ${email}: ${errorMessage}`,
        );
      }
    }

    return {
      total: recipients.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Send bulk email to specific users by their IDs
   */
  async sendBulkEmail(dto: SendBulkEmailDto): Promise<BulkEmailResponse> {
    const users = await this.userModel
      .find({
        _id: { $in: dto.userIds },
        isActive: true,
      })
      .select('email name')
      .exec();

    if (users.length === 0) {
      throw new NotFoundException('No active users found with provided IDs');
    }

    const resend = (this.emailService as unknown as { resend: Resend | null })
      .resend;
    const fromEmail = (this.emailService as unknown as { fromEmail: string })
      .fromEmail;

    if (!resend) {
      throw new Error('Resend client not initialized');
    }

    const results: UserEmailResult[] = [];

    for (const user of users) {
      if (!user.email) continue;

      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: dto.subject,
          html: dto.html,
          text: dto.text,
        });

        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: !result.error,
          messageId: result.data?.id,
          error: result.error?.message,
        });

        this.logger.log(`Bulk email sent to ${user.email}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: false,
          error: errorMessage,
        });
        this.logger.error(
          `Failed to send bulk email to ${user.email}: ${errorMessage}`,
        );
      }
    }

    return {
      total: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Send announcement email to all users (with optional filters)
   */
  async sendAnnouncement(
    dto: SendAnnouncementDto,
  ): Promise<AnnouncementResponse> {
    const query: FilterQuery<UserDocument> = {};

    if (dto.filters) {
      if (dto.filters.platforms && dto.filters.platforms.length > 0) {
        query['preferences.platforms'] = { $in: dto.filters.platforms };
      }
      if (dto.filters.isActive !== undefined) {
        query.isActive = dto.filters.isActive;
      }
    } else {
      query.isActive = true; // Default: only active users
    }

    const users = await this.userModel.find(query).select('email name').exec();

    if (users.length === 0) {
      throw new NotFoundException('No users found matching the filters');
    }

    const resend = (this.emailService as unknown as { resend: Resend | null })
      .resend;
    const fromEmail = (this.emailService as unknown as { fromEmail: string })
      .fromEmail;

    if (!resend) {
      throw new Error('Resend client not initialized');
    }

    const html = this.formatAnnouncementTemplate(dto);
    const results: UserEmailResult[] = [];

    for (const user of users) {
      if (!user.email) continue;

      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: dto.subject,
          html,
        });

        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: !result.error,
          messageId: result.data?.id,
          error: result.error?.message,
        });

        this.logger.log(`Announcement sent to ${user.email}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: false,
          error: errorMessage,
        });
        this.logger.error(
          `Failed to send announcement to ${user.email}: ${errorMessage}`,
        );
      }
    }

    return {
      total: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      filters: dto.filters,
      results,
    };
  }

  /**
   * Send contest reminder to specific users
   */
  async sendContestReminder(
    dto: SendContestReminderDto,
  ): Promise<ContestReminderResponse> {
    const contest = await this.contestModel.findById(dto.contestId).exec();
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${dto.contestId} not found`);
    }

    const users = await this.userModel
      .find({
        _id: { $in: dto.userIds },
        isActive: true,
      })
      .select('email name')
      .exec();

    if (users.length === 0) {
      throw new NotFoundException('No active users found with provided IDs');
    }

    const results: UserEmailResult[] = [];
    const now = new Date();
    const hoursUntilStart = Math.round(
      (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    for (const user of users) {
      if (!user.email) continue;

      try {
        const payload = {
          userId: String(user.id),
          contestId: String(contest._id),
          contestName: contest.name,
          platform: contest.platform,
          startTime: contest.startTime,
          hoursUntilStart,
        };

        const result = await this.emailService.send(user.email, payload);

        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });

        this.logger.log(`Contest reminder sent to ${user.email}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          userId: String(user.id),
          email: user.email,
          username: user.name,
          success: false,
          error: errorMessage,
        });
        this.logger.error(
          `Failed to send contest reminder to ${user.email}: ${errorMessage}`,
        );
      }
    }

    return {
      contest: {
        id: String(contest._id),
        name: contest.name,
        platform: contest.platform,
        startTime: contest.startTime,
      },
      total: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Format announcement email template
   */
  private formatAnnouncementTemplate(dto: SendAnnouncementDto): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${dto.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📢 ${dto.title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${dto.message}
              </div>
              
              ${
                dto.actionUrl && dto.actionText
                  ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${dto.actionUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">${dto.actionText}</a>
              </div>
              `
                  : ''
              }
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                CodeNotify - Your Competitive Programming Companion
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                <a href="https://codenotify.com/preferences" style="color: #6366f1; text-decoration: none;">Manage Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
