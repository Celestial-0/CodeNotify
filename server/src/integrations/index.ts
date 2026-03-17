/**
 * Integrations Module - Barrel Export
 * Re-exports all integration modules for external platforms and services
 */

// Core module
export * from './integrations.module';

// Platform adapters
export * from './platforms/platforms.module';
export type {
  PlatformAdapter,
  PlatformConfig,
  ContestData,
  PlatformSyncResult,
} from './platforms/base/platform.interface';

// Telegram - explicit exports to avoid conflicts
export { TelegramModule } from './telegram/telegram.module';
export { TelegramService } from './telegram/telegram.service';
export { TelegramController } from './telegram/telegram.controller';

// Discord - explicit exports to avoid conflicts
export { DiscordModule } from './discord/discord.module';
export { DiscordService } from './discord/discord.service';
export { DiscordController } from './discord/discord.controller';
export { DiscordSignatureGuard } from './discord/discord.guard';

// WhatsApp
export { WhatsappService } from './whatsapp/whatsapp.service';
