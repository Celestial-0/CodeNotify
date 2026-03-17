/**
 * Discord Bot Constants
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
 * Platform colors for Discord embeds (in decimal format)
 */
export const PLATFORM_COLORS: Record<SupportedPlatform | 'default', number> = {
  codeforces: 0x1f8acb, // Blue
  leetcode: 0xffa116, // Orange
  atcoder: 0x222222, // Black
  codechef: 0x5b4638, // Brown
  default: 0x5865f2, // Discord Blurple
};

/**
 * Platform emojis for visual identification
 */
export const PLATFORM_EMOJIS: Record<SupportedPlatform | 'default', string> = {
  codeforces: '🔵',
  leetcode: '🟠',
  atcoder: '⚫',
  codechef: '🟤',
  default: '🏆',
};

/**
 * Discord API limits
 */
export const DISCORD_LIMITS = {
  /** Maximum embed title length */
  MAX_EMBED_TITLE_LENGTH: 256,
  /** Maximum embed description length */
  MAX_EMBED_DESCRIPTION_LENGTH: 4096,
  /** Maximum field name length */
  MAX_FIELD_NAME_LENGTH: 256,
  /** Maximum field value length */
  MAX_FIELD_VALUE_LENGTH: 1024,
  /** Maximum fields per embed */
  MAX_FIELDS_PER_EMBED: 25,
  /** Maximum embeds per message */
  MAX_EMBEDS_PER_MESSAGE: 10,
  /** Maximum total characters in all embeds */
  MAX_TOTAL_EMBED_CHARACTERS: 6000,
  /** Maximum buttons per action row */
  MAX_BUTTONS_PER_ROW: 5,
  /** Maximum action rows per message */
  MAX_ACTION_ROWS: 5,
  /** Maximum custom ID length */
  MAX_CUSTOM_ID_LENGTH: 100,
} as const;

/**
 * Discord rate limiting configuration
 */
export const DISCORD_RATE_LIMITS = {
  /** Global requests per second */
  GLOBAL_REQUESTS_PER_SECOND: 50,
  /** DM channel creates per second */
  DM_CHANNEL_CREATES_PER_SECOND: 5,
  /** Messages per channel per second */
  MESSAGES_PER_CHANNEL_PER_SECOND: 5,
  /** Retry delay on rate limit (ms) */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Slash command definitions
 */
export const SLASH_COMMANDS = [
  {
    name: 'subscribe',
    description: 'Subscribe to contest notifications from CodeNotify',
  },
  {
    name: 'unsubscribe',
    description: 'Unsubscribe from CodeNotify notifications',
  },
  {
    name: 'status',
    description: 'Check your CodeNotify subscription status',
  },
  {
    name: 'platforms',
    description: 'Choose which platforms to follow',
    options: [
      {
        name: 'platform',
        description: 'The platform to toggle',
        type: 3, // STRING type
        required: true,
        choices: [
          { name: 'Codeforces', value: 'codeforces' },
          { name: 'LeetCode', value: 'leetcode' },
          { name: 'AtCoder', value: 'atcoder' },
          { name: 'CodeChef', value: 'codechef' },
        ],
      },
    ],
  },
  {
    name: 'link',
    description: 'Link your Discord account with CodeNotify',
  },
  {
    name: 'help',
    description: 'Show help information for CodeNotify bot',
  },
] as const;

/**
 * Button custom ID prefixes for message components
 */
export const BUTTON_PREFIXES = {
  PLATFORM: 'platform:',
  MUTE: 'mute:',
  UNMUTE: 'unmute:',
  SETTINGS: 'settings:',
  LINK: 'link:',
} as const;

/**
 * Discord button styles
 */
export const BUTTON_STYLES = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
  LINK: 5,
} as const;

/**
 * Message flags
 */
export const MESSAGE_FLAGS = {
  /** Only visible to the user who triggered the interaction */
  EPHEMERAL: 64,
  /** Suppress embeds */
  SUPPRESS_EMBEDS: 4,
} as const;

/**
 * URLs used in messages
 */
export const URLS = {
  WEBSITE: 'https://code-notify.vercel.app',
  SETTINGS: 'https://code-notify.vercel.app/settings',
  HELP: 'https://code-notify.vercel.app/help',
} as const;
