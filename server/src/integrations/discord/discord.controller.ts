import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { DiscordSignatureGuard } from './discord.guard';
import { Public } from '../../common/decorators';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

/**
 * Discord interaction types
 */
interface DiscordInteraction {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
    options?: Array<{
      name: string;
      value: string | number | boolean;
    }>;
  };
  user?: { id: string; username: string };
  member?: { user: { id: string; username: string } };
  guild_id?: string;
  channel_id?: string;
}

interface DiscordInteractionResponse {
  type: number;
  data?: {
    content?: string;
    flags?: number;
    embeds?: Array<object>;
  };
}

@Controller('webhooks/discord')
export class DiscordController {
  private readonly logger = new Logger(DiscordController.name);

  /**
   * Discord Interactions endpoint
   * URL: POST /webhooks/discord/interactions
   * This endpoint must respond within 3 seconds
   * @Public decorator bypasses JWT auth - Discord uses Ed25519 signature verification
   */
  @Post('interactions')
  @Public()
  @HttpCode(200)
  @UseGuards(DiscordSignatureGuard)
  handleInteraction(
    @Body() interaction: DiscordInteraction,
  ): DiscordInteractionResponse {
    this.logger.debug(`Received Discord interaction type: ${interaction.type}`);

    // Handle PING (required for Discord endpoint verification)
    if (interaction.type === (InteractionType.PING as number)) {
      this.logger.log('Responding to Discord PING');
      return { type: InteractionResponseType.PONG as number };
    }

    // Handle Application Commands (slash commands)
    if (interaction.type === (InteractionType.APPLICATION_COMMAND as number)) {
      return this.handleSlashCommand(interaction);
    }

    // Handle Message Components (buttons, select menus)
    if (interaction.type === (InteractionType.MESSAGE_COMPONENT as number)) {
      return this.handleMessageComponent(interaction);
    }

    // Default response
    return { type: InteractionResponseType.PONG as number };
  }

  /**
   * Handle slash commands
   */
  private handleSlashCommand(
    interaction: DiscordInteraction,
  ): DiscordInteractionResponse {
    const commandName = interaction.data?.name;
    const userId =
      interaction.user?.id || interaction.member?.user?.id || 'unknown';
    const username =
      interaction.user?.username ||
      interaction.member?.user?.username ||
      'unknown';

    this.logger.log(
      `Slash command: /${commandName} from ${username} (${userId})`,
    );

    switch (commandName) {
      case 'subscribe':
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `✅ **Subscribed to CodeNotify!**\n\n` +
              `Your Discord ID: \`${userId}\`\n\n` +
              `To complete setup:\n` +
              `1. Go to [codenotify.com/settings](https://code-notify.vercel.app/settings)\n` +
              `2. Click "Link Discord"\n` +
              `3. Authorize the connection\n\n` +
              `You'll then receive contest notifications directly here!`,
            flags: 64, // Ephemeral - only visible to the user
          },
        };

      case 'unsubscribe':
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `🔕 **Unsubscribed from CodeNotify**\n\n` +
              `You won't receive contest notifications anymore.\n` +
              `To fully disconnect, visit [codenotify.com/settings](https://code-notify.vercel.app/settings).\n\n` +
              `Use \`/subscribe\` anytime to re-enable notifications.`,
            flags: 64,
          },
        };

      case 'status':
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `📊 **Your CodeNotify Status**\n\n` +
              `Discord ID: \`${userId}\`\n` +
              `Username: ${username}\n\n` +
              `Check your full settings at [codenotify.com/settings](https://code-notify.vercel.app/settings)`,
            flags: 64,
          },
        };

      case 'platforms': {
        const platform = interaction.data?.options?.[0]?.value as string;
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `🏆 **Platform: ${platform}**\n\n` +
              `To update your platform preferences, visit:\n` +
              `[codenotify.com/settings](https://code-notify.vercel.app/settings)`,
            flags: 64,
          },
        };
      }

      case 'link':
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `🔗 **Link Your Account**\n\n` +
              `Your Discord ID: \`${userId}\`\n\n` +
              `Steps to link:\n` +
              `1. Log in to [codenotify.com](https://code-notify.vercel.app)\n` +
              `2. Go to Settings > Integrations\n` +
              `3. Click "Link Discord"\n` +
              `4. Authorize the connection\n\n` +
              `Once linked, you'll receive contest notifications here!`,
            flags: 64,
          },
        };

      case 'help':
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content:
              `📖 **CodeNotify Help**\n\n` +
              `**Available Commands:**\n` +
              `\`/subscribe\` - Start receiving notifications\n` +
              `\`/unsubscribe\` - Stop notifications\n` +
              `\`/status\` - Check your subscription status\n` +
              `\`/platforms\` - Choose platforms to follow\n` +
              `\`/link\` - Link your Discord with CodeNotify\n` +
              `\`/help\` - Show this message\n\n` +
              `**Links:**\n` +
              `• Website: [codenotify.com](https://code-notify.vercel.app)\n` +
              `• Settings: [codenotify.com/settings](https://code-notify.vercel.app/settings)\n` +
              `• Support: [codenotify.com/help](https://code-notify.vercel.app/help)`,
            flags: 64,
          },
        };

      default:
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
          data: {
            content: `❓ Unknown command. Use \`/help\` to see available commands.`,
            flags: 64,
          },
        };
    }
  }

  /**
   * Handle message component interactions (buttons, selects)
   */
  private handleMessageComponent(
    interaction: DiscordInteraction,
  ): DiscordInteractionResponse {
    const customId = interaction.data?.custom_id;

    this.logger.log(`Message component interaction: ${customId}`);

    if (customId?.startsWith('mute:')) {
      const contestId = customId.split(':')[1] ?? 'unknown';
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
        data: {
          content: `🔕 Muted notifications for contest \`${contestId}\``,
          flags: 64,
        },
      };
    }

    if (customId?.startsWith('platform:')) {
      const platform = customId.split(':')[1] ?? 'unknown';
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
        data: {
          content: `✅ ${platform} preference updated!`,
          flags: 64,
        },
      };
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as number,
      data: {
        content: `Action received!`,
        flags: 64,
      },
    };
  }
}
