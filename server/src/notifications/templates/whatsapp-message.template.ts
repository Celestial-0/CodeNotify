import { NotificationPayload } from '../interfaces/notification.interface';

/**
 * Format WhatsApp message (plain text)
 */
export function formatWhatsAppMessage(payload: NotificationPayload): string {
    return `
🚨 *Contest Alert*

*${payload.contestName}*

📱 Platform: ${payload.platform.toUpperCase()}
⏰ Starts in: *${payload.hoursUntilStart} hours*
📅 Start Time: ${payload.startTime.toLocaleString()}

Good luck! 🎯

Manage your preferences: https://codenotify.com/preferences
    `.trim();
}
