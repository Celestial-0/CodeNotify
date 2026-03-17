import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, Context } from 'grammy';
import type { Update, InlineKeyboardMarkup } from 'grammy/types';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import type { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot | null = null;
  private readonly enabled: boolean;
  private readonly token: string | undefined;
  private readonly pendingConnect = new Map<number, NodeJS.Timeout>();
  private readonly connectWindowMs = 10 * 60 * 1000;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const featureFlag =
      this.configService.get<string>('ENABLE_TELEGRAM') !== 'false';
    this.enabled = !!(this.token && featureFlag);

    if (this.enabled && this.token) {
      this.bot = new Bot(this.token);
    }
  }

  async onModuleInit() {
    if (!this.enabled || !this.bot) {
      this.logger.warn(
        'Telegram bot disabled - TELEGRAM_BOT_TOKEN not configured or ENABLE_TELEGRAM=false',
      );
      return;
    }

    try {
      const webhookRegistered = await this.registerWebhook();
      await this.setupCommands();
      this.setupHandlers();

      if (!webhookRegistered) {
        this.startLongPolling();
      }

      this.logger.log('Telegram bot initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Telegram bot:', error);
    }
  }

  onModuleDestroy() {
    for (const timeoutId of this.pendingConnect.values()) {
      clearTimeout(timeoutId);
    }
    this.pendingConnect.clear();

    if (this.bot) {
      void this.bot.stop();
    }
  }

  private async registerWebhook(): Promise<boolean> {
    if (!this.bot) return false;

    const baseUrl = this.configService.get<string>('WEBHOOK_BASE_URL');
    const secret = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET');

    if (!baseUrl || !secret) {
      this.logger.warn(
        'Webhook not registered - WEBHOOK_BASE_URL or TELEGRAM_WEBHOOK_SECRET not configured',
      );
      return false;
    }

    // Only register webhook in production (HTTPS required)
    if (baseUrl.startsWith('https://')) {
      await this.bot.api.setWebhook(`${baseUrl}/webhooks/telegram/${secret}`, {
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      });
      this.logger.log(
        `Telegram webhook registered: ${baseUrl}/webhooks/telegram/***`,
      );
      return true;
    } else {
      this.logger.warn(
        'Telegram webhook requires HTTPS - webhook not registered for development',
      );
      return false;
    }
  }

  private startLongPolling(): void {
    if (!this.bot) {
      return;
    }

    // Local development fallback when HTTPS webhook cannot be registered.
    void this.bot.start({
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
      onStart: (botInfo) => {
        this.logger.log(
          `Telegram long polling started for @${botInfo.username}`,
        );
      },
    });
  }

  private getApiBaseUrl(): string {
    const configuredBaseUrl =
      this.configService.get<string>('WEBHOOK_BASE_URL');
    if (configuredBaseUrl) {
      return configuredBaseUrl;
    }

    const port = this.configService.get<string>('PORT') ?? '8000';
    return `http://127.0.0.1:${port}`;
  }

  private async completeLinkingFromToken(
    ctx: Context,
    token: string,
    chatId: number,
    username?: string,
  ): Promise<void> {
    try {
      const baseUrl = this.getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `${baseUrl}/users/integrations/telegram/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            chatId,
            username,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        await ctx.reply(
          `✅ <b>Account Linked Successfully!</b>\n\n` +
            `You will now receive contest notifications here.\n\n` +
            `Use /platforms to customize which platforms you follow.\n` +
            `Use /help to see all available commands.`,
          { parse_mode: 'HTML' },
        );
      } else {
        const error = (await response.json()) as { message?: string };
        await ctx.reply(
          `❌ <b>Linking Failed</b>\n\n` +
            `${error.message || 'The link token may be expired.'}\n\n` +
            `Please try again from your CodeNotify settings.`,
          { parse_mode: 'HTML' },
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      this.logger.error(`Failed to link account: ${errorMessage}`);
      await ctx.reply(
        `❌ <b>Linking Error</b>\n\n` +
          `${isTimeout ? 'Request timed out.' : 'Something went wrong.'} Please try again later.`,
        { parse_mode: 'HTML' },
      );
    }
  }

  private async getLinkedUserByChatId(
    chatId: number,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramChatId: chatId }).exec();
  }

  private async setTelegramNotificationChannel(
    chatId: number,
    enabled: boolean,
  ): Promise<boolean> {
    const result = await this.userModel
      .updateOne(
        { telegramChatId: chatId },
        { 'preferences.notificationChannels.telegram': enabled },
      )
      .exec();

    return result.matchedCount > 0;
  }

  private beginConnectMode(chatId: number): void {
    const existing = this.pendingConnect.get(chatId);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      this.pendingConnect.delete(chatId);
    }, this.connectWindowMs);

    this.pendingConnect.set(chatId, timeout);
  }

  private endConnectMode(chatId: number): void {
    const timeout = this.pendingConnect.get(chatId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingConnect.delete(chatId);
    }
  }

  private async setupCommands(): Promise<void> {
    if (!this.bot) return;

    await this.bot.api.setMyCommands([
      {
        command: 'start',
        description: 'Start receiving contest notifications',
      },
      { command: 'stop', description: 'Stop receiving notifications' },
      { command: 'connect', description: 'Link your CodeNotify account' },
      { command: 'platform', description: 'Manage contest platforms' },
      { command: 'platforms', description: 'Choose platforms to follow' },
      { command: 'status', description: 'Check your subscription status' },
      { command: 'help', description: 'Show help message' },
    ]);
  }

  private setupHandlers(): void {
    if (!this.bot) return;

    // Handle /start command
    this.bot.command('start', async (ctx: Context) => {
      const linkToken = ctx.match as string;
      const chatId = ctx.chat?.id;
      const username = ctx.from?.username;

      if (!chatId) return;

      if (linkToken) {
        await this.completeLinkingFromToken(ctx, linkToken, chatId, username);
        this.endConnectMode(chatId);
      } else {
        const hasLinkedAccount = await this.setTelegramNotificationChannel(
          chatId,
          true,
        );

        await ctx.reply(
          `👋 <b>Welcome to CodeNotify!</b>\n\n` +
            `${
              hasLinkedAccount
                ? 'Notifications are now enabled for this chat.\n\n'
                : `I'll send you notifications about upcoming coding contests.\n\n` +
                  `<b>To get started:</b>\n` +
                  `1. Go to <a href="https://code-notify.vercel.app/settings">codenotify.com/settings</a>\n` +
                  `2. Click "Link Telegram"\n` +
                  `3. Send /connect here and paste the generated code\n\n`
            }` +
            `Your Chat ID: <code>${chatId}</code>\n\n` +
            `Use /help to see available commands.`,
          { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
      }
    });

    // Explicit connect flow: only then accept pasted verification token.
    this.bot.command('connect', async (ctx: Context) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const linked = await this.getLinkedUserByChatId(chatId);
      if (linked) {
        await ctx.reply(
          `✅ <b>Already Connected</b>\n\n` +
            `Your Telegram account is already linked to CodeNotify.\n` +
            `Use /status to view connection details.`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      this.beginConnectMode(chatId);

      await ctx.reply(
        `🔐 <b>Connect Mode Enabled</b>\n\n` +
          `Paste the 64-character verification code from CodeNotify settings.\n` +
          `This connect mode expires in 10 minutes.`,
        { parse_mode: 'HTML' },
      );
    });

    // Support manual token paste flow from the client dialog.
    this.bot.on('message:text', async (ctx: Context, next) => {
      const chatId = ctx.chat?.id;
      const username = ctx.from?.username;
      const text = ctx.message?.text?.trim();

      if (!chatId || !text) {
        return next();
      }

      // Let command handlers (/help, /status, /platform, etc.) run.
      if (text.startsWith('/')) {
        return next();
      }

      const tokenMatch = text.match(/^[a-f0-9]{64}$/i);
      if (!tokenMatch) {
        return next();
      }

      if (!this.pendingConnect.has(chatId)) {
        await ctx.reply(
          `ℹ️ <b>Connect Mode Required</b>\n\n` +
            `Please send /connect first, then send your verification code.`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      await this.completeLinkingFromToken(ctx, tokenMatch[0], chatId, username);
      this.endConnectMode(chatId);

      return;
    });

    // Handle /stop command
    this.bot.command('stop', async (ctx: Context) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const updated = await this.setTelegramNotificationChannel(chatId, false);

      await ctx.reply(
        `🔕 <b>Notifications Paused</b>\n\n` +
          `${
            updated
              ? `Telegram notifications are disabled for this chat.\n\nUse /start to resume.`
              : `No linked CodeNotify account found for this chat.\n\nUse /connect after generating a code from settings.`
          }`,
        { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
      );
    });

    // Handle /platform and /platforms commands
    const handlePlatformCommand = async (ctx: Context) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const linked = await this.getLinkedUserByChatId(chatId);
      if (!linked) {
        await ctx.reply(
          `🔗 <b>Account Not Linked</b>\n\n` +
            `Use /connect to link your CodeNotify account first.`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      const keyboard = new InlineKeyboard()
        .text('Codeforces', 'platform:codeforces')
        .text('LeetCode', 'platform:leetcode')
        .row()
        .text('AtCoder', 'platform:atcoder')
        .text('CodeChef', 'platform:codechef');

      await ctx.reply(
        `🏆 <b>Select Platforms</b>\n\n` +
          `Choose which platforms you want to receive notifications for:`,
        { parse_mode: 'HTML', reply_markup: keyboard },
      );
    };

    this.bot.command('platforms', handlePlatformCommand);
    this.bot.command('platform', handlePlatformCommand);

    // Handle /status command
    this.bot.command('status', async (ctx: Context) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const linked = await this.getLinkedUserByChatId(chatId);
      if (!linked) {
        await ctx.reply(
          `📊 <b>Status</b>\n\n` +
            `Linked: No\n` +
            `Notifications: Off\n\n` +
            `Use /connect to link your CodeNotify account.`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      const telegramEnabled =
        linked.preferences?.notificationChannels?.telegram === true;
      const platformList = linked.preferences?.platforms?.length
        ? linked.preferences.platforms.join(', ')
        : 'Not set';

      await ctx.reply(
        `📊 <b>Your Status</b>\n\n` +
          `Chat ID: <code>${chatId}</code>\n` +
          `Linked: Yes\n` +
          `Username: ${linked.telegramUsername || 'Not set'}\n` +
          `Notifications: ${telegramEnabled ? 'On' : 'Off'}\n` +
          `Platforms: ${platformList}\n\n` +
          `Manage your settings at <a href="https://code-notify.vercel.app/settings">codenotify.com/settings</a>`,
        { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
      );
    });

    // Handle /help command
    this.bot.command('help', async (ctx: Context) => {
      await ctx.reply(
        `📖 <b>CodeNotify Help</b>\n\n` +
          `<b>Quick Start:</b>\n` +
          `1. Generate a Telegram verification code in CodeNotify settings\n` +
          `2. Send /connect in this chat\n` +
          `3. Paste the generated verification code\n\n` +
          `<b>Available Commands:</b>\n` +
          `/start - Start receiving notifications\n` +
          `/stop - Pause notifications\n` +
          `/connect - Link your CodeNotify account\n` +
          `/platform - Choose platforms to follow\n` +
          `/platforms - Choose platforms to follow\n` +
          `/status - Check your status\n` +
          `/help - Show this message\n\n` +
          `<b>Need help?</b>\n` +
          `Visit <a href="https://code-notify.vercel.app/help">codenotify.com/help</a>`,
        { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
      );
    });

    // Handle callback queries (button clicks)
    this.bot.on('callback_query:data', async (ctx: Context) => {
      const data = ctx.callbackQuery?.data;
      if (!data) return;

      if (data.startsWith('platform:')) {
        const platform = data.split(':')[1];
        await ctx.answerCallbackQuery({
          text: `${platform} selected! Update your full preferences at codenotify.com`,
        });
      } else if (data.startsWith('mute:')) {
        const contestId = data.split(':')[1];
        await ctx.answerCallbackQuery({
          text: `Muted contest ${contestId}`,
        });
      }
    });
  }

  /**
   * Check if the Telegram bot is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.bot !== null;
  }

  /**
   * Get the bot instance
   */
  getBot(): Bot | null {
    return this.bot;
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      reply_markup?: InlineKeyboardMarkup;
      disable_notification?: boolean;
    },
  ): Promise<boolean> {
    if (!this.bot) {
      this.logger.warn('Telegram bot not initialized');
      return false;
    }

    try {
      await this.bot.api.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        ...options,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send message to ${chatId}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Build an inline keyboard for notifications
   */
  buildInlineKeyboard(
    buttons: Array<{ text: string; url?: string; callback_data?: string }>,
  ): InlineKeyboardMarkup {
    const keyboard = new InlineKeyboard();

    for (const button of buttons) {
      if (button.url) {
        keyboard.url(button.text, button.url);
      } else if (button.callback_data) {
        keyboard.text(button.text, button.callback_data);
      }
      keyboard.row();
    }

    return keyboard;
  }

  /**
   * Handle incoming webhook updates
   */
  async handleUpdate(update: Update): Promise<void> {
    if (!this.bot) {
      this.logger.warn('Telegram bot not initialized');
      return;
    }

    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle update: ${errorMessage}`);
    }
  }

  /**
   * Health check - verify bot connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.bot) return false;

    try {
      const me = await this.bot.api.getMe();
      return !!me.id;
    } catch {
      return false;
    }
  }
}
