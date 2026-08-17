/**
 * Authentication and Authorization Constants
 */

export const AUTH = {
  IS_PUBLIC_KEY: 'isPublic',
} as const;

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
