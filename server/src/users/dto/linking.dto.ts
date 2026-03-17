import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for generating a Telegram linking token
 */
export const GenerateTelegramLinkTokenSchema = z.object({});

export class GenerateTelegramLinkTokenDto extends createZodDto(
  GenerateTelegramLinkTokenSchema,
) {}

/**
 * DTO for linking Telegram account via webhook callback
 */
export const LinkTelegramSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  chatId: z.number().int().positive('Chat ID must be a positive integer'),
  username: z.string().optional(),
});

export class LinkTelegramDto extends createZodDto(LinkTelegramSchema) {}

/**
 * DTO for unlinking Telegram account
 */
export const UnlinkTelegramSchema = z.object({});

export class UnlinkTelegramDto extends createZodDto(UnlinkTelegramSchema) {}

/**
 * DTO for Discord OAuth callback
 */
export const DiscordOAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
});

export class DiscordOAuthCallbackDto extends createZodDto(
  DiscordOAuthCallbackSchema,
) {}

/**
 * DTO for unlinking Discord account
 */
export const UnlinkDiscordSchema = z.object({});

export class UnlinkDiscordDto extends createZodDto(UnlinkDiscordSchema) {}

/**
 * Response types
 */
export interface LinkingStatusResponse {
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

export interface TelegramLinkTokenResponse {
  token: string;
  expiresAt: Date;
  deepLink: string;
}

export interface DiscordOAuthUrlResponse {
  url: string;
  state: string;
}
