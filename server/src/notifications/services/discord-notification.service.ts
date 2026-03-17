import { Injectable, Logger } from '@nestjs/common';
import {
  DiscordService,
  DiscordSendResult,
} from '../../integrations/discord/discord.service';
import {
  INotificationService,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification.interface';
import { formatDiscordEmbed } from '../templates/discord-embed.template';
import { APIEmbed } from 'discord-api-types/v10';

@Injectable()
export class DiscordNotificationService implements INotificationService {
  private readonly logger = new Logger(DiscordNotificationService.name);
  readonly channel = 'discord';

  constructor(private readonly discordService: DiscordService) {}

  /**
   * Check if Discord notifications are enabled
   */
  isEnabled(): boolean {
    return this.discordService.isEnabled();
  }

  /**
   * Send a contest notification via Discord DM
   * @param recipient - The Discord user ID
   * @param payload - Contest notification data
   */
  async send(
    recipient: string,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      this.logger.warn('Discord notification service is disabled');
      return {
        success: false,
        channel: this.channel,
        error: 'Discord service not configured',
      };
    }

    if (!recipient || recipient.trim() === '') {
      this.logger.error('Invalid Discord user ID: empty');
      return {
        success: false,
        channel: this.channel,
        error: 'Invalid Discord user ID',
      };
    }

    // Validate Discord user ID format (snowflake - 17-19 digit number)
    if (!/^\d{17,19}$/.test(recipient)) {
      this.logger.error(`Invalid Discord user ID format: ${recipient}`);
      return {
        success: false,
        channel: this.channel,
        error: 'Invalid Discord user ID format',
      };
    }

    try {
      const embed: APIEmbed = formatDiscordEmbed(payload);

      // Build action buttons
      const buttons = this.buildActionButtons(payload);

      let result: DiscordSendResult;
      if (buttons.length > 0) {
        result = await this.discordService.sendDMWithButtons(
          recipient,
          embed,
          buttons,
        );
      } else {
        result = await this.discordService.sendDM(recipient, embed);
      }

      if (result.success) {
        this.logger.log(`Discord notification sent to user ${recipient}`);
        return {
          success: true,
          channel: this.channel,
          messageId: result.messageId,
        };
      } else {
        return {
          success: false,
          channel: this.channel,
          error: result.error ?? 'Failed to send Discord message',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send Discord notification to ${recipient}: ${errorMessage}`,
      );
      return {
        success: false,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  /**
   * Build action buttons for the notification
   */
  private buildActionButtons(payload: NotificationPayload): Array<{
    label: string;
    style: 1 | 2 | 3 | 4 | 5;
    customId?: string;
    url?: string;
  }> {
    const buttons: Array<{
      label: string;
      style: 1 | 2 | 3 | 4 | 5;
      customId?: string;
      url?: string;
    }> = [];

    // Add contest URL button if available
    if (payload.contestUrl) {
      buttons.push({
        label: '🔗 Open Contest',
        style: 5, // Link style
        url: payload.contestUrl,
      });
    }

    // Add mute button
    buttons.push({
      label: '🔕 Mute',
      style: 2, // Secondary style
      customId: `mute:${payload.contestId}`,
    });

    return buttons;
  }

  /**
   * Health check for Discord service
   */
  async healthCheck(): Promise<boolean> {
    return this.discordService.healthCheck();
  }
}
