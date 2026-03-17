/**
 * Notifications Module - Barrel Export
 * Re-exports all notification module components for easy importing
 */

// Core module
export * from './notifications.module';
export * from './notifications.service';
export * from './notifications.controller';

// Schemas
export * from './schemas/notification.schema';

// Interfaces
export * from './interfaces/notification.interface';

// Services
export { EmailNotificationService } from './services/email-notification.service';
export { TelegramNotificationService } from './services/telegram-notification.service';
export { DiscordNotificationService } from './services/discord-notification.service';
export { WhatsAppNotificationService } from './services/whatsapp-notification.service';
export { PushNotificationService } from './services/push-notification.service';
export { AdminEmailService } from './services/admin-email.service';

// Retry service
export { NotificationRetryService } from './notification-retry.service';

// Templates
export * from './templates';
