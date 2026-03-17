import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User } from './schemas/user.schema';
import type { UserDocument } from './schemas/user.schema';
import type {
  LinkingStatusResponse,
  TelegramLinkTokenResponse,
  DiscordOAuthUrlResponse,
} from './dto/linking.dto';

// In-memory store for linking tokens (use Redis in production for multi-instance)
interface LinkingToken {
  userId: string;
  expiresAt: Date;
  type: 'telegram' | 'discord';
}

@Injectable()
export class UserLinkingService implements OnModuleDestroy {
  private readonly logger = new Logger(UserLinkingService.name);
  private readonly linkingTokens = new Map<string, LinkingToken>();
  private readonly tokenExpiry = 10 * 60 * 1000; // 10 minutes
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {
    // Clean up expired tokens every 5 minutes
    // TODO: For multi-instance deployments, replace with Redis-based token store
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredTokens(),
      5 * 60 * 1000,
    );
  }

  /**
   * Cleanup on module destroy to prevent memory leaks
   */
  onModuleDestroy(): void {
    clearInterval(this.cleanupInterval);
    this.linkingTokens.clear();
    this.logger.debug('UserLinkingService cleaned up');
  }

  /**
   * Get linking status for a user
   */
  getLinkingStatus(user: UserDocument): LinkingStatusResponse {
    return {
      telegram: {
        linked: !!user.telegramChatId,
        username: user.telegramUsername as string | undefined,
        chatId: user.telegramChatId as number | undefined,
      },
      discord: {
        linked: !!user.discordId,
        username: user.discordUsername as string | undefined,
        discordId: user.discordId as string | undefined,
      },
    };
  }

  /**
   * Generate a Telegram linking token
   */
  generateTelegramLinkToken(user: UserDocument): TelegramLinkTokenResponse {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiry);
    const userId = user._id.toString();

    // Store the token
    this.linkingTokens.set(token, {
      userId,
      expiresAt,
      type: 'telegram',
    });

    // Get bot username from config or use default
    const botUsername =
      this.configService.get<string>('TELEGRAM_BOT_USERNAME') ||
      'CodeNotifyBot';

    // Generate deep link for Telegram
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    this.logger.log(`Generated Telegram link token for user ${userId}`);

    return {
      token,
      expiresAt,
      deepLink,
    };
  }

  /**
   * Link Telegram account using token
   */
  async linkTelegram(
    token: string,
    chatId: number,
    username?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Atomic get-and-delete to prevent race conditions (token can only be used once)
    const linkingToken = this.linkingTokens.get(token);
    
    if (!linkingToken) {
      throw new BadRequestException('Invalid or expired linking token');
    }

    // Immediately remove token to prevent reuse (atomic operation for race condition protection)
    this.linkingTokens.delete(token);

    if (linkingToken.type !== 'telegram') {
      throw new BadRequestException('Invalid token type');
    }

    if (new Date() > linkingToken.expiresAt) {
      throw new BadRequestException('Linking token has expired');
    }

    // Check if this chat ID is already linked to another user
    const existingUser = await this.userModel
      .findOne({ telegramChatId: chatId })
      .exec();
    if (existingUser && String(existingUser._id) !== linkingToken.userId) {
      throw new BadRequestException(
        'This Telegram account is already linked to another user',
      );
    }

    // Link the Telegram account
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        linkingToken.userId,
        {
          telegramChatId: chatId,
          telegramUsername: username,
          'preferences.notificationChannels.telegram': true,
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    // Token already removed at start of method (race condition protection)

    this.logger.log(
      `Linked Telegram account ${chatId} to user ${linkingToken.userId}`,
    );

    return {
      success: true,
      message: 'Telegram account linked successfully',
    };
  }

  /**
   * Unlink Telegram account
   */
  async unlinkTelegram(
    user: UserDocument,
  ): Promise<{ success: boolean; message: string }> {
    if (!user.telegramChatId) {
      throw new BadRequestException('No Telegram account linked');
    }

    const userId = user._id.toString();

    await this.userModel
      .findByIdAndUpdate(user._id, {
        $unset: { telegramChatId: 1, telegramUsername: 1 },
        'preferences.notificationChannels.telegram': false,
      })
      .exec();

    this.logger.log(`Unlinked Telegram account from user ${userId}`);

    return {
      success: true,
      message: 'Telegram account unlinked successfully',
    };
  }

  /**
   * Generate Discord OAuth URL
   */
  getDiscordOAuthUrl(user: UserDocument): DiscordOAuthUrlResponse {
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const callbackUrl = this.configService.get<string>('DISCORD_CALLBACK_URL');

    if (!clientId || !callbackUrl) {
      throw new BadRequestException('Discord OAuth not configured');
    }

    // Generate state token for CSRF protection
    const state = randomBytes(16).toString('hex');
    const userId = user._id.toString();

    // Store state with user ID
    this.linkingTokens.set(state, {
      userId,
      expiresAt: new Date(Date.now() + this.tokenExpiry),
      type: 'discord',
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'identify',
      state,
    });

    const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

    return { url, state };
  }

  /**
   * Handle Discord OAuth callback
   */
  async handleDiscordCallback(
    code: string,
    state: string,
  ): Promise<{ success: boolean; message: string }> {
    // Atomic get-and-delete to prevent race conditions (state can only be used once)
    const linkingToken = this.linkingTokens.get(state);
    
    if (!linkingToken || linkingToken.type !== 'discord') {
      throw new UnauthorizedException('Invalid or expired state token');
    }

    // Immediately remove state token to prevent reuse (CSRF protection + race condition)
    this.linkingTokens.delete(state);

    if (new Date() > linkingToken.expiresAt) {
      throw new UnauthorizedException('State token has expired');
    }

    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'DISCORD_CLIENT_SECRET',
    );
    const callbackUrl = this.configService.get<string>('DISCORD_CALLBACK_URL');

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new BadRequestException('Discord OAuth not configured');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch(
        'https://discord.com/api/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: callbackUrl,
          }),
        },
      );

      if (!tokenResponse.ok) {
        throw new BadRequestException('Failed to exchange authorization code');
      }

      const tokenData = (await tokenResponse.json()) as {
        access_token: string;
      };

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new BadRequestException('Failed to get Discord user info');
      }

      const discordUser = (await userResponse.json()) as {
        id: string;
        username: string;
      };

      // Check if this Discord ID is already linked to another user
      const existingUser = await this.userModel
        .findOne({ discordId: discordUser.id })
        .exec();

      if (existingUser && String(existingUser._id) !== linkingToken.userId) {
        throw new BadRequestException(
          'This Discord account is already linked to another user',
        );
      }

      // Link the Discord account
      await this.userModel
        .findByIdAndUpdate(linkingToken.userId, {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          'preferences.notificationChannels.discord': true,
        })
        .exec();

      // State token already removed at start of method (race condition + CSRF protection)

      this.logger.log(
        `Linked Discord account ${discordUser.id} to user ${linkingToken.userId}`,
      );

      return {
        success: true,
        message: 'Discord account linked successfully',
      };
    } catch (error) {
      // State token already removed at start of method
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Discord OAuth error: ${errorMessage}`);
      throw new BadRequestException('Failed to link Discord account');
    }
  }

  /**
   * Unlink Discord account
   */
  async unlinkDiscord(
    user: UserDocument,
  ): Promise<{ success: boolean; message: string }> {
    if (!user.discordId) {
      throw new BadRequestException('No Discord account linked');
    }

    const userId = user._id.toString();

    await this.userModel
      .findByIdAndUpdate(user._id, {
        $unset: { discordId: 1, discordUsername: 1 },
        'preferences.notificationChannels.discord': false,
      })
      .exec();

    this.logger.log(`Unlinked Discord account from user ${userId}`);

    return {
      success: true,
      message: 'Discord account unlinked successfully',
    };
  }

  /**
   * Validate a linking token (for internal use by Telegram service)
   */
  validateLinkingToken(token: string): {
    valid: boolean;
    userId?: string;
    type?: string;
  } {
    const linkingToken = this.linkingTokens.get(token);

    if (!linkingToken) {
      return { valid: false };
    }

    if (new Date() > linkingToken.expiresAt) {
      this.linkingTokens.delete(token);
      return { valid: false };
    }

    return {
      valid: true,
      userId: linkingToken.userId,
      type: linkingToken.type,
    };
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [token, data] of this.linkingTokens.entries()) {
      if (now > data.expiresAt) {
        this.linkingTokens.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired linking tokens`);
    }
  }
}
