import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';
import { EMAIL } from '../../common/common.constants';
import { formatContestAlertEmail } from '../templates/contest-alert.template';
import { formatOtpEmail } from '../../auth/otp/templates/otp-verification';
import { formatDigestEmail } from '../templates/digest-email.template';

@Injectable()
export class EmailNotificationService implements INotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly enabled: boolean;

  readonly channel = 'email';

  constructor() {
    const apiKey = EMAIL.RESEND_API_KEY;
    this.fromEmail = EMAIL.EMAIL_FROM;
    this.enabled = !!apiKey;

    if (this.enabled && apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email notification service initialized with Resend');
    } else {
      this.logger.warn(
        'Email notification service disabled - RESEND_API_KEY not configured',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async send(
    email: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.enabled || !this.resend) {
      this.logger.warn(
        `[EMAIL DISABLED] Would send to ${email}: Contest "${payload.contestName}" starts in ${payload.hoursUntilStart} hours`,
      );
      return {
        success: false,
        channel: this.channel,
        error: 'Email service not configured',
      };
    }

    this.logger.log(`[EMAIL] Sending notification to ${email}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `🚨 Contest Alert: ${payload.contestName}`,
        html: formatContestAlertEmail(payload),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      this.logger.log(
        `[EMAIL SUCCESS] Sent to ${email}, Message ID: ${data?.id}`,
      );

      return {
        success: true,
        channel: this.channel,
        messageId: data?.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[EMAIL FAILED] Failed to send to ${email}: ${errorMessage}`,
      );

      return {
        success: false,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      return false;
    }

    try {
      // Resend doesn't have a dedicated health check endpoint
      // We just verify the instance is configured
      await Promise.resolve(); // Satisfy async requirement
      return true;
    } catch (error) {
      this.logger.error(
        `Email service health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Send OTP email for email verification
   */
  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    if (!this.enabled || !this.resend) {
      throw new Error('Email service not configured');
    }

    this.logger.log(`[EMAIL] Sending OTP to ${email}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email - CodeNotify',
        html: formatOtpEmail(otpCode),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      this.logger.log(
        `[EMAIL SUCCESS] OTP sent to ${email}, Message ID: ${data?.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[EMAIL FAILED] Failed to send OTP to ${email}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Send digest email with multiple contests
   */
  async sendDigestEmail(
    email: string,
    contests: Array<{
      name: string;
      platform: string;
      startTime: Date;
      hoursUntilStart: number;
      websiteUrl?: string;
    }>,
    frequency: 'daily' | 'weekly',
  ): Promise<NotificationResult> {
    if (!this.enabled || !this.resend) {
      this.logger.warn(
        `[EMAIL DISABLED] Would send ${frequency} digest to ${email} with ${contests.length} contests`,
      );
      return {
        success: false,
        channel: this.channel,
        error: 'Email service not configured',
      };
    }

    this.logger.log(
      `[EMAIL] Sending ${frequency} digest to ${email} with ${contests.length} contests`,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `${frequency === 'daily' ? '📅 Daily' : '📆 Weekly'} Contest Digest - ${contests.length} Upcoming Contest${contests.length > 1 ? 's' : ''}`,
        html: formatDigestEmail(contests, frequency),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      this.logger.log(
        `[EMAIL SUCCESS] ${frequency} digest sent to ${email}, Message ID: ${data?.id}`,
      );

      return {
        success: true,
        channel: this.channel,
        messageId: data?.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[EMAIL FAILED] Failed to send ${frequency} digest to ${email}: ${errorMessage}`,
      );

      return {
        success: false,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }


}
