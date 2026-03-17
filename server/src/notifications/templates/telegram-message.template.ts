import { NotificationPayload } from '../interfaces/notification.interface';

/**
 * Platform emoji mappings for visual distinction
 */
const PLATFORM_EMOJIS: Record<string, string> = {
  codeforces: '🔵',
  leetcode: '🟠',
  atcoder: '⚫',
  codechef: '🟤',
  default: '🏆',
};

/**
 * Format a notification payload as an HTML message for Telegram
 */
export function formatTelegramMessage(payload: NotificationPayload): string {
  const platformEmoji =
    PLATFORM_EMOJIS[payload.platform.toLowerCase()] || PLATFORM_EMOJIS.default;

  const startTime = new Date(payload.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Calculate urgency indicator
  let urgencyLabel = '';
  if (payload.hoursUntilStart <= 1) {
    urgencyLabel = '🚨 <b>STARTING SOON!</b>\n\n';
  } else if (payload.hoursUntilStart <= 6) {
    urgencyLabel = '⚡ <b>Coming up!</b>\n\n';
  }

  return `
${urgencyLabel}🏆 <b>Contest Alert</b>

<b>${escapeHtml(payload.contestName)}</b>

${platformEmoji} Platform: ${escapeHtml(payload.platform)}
⏰ Starts: ${startTime}
⏳ In: ${formatTimeUntil(payload.hoursUntilStart)}

<i>Good luck! 🚀</i>
`.trim();
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
 * Escape HTML special characters for Telegram HTML parse mode
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format a digest message with multiple contests
 * @param contests - Array of contest notification payloads
 * @param digestType - Whether this is a daily or weekly digest
 */
export function formatTelegramDigest(
  contests: ReadonlyArray<NotificationPayload>,
  digestType: 'daily' | 'weekly',
): string {
  if (!contests || contests.length === 0) {
    return digestType === 'daily'
      ? "📅 <b>Today's Contests</b>\n\nNo upcoming contests today."
      : "📅 <b>This Week's Contests</b>\n\nNo upcoming contests this week.";
  }

  const title =
    digestType === 'daily'
      ? "📅 <b>Today's Contests</b>"
      : "📅 <b>This Week's Contests</b>";

  const contestList = contests
    .map((contest, index) => {
      const platformEmoji =
        PLATFORM_EMOJIS[contest.platform.toLowerCase()] ||
        PLATFORM_EMOJIS.default;
      const time = new Date(contest.startTime).toLocaleString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${index + 1}. ${platformEmoji} <b>${escapeHtml(contest.contestName)}</b>\n   📍 ${contest.platform} • ⏰ ${time}`;
    })
    .join('\n\n');

  return `
${title}

${contestList}

<i>Click a contest to open details 🔗</i>
`.trim();
}
