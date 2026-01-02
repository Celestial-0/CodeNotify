/**
 * Authentication and Authorization Constants
 * Contains JWT secrets, OAuth configuration, and auth-related settings
 */

export const AUTH = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || '',
  IS_PUBLIC_KEY: process.env.IS_PUBLIC_KEY || 'isPublic',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;

/**
 * Legacy export for backward compatibility
 */
export const IS_PUBLIC_KEY = AUTH.IS_PUBLIC_KEY;

/**
 * OTP Configuration Constants
 */
export const OTP = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  SALT_ROUNDS: 10,
  CODE_LENGTH: 6,
} as const;

/**
 * Password Hashing Configuration
 */
export const PASSWORD = {
  SALT_ROUNDS: 12,
  MIN_LENGTH: 6,
} as const;

/**
 * JWT Token Configuration
 */
export const TOKEN = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;
