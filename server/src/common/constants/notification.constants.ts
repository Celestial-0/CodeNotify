/**
 * Notification and Email Configuration Constants
 * Contains notification settings, email configuration, and WhatsApp API settings
 */

/**
 * Email Configuration
 */
export const EMAIL = {
  get RESEND_API_KEY(): string {
    return process.env.RESEND_API_KEY || '';
  },
  get EMAIL_FROM(): string {
    return process.env.EMAIL_FROM || 'CodeNotify <noreply@yashkumarsingh.tech>';
  },
};

/**
 * Notification Configuration
 */
export const NOTIFICATIONS = {
  ENABLED:
    process.env.NOTIFICATIONS_ENABLED === 'true' ||
    process.env.NOTIFICATIONS_ENABLED === undefined,
  WINDOW_HOURS: parseInt(process.env.NOTIFICATION_WINDOW_HOURS || '24', 10),
} as const;

/**
 * WhatsApp Cloud API Configuration
 */
export const WHATSAPP = {
  API_KEY: process.env.WHATSAPP_API_KEY || '',
  PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
  BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
} as const;
