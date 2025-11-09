// ============================================
// ENVIRONMENT VARIABLE CONSTANTS
// ============================================

/**
 * Server Configuration
 */
export const ENV = {
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'dev',
} as const;

/**
 * Database Configuration
 */
export const DATABASE = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/codenotify',
  DB_NAME:
    process.env.NODE_ENV === 'dev'
      ? `${process.env.DB_NAME || 'codenotify'}-dev`
      : process.env.DB_NAME || 'codenotify',
} as const;

/**
 * Get database name based on environment (runtime evaluation)
 * @param nodeEnv - The NODE_ENV value (e.g., 'dev', 'production')
 * @param baseDbName - The base database name (defaults to 'codenotify')
 * @returns The database name with -dev suffix if in development mode
 */
export function getDatabaseName(
  nodeEnv: string = 'dev',
  baseDbName: string = 'codenotify',
): string {
  return nodeEnv === 'dev' ? `${baseDbName}-dev` : baseDbName;
}

/**
 * Authentication Configuration
 */
export const AUTH = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || '',
  IS_PUBLIC_KEY: process.env.IS_PUBLIC_KEY || 'isPublic',
} as const;

/**
 * Contest Sync Scheduler Configuration
 */
export const SCHEDULER = {
  CONTEST_SYNC_ENABLED:
    process.env.CONTEST_SYNC_ENABLED === 'true' ||
    process.env.CONTEST_SYNC_ENABLED === undefined,
  CONTEST_SYNC_INTERVAL: process.env.CONTEST_SYNC_INTERVAL || '0 */6 * * *',
  CONTEST_CLEANUP_ENABLED:
    process.env.CONTEST_CLEANUP_ENABLED === 'true' ||
    process.env.CONTEST_CLEANUP_ENABLED === undefined,
  CONTEST_CLEANUP_DAYS: parseInt(process.env.CONTEST_CLEANUP_DAYS || '90', 10),
} as const;

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

/**
 * Platform API Configuration (from environment)
 */
export const PLATFORM_ENV = {
  CODEFORCES_API: process.env.CODEFORCES_API || 'https://codeforces.com/api',
  LEETCODE_API: process.env.LEETCODE_API || 'https://leetcode.com/graphql',
} as const;

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
export const DB_NAME = DATABASE.DB_NAME;
export const IS_PUBLIC_KEY = AUTH.IS_PUBLIC_KEY;

// ============================================
// PLATFORM API URLS
// ============================================
export const PLATFORM_URLS = {
  CODEFORCES: 'https://codeforces.com/api',
  LEETCODE: 'https://leetcode.com/graphql',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all',
  ATCODER: 'https://atcoder.jp/contests/?lang=en',
  ATCODER_PROBLEMS: 'https://kenkoooo.com/atcoder/resources/contests.json',
} as const;

// ============================================
// HTTP REQUEST CONFIGURATION
// ============================================
export const HTTP_CONFIG = {
  USER_AGENT: 'CodeNotify/1.0',
  DEFAULT_TIMEOUT: 15000, // 15 seconds
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000, // 1 second
} as const;

// Specific platform timeouts
export const PLATFORM_TIMEOUTS = {
  CODEFORCES: 10000,
  LEETCODE: 15000,
  CODECHEF: 15000,
  ATCODER: 15000,
} as const;

// ============================================
// PLATFORM ADAPTER CONFIGURATION
// ============================================
export const PLATFORM_ADAPTERS_TOKEN = 'PLATFORM_ADAPTERS';

// ============================================
// CONTEST FILTERING CONSTANTS
// ============================================
export const CONTEST_LIMITS = {
  CODECHEF_PAST_CONTESTS: 20,
  ATCODER_DAYS_FILTER: 30,
} as const;

// ============================================
// LEETCODE SPECIFIC CONSTANTS
// ============================================
export const LEETCODE_HEADERS = {
  CONTENT_TYPE: 'application/json',
  ORIGIN: 'https://leetcode.com',
  REFERER: 'https://leetcode.com',
} as const;

// ============================================
// PLATFORM METADATA CONSTANTS
// ============================================
export const PLATFORM_METADATA = {
  CODEFORCES_API_BASE: 'https://codeforces.com/api',
  CODEFORCES_CONTEST_ENDPOINT: '/contest.list',
  LEETCODE_GRAPHQL_ENDPOINT: 'https://leetcode.com/graphql',
  CODECHEF_CONTEST_URL_BASE: 'https://www.codechef.com/',
  ATCODER_CONTEST_URL_BASE: 'https://atcoder.jp/contests/',
  LEETCODE_CONTEST_URL_BASE: 'https://leetcode.com/contest/',
} as const;

// ============================================
// TIME CONVERSION CONSTANTS
// ============================================
export const TIME_CONSTANTS = {
  SECONDS_TO_MS: 1000,
  MINUTES_TO_SECONDS: 60,
  HOURS_TO_SECONDS: 3600,
  DAYS_TO_SECONDS: 86400,
} as const;
