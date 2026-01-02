import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';
import { formatWhatsAppMessage } from '../templates/whatsapp-message.template';

@Injectable()
export class WhatsAppNotificationService implements INotificationService {
  private readonly logger = new Logger(WhatsAppNotificationService.name);
  private readonly enabled: boolean;
  private readonly apiKey: string | undefined;
  private readonly phoneId: string | undefined;

  readonly channel = 'whatsapp';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('WHATSAPP_API_KEY');
    this.phoneId = this.configService.get<string>('WHATSAPP_PHONE_ID');
    this.enabled = !!(this.apiKey && this.phoneId);

    if (this.enabled) {
      this.logger.log('WhatsApp notification service initialized');
    } else {
      this.logger.warn(
        'WhatsApp notification service disabled - WHATSAPP_API_KEY or WHATSAPP_PHONE_ID not configured',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async send(
    phoneNumber: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.enabled) {
      this.logger.warn(
        `[WHATSAPP DISABLED] Would send to ${phoneNumber}: Contest "${payload.contestName}" starts in ${payload.hoursUntilStart} hours`,
      );
      return {
        success: false,
        channel: this.channel,
        error: 'WhatsApp service not configured',
      };
    }

    this.logger.log(`[WHATSAPP] Sending notification to ${phoneNumber}`);

    try {
      // TODO: Implement WhatsApp Business API integration
      // Example with Meta Business API:
      // const response = await axios.post(
      //   `https://graph.facebook.com/v18.0/${this.phoneId}/messages`,
      //   {
      //     messaging_product: 'whatsapp',
      //     to: phoneNumber,
      //     type: 'template',
      //     template: {
      //       name: 'contest_alert',
      //       language: { code: 'en' },
      //       components: [
      //         {
      //           type: 'body',
      //           parameters: [
      //             { type: 'text', text: payload.contestName },
      //             { type: 'text', text: payload.platform },
      //             { type: 'text', text: String(payload.hoursUntilStart) },
      //           ],
      //         },
      //       ],
      //     },
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${this.apiKey}`,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // );

      // STUB IMPLEMENTATION - Remove when implementing actual service
      const message = formatWhatsAppMessage(payload);
      this.logger.warn(
        `[WHATSAPP STUB] Would send message to ${phoneNumber}:\n${message}`,
      );

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        channel: this.channel,
        messageId: 'stub-whatsapp-message-id',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[WHATSAPP FAILED] Failed to send to ${phoneNumber}: ${errorMessage}`,
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
      // TODO: Implement actual health check when WhatsApp API is integrated
      // For now, just check if credentials are configured
      await Promise.resolve(); // Satisfy async requirement
      return !!(this.apiKey && this.phoneId);
    } catch (error) {
      this.logger.error(
        `WhatsApp service health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }


}
