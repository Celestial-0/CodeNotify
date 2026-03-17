import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REST } from '@discordjs/rest';
import {
  Routes,
  APIEmbed,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPICurrentUserCreateDMChannelResult,
} from 'discord-api-types/v10';

export interface DiscordSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger(DiscordService.name);
  private rest: REST | null = null;
  private readonly enabled: boolean;
  private readonly applicationId: string | undefined;
  private readonly botToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('DISCORD_BOT_TOKEN');
    this.applicationId = this.configService.get<string>(
      'DISCORD_APPLICATION_ID',
    );
    const featureFlag =
      this.configService.get<string>('ENABLE_DISCORD') !== 'false';
    this.enabled = !!(this.botToken && this.applicationId && featureFlag);

    if (this.enabled && this.botToken) {
      this.rest = new REST({ version: '10' }).setToken(this.botToken);
    }
  }

  async onModuleInit() {
    if (!this.enabled || !this.rest) {
      this.logger.warn(
        'Discord bot disabled - DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID not configured, or ENABLE_DISCORD=false',
      );
      return;
    }

    try {
      await this.registerSlashCommands();
      this.logger.log('Discord bot initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Discord bot:', error);
    }
  }

  /**
   * Register slash commands with Discord
   */
  private async registerSlashCommands(): Promise<void> {
    if (!this.rest || !this.applicationId) return;

    const commands = [
      {
        name: 'subscribe',
        description: 'Subscribe to contest notifications from CodeNotify',
      },
      {
        name: 'unsubscribe',
        description: 'Unsubscribe from CodeNotify notifications',
      },
      {
        name: 'status',
        description: 'Check your CodeNotify subscription status',
      },
      {
        name: 'platforms',
        description: 'Choose which platforms to follow',
        options: [
          {
            name: 'platform',
            description: 'The platform to toggle',
            type: 3, // STRING type
            required: true,
            choices: [
              { name: 'Codeforces', value: 'codeforces' },
              { name: 'LeetCode', value: 'leetcode' },
              { name: 'AtCoder', value: 'atcoder' },
              { name: 'CodeChef', value: 'codechef' },
            ],
          },
        ],
      },
      {
        name: 'link',
        description: 'Link your Discord account with CodeNotify',
      },
      {
        name: 'help',
        description: 'Show help information for CodeNotify bot',
      },
    ];

    try {
      await this.rest.put(Routes.applicationCommands(this.applicationId), {
        body: commands,
      });
      this.logger.log(
        `Registered ${commands.length} Discord slash commands globally`,
      );
    } catch (error) {
      this.logger.error('Failed to register slash commands:', error);
      throw error;
    }
  }

  /**
   * Check if the Discord bot is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.rest !== null;
  }

  /**
   * Get the REST client instance
   */
  getRest(): REST | null {
    return this.rest;
  }

  /**
   * Send a DM to a Discord user
   * @param userId - Discord user ID
   * @param embed - Message embed to send
   */
  async sendDM(userId: string, embed: APIEmbed): Promise<DiscordSendResult> {
    if (!this.rest) {
      return {
        success: false,
        error: 'Discord service not initialized',
      };
    }

    try {
      // Create DM channel with the user
      const channel = (await this.rest.post(Routes.userChannels(), {
        body: { recipient_id: userId },
      })) as RESTPostAPICurrentUserCreateDMChannelResult;

      // Send the message
      const messageBody: RESTPostAPIChannelMessageJSONBody = {
        embeds: [embed],
      };

      const message = (await this.rest.post(
        Routes.channelMessages(channel.id),
        {
          body: messageBody,
        },
      )) as { id: string };

      this.logger.log(`Sent DM to user ${userId}`);

      return {
        success: true,
        messageId: message.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send DM to user ${userId}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a message to a Discord channel
   * @param channelId - Discord channel ID
   * @param embed - Message embed to send
   */
  async sendToChannel(
    channelId: string,
    embed: APIEmbed,
  ): Promise<DiscordSendResult> {
    if (!this.rest) {
      return {
        success: false,
        error: 'Discord service not initialized',
      };
    }

    try {
      const messageBody: RESTPostAPIChannelMessageJSONBody = {
        embeds: [embed],
      };

      const message = (await this.rest.post(Routes.channelMessages(channelId), {
        body: messageBody,
      })) as { id: string };

      this.logger.log(`Sent message to channel ${channelId}`);

      return {
        success: true,
        messageId: message.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send to channel ${channelId}: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a message with action buttons
   */
  async sendDMWithButtons(
    userId: string,
    embed: APIEmbed,
    buttons: Array<{
      label: string;
      style: 1 | 2 | 3 | 4 | 5; // Primary, Secondary, Success, Danger, Link
      customId?: string;
      url?: string;
    }>,
  ): Promise<DiscordSendResult> {
    if (!this.rest) {
      return {
        success: false,
        error: 'Discord service not initialized',
      };
    }

    try {
      // Create DM channel
      const channel = (await this.rest.post(Routes.userChannels(), {
        body: { recipient_id: userId },
      })) as RESTPostAPICurrentUserCreateDMChannelResult;

      // Build action row with buttons
      const actionRow = {
        type: 1, // ACTION_ROW
        components: buttons.map((btn) => ({
          type: 2, // BUTTON
          style: btn.style,
          label: btn.label,
          custom_id: btn.customId,
          url: btn.url,
        })),
      };

      const message = (await this.rest.post(
        Routes.channelMessages(channel.id),
        {
          body: {
            embeds: [embed],
            components: [actionRow],
          },
        },
      )) as { id: string };

      return {
        success: true,
        messageId: message.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send DM with buttons to ${userId}: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Health check - verify bot connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.rest) return false;

    try {
      await this.rest.get(Routes.user('@me'));
      return true;
    } catch {
      return false;
    }
  }
}
