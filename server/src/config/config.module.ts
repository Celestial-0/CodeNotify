import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('8000'),
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),

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

  // Contest Platform APIs
  CODEFORCES_API: z.url().optional(),
  LEETCODE_API: z.url().optional(),

  // Email Notifications (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // WhatsApp Cloud API (Meta)
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
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
      envFilePath: '.env.local',
      validate: validateEnv,
    }),
  ],
})
export class ConfigModule {}
