/**
 * Telegram Bot Constants
 */

/**
 * Supported platforms for contest notifications
 */
export const SUPPORTED_PLATFORMS = [
  'codeforces',
  'leetcode',
  'atcoder',
  'codechef',
] as const;

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

/**
 * Platform display names for user-friendly output
 */
export const PLATFORM_DISPLAY_NAMES: Record<SupportedPlatform, string> = {
  codeforces: 'Codeforces',
  leetcode: 'LeetCode',
  atcoder: 'AtCoder',
  codechef: 'CodeChef',
};

/**
 * Platform emojis for visual identification
 */
export const PLATFORM_EMOJIS: Record<SupportedPlatform, string> = {
  codeforces: '🔵',
  leetcode: '🟠',
  atcoder: '⚫',
  codechef: '🟤',
};

/**
 * Telegram message character limits
 */
export const TELEGRAM_LIMITS = {
  /** Maximum message length */
  MAX_MESSAGE_LENGTH: 4096,
  /** Maximum caption length for media */
  MAX_CAPTION_LENGTH: 1024,
  /** Maximum inline keyboard buttons per row */
  MAX_BUTTONS_PER_ROW: 8,
  /** Maximum total inline keyboard buttons */
  MAX_TOTAL_BUTTONS: 100,
  /** Maximum callback data length */
  MAX_CALLBACK_DATA_LENGTH: 64,
} as const;

/**
 * Rate limiting configuration for Telegram API
 */
export const TELEGRAM_RATE_LIMITS = {
  /** Messages per second to same chat */
  MESSAGES_PER_SECOND_SAME_CHAT: 1,
  /** Messages per second to different chats */
  MESSAGES_PER_SECOND_DIFFERENT_CHATS: 30,
  /** Broadcast messages per second */
  BROADCAST_MESSAGES_PER_SECOND: 25,
  /** Retry delay on rate limit (ms) */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Bot command definitions
 */
export const BOT_COMMANDS = [
  {
    command: 'start',
    description: 'Start receiving contest notifications',
  },
  {
    command: 'stop',
    description: 'Stop receiving notifications',
  },
  {
    command: 'platforms',
    description: 'Choose platforms to follow',
  },
  {
    command: 'status',
    description: 'Check your subscription status',
  },
  {
    command: 'help',
    description: 'Show help message',
  },
] as const;

/**
 * Callback query prefixes for inline keyboard actions
 */
export const CALLBACK_PREFIXES = {
  PLATFORM: 'platform:',
  MUTE: 'mute:',
  UNMUTE: 'unmute:',
  SETTINGS: 'settings:',
} as const;

/**
 * URLs used in messages
 */
export const URLS = {
  WEBSITE: 'https://code-notify.vercel.app',
  SETTINGS: 'https://code-notify.vercel.app/settings',
  HELP: 'https://code-notify.vercel.app/help',
} as const;
