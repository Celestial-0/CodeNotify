/**
 * HTTP Request and Platform API Configuration
 * Contains platform URLs, HTTP settings, and request configuration
 */

/**
 * Server Configuration
 */
export const ENV = {
  PORT: process.env.PORT || '8000',
  NODE_ENV: process.env.NODE_ENV || 'dev',
} as const;

/**
 * Platform API URLs
 */
export const PLATFORM_URLS = {
  CODEFORCES: 'https://codeforces.com/api',
  LEETCODE: 'https://leetcode.com/graphql',
  CODECHEF: 'https://www.codechef.com/api/list/contests/all',
  ATCODER: 'https://atcoder.jp/contests/?lang=en',
  ATCODER_PROBLEMS: 'https://kenkoooo.com/atcoder/resources/contests.json',
} as const;

/**
 * Platform API Configuration (from environment)
 */
export const PLATFORM_ENV = {
  CODEFORCES_API: process.env.CODEFORCES_API || 'https://codeforces.com/api',
  LEETCODE_API: process.env.LEETCODE_API || 'https://leetcode.com/graphql',
} as const;

/**
 * HTTP Request Configuration
 */
export const HTTP_CONFIG = {
  USER_AGENT: 'CodeNotify/1.0',
  DEFAULT_TIMEOUT: 15000, // 15 seconds
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Specific platform timeouts
 */
export const PLATFORM_TIMEOUTS = {
  CODEFORCES: 10000,
  LEETCODE: 15000,
  CODECHEF: 15000,
  ATCODER: 15000,
} as const;

/**
 * Platform Adapter Configuration
 */
export const PLATFORM_ADAPTERS_TOKEN = 'PLATFORM_ADAPTERS';

/**
 * Platform Metadata Constants
 */
export const PLATFORM_METADATA = {
  CODEFORCES_API_BASE: 'https://codeforces.com/api',
  CODEFORCES_CONTEST_ENDPOINT: '/contest.list',
  LEETCODE_GRAPHQL_ENDPOINT: 'https://leetcode.com/graphql',
  CODECHEF_CONTEST_URL_BASE: 'https://www.codechef.com/',
  ATCODER_CONTEST_URL_BASE: 'https://atcoder.jp/contests/',
  LEETCODE_CONTEST_URL_BASE: 'https://leetcode.com/contest/',
} as const;

/**
 * LeetCode Specific Constants
 */
export const LEETCODE_HEADERS = {
  CONTENT_TYPE: 'application/json',
  ORIGIN: 'https://leetcode.com',
  REFERER: 'https://leetcode.com',
} as const;

/**
 * Contest Filtering Constants
 */
export const CONTEST_LIMITS = {
  CODECHEF_PAST_CONTESTS: 20,
  ATCODER_DAYS_FILTER: 30,
} as const;

/**
 * Time Conversion Constants
 */
export const TIME_CONSTANTS = {
  SECONDS_TO_MS: 1000,
  MINUTES_TO_SECONDS: 60,
  HOURS_TO_SECONDS: 3600,
  DAYS_TO_SECONDS: 86400,
} as const;
