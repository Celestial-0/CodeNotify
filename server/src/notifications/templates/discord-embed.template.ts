import { APIEmbed } from 'discord-api-types/v10';
import { NotificationPayload } from '../interfaces/notification.interface';

/**
 * Platform colors for Discord embeds (in decimal format)
 */
const PLATFORM_COLORS: Record<string, number> = {
  codeforces: 0x1f8acb, // Blue
  leetcode: 0xffa116, // Orange
  atcoder: 0x222222, // Black
  codechef: 0x5b4638, // Brown
  default: 0x5865f2, // Discord blurple
};

/**
 * Platform icons (emoji or custom)
 */
const PLATFORM_EMOJIS: Record<string, string> = {
  codeforces: '🔵',
  leetcode: '🟠',
  atcoder: '⚫',
  codechef: '🟤',
  default: '🏆',
};

/**
 * Format a notification payload as a Discord embed
 */
export function formatDiscordEmbed(payload: NotificationPayload): APIEmbed {
  const color =
    PLATFORM_COLORS[payload.platform.toLowerCase()] || PLATFORM_COLORS.default;
  const emoji =
    PLATFORM_EMOJIS[payload.platform.toLowerCase()] || PLATFORM_EMOJIS.default;

  // Convert start time to Unix timestamp for Discord's dynamic timestamps
  const startTimestamp = Math.floor(
    new Date(payload.startTime).getTime() / 1000,
  );

  // Determine urgency styling
  let title = `${emoji} ${payload.contestName}`;
  let description = '';

  if (payload.hoursUntilStart <= 1) {
    title = `🚨 ${payload.contestName}`;
    description = '**Starting very soon!** Get ready!';
  } else if (payload.hoursUntilStart <= 6) {
    description = '⚡ Coming up soon!';
  }

  const embed: APIEmbed = {
    title,
    description,
    color,
    fields: [
      {
        name: '📍 Platform',
        value: payload.platform,
        inline: true,
      },
      {
        name: '⏳ Starts In',
        value: formatTimeUntil(payload.hoursUntilStart),
        inline: true,
      },
      {
        name: '⏰ Start Time',
        // Discord dynamic timestamp - shows in user's local timezone
        value: `<t:${startTimestamp}:F>`,
        inline: false,
      },
    ],
    footer: {
      text: 'CodeNotify • Good luck! 🚀',
    },
    timestamp: new Date().toISOString(),
  };

  // Add contest URL if available
  if (payload.contestUrl) {
    embed.url = payload.contestUrl;
  }

  return embed;
}

/**
 * Format a digest embed with multiple contests
 * @param contests - Array of contest notification payloads
 * @param digestType - Whether this is a daily or weekly digest
 */
export function formatDiscordDigestEmbed(
  contests: ReadonlyArray<NotificationPayload>,
  digestType: 'daily' | 'weekly',
): APIEmbed {
  if (!contests || contests.length === 0) {
    return {
      title: digestType === 'daily' ? "📅 Today's Contests" : "📅 This Week's Contests",
      description: 'No upcoming contests found.',
      color: 0x5865f2,
      timestamp: new Date().toISOString(),
    };
  }

  const title =
    digestType === 'daily' ? "📅 Today's Contests" : "📅 This Week's Contests";

  const description = contests
    .slice(0, 10) // Limit to 10 contests to avoid embed limits
    .map((contest, index) => {
      const emoji =
        PLATFORM_EMOJIS[contest.platform.toLowerCase()] ||
        PLATFORM_EMOJIS.default;
      const timestamp = Math.floor(
        new Date(contest.startTime).getTime() / 1000,
      );
      return `${index + 1}. ${emoji} **${contest.contestName}**\n   └ ${contest.platform} • <t:${timestamp}:R>`;
    })
    .join('\n\n');

  return {
    title,
    description,
    color: 0x5865f2, // Discord blurple
    footer: {
      text: `${contests.length} contest${contests.length !== 1 ? 's' : ''} • CodeNotify`,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format hours into a human-readable string
 */
function formatTimeUntil(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m > 0) {
      return `${h}h ${m}m`;
    }
    return `${h} hour${h !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}

/**
 * Create a simple text embed for system messages
 */
export function formatDiscordSystemEmbed(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
): APIEmbed {
  const colors: Record<string, number> = {
    info: 0x5865f2,
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
  };

  const emojis: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return {
    title: `${emojis[type]} ${title}`,
    description: message,
    color: colors[type],
    timestamp: new Date().toISOString(),
  };
}
