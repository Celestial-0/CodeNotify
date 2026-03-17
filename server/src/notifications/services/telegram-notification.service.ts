import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../../integrations/telegram/telegram.service';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';
import { formatTelegramMessage } from '../templates/telegram-message.template';

@Injectable()
export class TelegramNotificationService implements INotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);
  readonly channel = 'telegram';

  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Check if Telegram notifications are enabled
   */
  isEnabled(): boolean {
    return this.telegramService.isEnabled();
  }

  /**
   * Send a contest notification via Telegram
   * @param recipient - The Telegram chat ID (as string for interface compatibility)
   * @param payload - Contest notification data
   */
  async send(
    recipient: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      this.logger.warn('Telegram notification service is disabled');
      return {
        success: false,
        channel: this.channel,
        error: 'Telegram service not configured',
      };
    }

    // Validate chat ID format before parsing (should be numeric, possibly negative for groups)
    if (!recipient || !/^-?\d+$/.test(recipient.trim())) {
      this.logger.error(`Invalid Telegram chat ID format: ${recipient}`);
      return {
        success: false,
        channel: this.channel,
        error: 'Invalid chat ID format',
      };
    }

    const chatId = parseInt(recipient.trim(), 10);

    if (isNaN(chatId) || chatId === 0) {
      this.logger.error(`Invalid Telegram chat ID: ${recipient}`);
      return {
        success: false,
        channel: this.channel,
        error: 'Invalid chat ID',
      };
    }

    try {
      const message = formatTelegramMessage(payload);

      // Build inline keyboard with action buttons
      const buttons = this.buildButtons(payload);
      const replyMarkup = this.telegramService.buildInlineKeyboard(buttons);

      const success = await this.telegramService.sendMessage(chatId, message, {
        reply_markup: replyMarkup,
      });

      if (success) {
        this.logger.log(`Telegram notification sent to chat ${chatId}`);
        return {
          success: true,
          channel: this.channel,
        };
      } else {
        return {
          success: false,
          channel: this.channel,
          error: 'Failed to send Telegram message',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send Telegram notification to ${chatId}: ${errorMessage}`,
      );
      return {
        success: false,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  /**
   * Build button configuration for the notification message
   */
  private buildButtons(
    payload: NotificationPayload,
  ): Array<{ text: string; url?: string; callback_data?: string }> {
    const buttons: Array<{
      text: string;
      url?: string;
      callback_data?: string;
    }> = [];

    // Add contest URL button if available
    if (payload.contestUrl) {
      buttons.push({
        text: '🔗 Open Contest',
        url: payload.contestUrl,
      });
    }

    // Add mute button
    buttons.push({
      text: '🔕 Mute this contest',
      callback_data: `mute:${payload.contestId}`,
    });

    return buttons;
  }

  /**
   * Health check for Telegram service
   */
  async healthCheck(): Promise<boolean> {
    return this.telegramService.healthCheck();
  }
}
