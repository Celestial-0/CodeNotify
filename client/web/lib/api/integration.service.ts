/**
 * Integration Service
 * API calls for bot account linking and management
 */

import { httpClient } from './http.client';
import type { BotConnection, BotIntegrations } from '@/lib/types/user.types';

export interface LinkDiscordDto {
  code: string;
}

export interface LinkTelegramDto {
  telegramData: string;
}

export interface LinkWhatsAppDto {
  phoneNumber: string;
  verificationCode?: string;
}

export interface LinkResponse {
  success: boolean;
  userId: string;
  username: string;
  linkedAt: Date;
}

interface LinkingStatusResponse {
  telegram: {
    linked: boolean;
    username?: string;
    chatId?: number;
  };
  discord: {
    linked: boolean;
    username?: string;
    discordId?: string;
  };
}

interface TelegramLinkTokenResponse {
  token: string;
  expiresAt: string;
  deepLink: string;
}

export interface UnlinkResponse {
  success: boolean;
  message?: string;
}

export interface TestNotificationResult {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

export class IntegrationService {
  private static mapStatusToConnections(status: LinkingStatusResponse): BotIntegrations {
    return {
      discord: {
        connected: status.discord.linked,
        isConnected: status.discord.linked,
        username: status.discord.username,
        userId: status.discord.discordId,
      },
      telegram: {
        connected: status.telegram.linked,
        isConnected: status.telegram.linked,
        username: status.telegram.username,
        userId: status.telegram.chatId ? String(status.telegram.chatId) : undefined,
      },
      whatsapp: {
        connected: false,
        isConnected: false,
      },
    };
  }

  private static async getLinkingStatusRaw(): Promise<LinkingStatusResponse> {
    const response = await httpClient.api.get<LinkingStatusResponse>(
      '/users/integrations/status'
    );
    return response.data;
  }

  // ==================== Discord Integration ====================

  /**
   * Get Discord OAuth2 authorization URL
   */
  static async getDiscordAuthUrl(): Promise<{ url: string }> {
    const response = await httpClient.api.get<{ url: string }>(
      '/users/integrations/discord/link'
    );
    return response.data;
  }

  /**
   * Link Discord account using OAuth2 code
   */
  static async linkDiscord(_data: LinkDiscordDto): Promise<LinkResponse> {
    const status = await this.getLinkingStatusRaw();

    if (!status.discord.linked || !status.discord.discordId) {
      throw new Error(
        'Discord account is not linked yet. Complete authorization in the popup and try again.'
      );
    }

    return {
      success: true,
      userId: status.discord.discordId,
      username: status.discord.username || 'discord-user',
      linkedAt: new Date(),
    };
  }

  /**
   * Unlink Discord account
   */
  static async unlinkDiscord(): Promise<UnlinkResponse> {
    const response = await httpClient.api.delete<UnlinkResponse>(
      '/users/integrations/discord'
    );
    return response.data;
  }

  /**
   * Test Discord notification
   */
  static async testDiscord(discordId: string): Promise<TestNotificationResult> {
    const response = await httpClient.api.post<TestNotificationResult>(
      '/notifications/test/discord',
      { discordId }
    );
    return response.data;
  }

  // ==================== Telegram Integration ====================

  /**
   * Get Telegram bot link info
   */
  static async getTelegramBotInfo(): Promise<{ botName: string; linkToken: string }> {
    const tokenData = await this.getTelegramVerificationCode();
    return {
      botName: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'CodeNotifyBot',
      linkToken: tokenData.code,
    };
  }

  /**
   * Get Telegram verification code for linking
   */
  static async getTelegramVerificationCode(): Promise<{
    code: string;
    deepLink: string;
    expiresAt: string;
  }> {
    const response = await httpClient.api.post<TelegramLinkTokenResponse>(
      '/users/integrations/telegram/link'
    );

    return {
      code: response.data.token,
      deepLink: response.data.deepLink,
      expiresAt: response.data.expiresAt,
    };
  }

  /**
   * Check Telegram verification status
   */
  static async checkTelegramVerification(_code: string): Promise<{ 
    verified: boolean; 
    chatId?: string;
    username?: string;
  }> {
    const status = await this.getLinkingStatusRaw();

    if (!status.telegram.linked) {
      return { verified: false };
    }

    return {
      verified: true,
      chatId: status.telegram.chatId ? String(status.telegram.chatId) : undefined,
      username: status.telegram.username,
    };
  }

  /**
   * Link Telegram account using Login Widget data
   */
  static async linkTelegram(_data: LinkTelegramDto): Promise<LinkResponse> {
    const status = await this.getLinkingStatusRaw();

    if (!status.telegram.linked || !status.telegram.chatId) {
      throw new Error(
        'Telegram account is not linked yet. Send the verification code to the bot first.'
      );
    }

    return {
      success: true,
      userId: String(status.telegram.chatId),
      username: status.telegram.username || 'telegram-user',
      linkedAt: new Date(),
    };
  }

  /**
   * Unlink Telegram account
   */
  static async unlinkTelegram(): Promise<UnlinkResponse> {
    const response = await httpClient.api.delete<UnlinkResponse>(
      '/users/integrations/telegram'
    );
    return response.data;
  }

  /**
   * Test Telegram notification
   */
  static async testTelegram(chatId: number): Promise<TestNotificationResult> {
    const response = await httpClient.api.post<TestNotificationResult>(
      '/notifications/test/telegram',
      { chatId }
    );
    return response.data;
  }

  // ==================== WhatsApp Integration ====================

  /**
   * Start WhatsApp linking process
   */
  static async initiateWhatsAppLink(phoneNumber: string): Promise<{ 
    success: boolean; 
    message: string;
    verificationId?: string;
  }> {
    const response = await httpClient.api.post<{ 
      success: boolean; 
      message: string;
      verificationId?: string;
    }>(
      '/integrations/whatsapp/initiate',
      { phoneNumber }
    );
    return response.data;
  }

  /**
   * Verify WhatsApp link with code
   */
  static async verifyWhatsAppLink(data: LinkWhatsAppDto): Promise<LinkResponse> {
    const response = await httpClient.api.post<LinkResponse>(
      '/integrations/whatsapp/verify',
      data
    );
    return response.data;
  }

  /**
   * Unlink WhatsApp account
   */
  static async unlinkWhatsApp(): Promise<UnlinkResponse> {
    const response = await httpClient.api.delete<UnlinkResponse>(
      '/integrations/whatsapp/unlink'
    );
    return response.data;
  }

  // ==================== General Integration Methods ====================

  /**
   * Get bot connection status for current user
   */
  static async getConnectionStatus(): Promise<BotIntegrations> {
    const status = await this.getLinkingStatusRaw();
    return this.mapStatusToConnections(status);
  }

  /**
   * Get individual platform connection status
   */
  static async getPlatformStatus(
    platform: 'discord' | 'telegram' | 'whatsapp'
  ): Promise<BotConnection> {
    const connections = await this.getConnectionStatus();
    return connections[platform] || { connected: false, isConnected: false };
  }

  /**
   * Refresh connection status (check if bot is still accessible)
   */
  static async refreshConnectionStatus(
    platform: 'discord' | 'telegram' | 'whatsapp'
  ): Promise<BotConnection> {
    return this.getPlatformStatus(platform);
  }
}
