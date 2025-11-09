import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';
import { EMAIL } from '../../common/common.constants';

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
        html: this.formatEmailTemplate(payload),
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
   * Format email template with HTML
   */
  private formatEmailTemplate(payload: NotificationPayload): string {
    const platformColors: Record<string, string> = {
      codeforces: '#1F8ACB',
      leetcode: '#FFA116',
      codechef: '#5B4638',
      atcoder: '#000000',
    };

    const platformColor =
      platformColors[payload.platform.toLowerCase()] || '#6366f1';

    const startTimeFormatted = payload.startTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>Contest Alert</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" style="width:100%;padding:32px 0;">
<tr>
<td align="center">

  <table role="presentation" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;">
    
    <!-- HEADER -->
    <tr>
      <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#111827;">Contest Alert</h1>
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#0f172a;">
          ${payload.contestName}
        </h2>

        <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
          Stay prepared. Here are the contest details:
        </p>

        <div style="padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
          <p style="margin:0 0 12px;font-size:15px;color:#334155;">
            <strong>Platform:</strong>
            <span style="color:${platformColor};font-weight:600;text-transform:uppercase;">
              ${payload.platform}
            </span>
          </p>

          <p style="margin:0 0 12px;font-size:15px;color:#334155;">
            <strong>Starts In:</strong>
            <span style="color:#b91c1c;font-weight:600;">${payload.hoursUntilStart} hours</span>
          </p>

          <p style="margin:0;font-size:15px;color:#334155;">
            <strong>Start Time:</strong> ${startTimeFormatted}
          </p>
        </div>

        <div style="text-align:center;margin-top:28px;">
          <a href="https://codenotify.com/contests/${payload.contestId}"
            style="display:inline-block;background:${platformColor};color:#fff;text-decoration:none;
                   padding:12px 28px;border-radius:6px;font-weight:600;font-size:15px;">
            View Contest Details
          </a>
        </div>

        <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6;">
          Good luck—go get that rating boost! 🚀
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">
          You're receiving this email because you subscribed to contest notifications.
        </p>
        <p style="margin:0;font-size:12px;">
          <a href="https://codenotify.com/preferences" style="color:${platformColor};text-decoration:none;">Manage Preferences</a>
          •
          <a href="https://codenotify.com/unsubscribe" style="color:#475569;text-decoration:none;">Unsubscribe</a>
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
