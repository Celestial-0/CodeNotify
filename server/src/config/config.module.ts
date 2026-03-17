import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('8000'),
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  DB_NAME: z.string().optional(),
  IS_PUBLIC_KEY: z.string().optional(),

  // Database
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Authentication
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_REFRESH_SECRET: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),

  // Contest Sync Scheduler
  CONTEST_SYNC_ENABLED: z.string().optional(),
  CONTEST_SYNC_INTERVAL: z.string().optional(),
  CONTEST_CLEANUP_ENABLED: z.string().optional(),
  CONTEST_CLEANUP_DAYS: z.string().optional(),

  // Notification Configuration
  NOTIFICATIONS_ENABLED: z.string().optional(),
  NOTIFICATION_WINDOW_HOURS: z.string().optional(),

  // Email Notifications (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Telegram
  ENABLE_TELEGRAM: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),

  // Discord
  ENABLE_DISCORD: z.string().optional(),
  DISCORD_APPLICATION_ID: z.string().optional(),
  DISCORD_PUBLIC_KEY: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  DISCORD_CALLBACK_URL: z.string().optional(),

  // WhatsApp
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),

  // Webhook
  WEBHOOK_BASE_URL: z.string().optional(),

  // Notification Retry
  ENABLE_NOTIFICATION_RETRY: z.string().optional(),
  NOTIFICATION_MAX_RETRIES: z.string().optional(),
  NOTIFICATION_RETRY_DELAY_MINUTES: z.string().optional(),
});

const validateEnv = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const errorTree = z.treeifyError(parsed.error);
    console.error(
      '❌ Invalid environment variables:\n',
      JSON.stringify(errorTree, null, 2),
    );
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
};

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env.local'],
      validate: validateEnv,
    }),
  ],
})
export class ConfigModule {}
