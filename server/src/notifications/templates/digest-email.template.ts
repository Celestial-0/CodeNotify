/**
 * Format digest email template with multiple contests
 */
export function formatDigestEmail(
    contests: Array<{
        name: string;
        platform: string;
        startTime: Date;
        hoursUntilStart: number;
        websiteUrl?: string;
    }>,
    frequency: 'daily' | 'weekly',
): string {
    const platformColors: Record<string, string> = {
        codeforces: '#1F8ACB',
        leetcode: '#FFA116',
        codechef: '#5B4638',
        atcoder: '#000000',
    };

    const contestsHtml = contests
        .map((contest, index) => {
            const platformColor =
                platformColors[contest.platform.toLowerCase()] || '#6366f1';
            const startTimeFormatted = contest.startTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            return `
        <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;margin-bottom:8px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${platformColor};margin-right:8px;"></span>
            <span style="color:${platformColor};font-weight:600;text-transform:uppercase;font-size:12px;">${contest.platform}</span>
          </div>
          <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">${contest.name}</h3>
          <p style="margin:0 0 4px;font-size:14px;color:#64748b;">
            <strong>Starts:</strong> ${startTimeFormatted}
          </p>
          <p style="margin:0;font-size:14px;color:#64748b;">
            <strong>In:</strong> <span style="color:#b91c1c;font-weight:600;">${contest.hoursUntilStart} hours</span>
          </p>
        </div>
      `;
        })
        .join('');

    const timeframe = frequency === 'daily' ? 'today' : 'this week';
    const emoji = frequency === 'daily' ? '📅' : '📆';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${frequency === 'daily' ? 'Daily' : 'Weekly'} Contest Digest</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" style="width:100%;padding:32px 0;">
<tr>
<td align="center">

  <table role="presentation" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;">
    
    <!-- HEADER -->
    <tr>
      <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#111827;">${emoji} ${frequency === 'daily' ? 'Daily' : 'Weekly'} Contest Digest</h1>
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
          Here are the <strong>${contests.length}</strong> upcoming contest${contests.length > 1 ? 's' : ''} for ${timeframe}:
        </p>

        ${contestsHtml}

        <p style="margin-top:24px;font-size:13px;color:#64748b;line-height:1.6;">
          Good luck with your contests! 🚀
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">
          You're receiving this ${frequency} digest based on your notification preferences.
        </p>
        <p style="margin:0;font-size:12px;">
          <a href="https://codenotify.com/preferences" style="color:#6366f1;text-decoration:none;">Manage Preferences</a>
          •
          <a href="https://codenotify.com/unsubscribe" style="color:#475569;text-decoration:none;">Unsubscribe</a>
        </p>
      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
  `.trim();
}
