# Notification System

Comprehensive multi-channel notification system with database persistence and retry logic.

## Overview

CodeNotify provides a robust notification system that:
- Sends contest alerts via multiple channels (Email, WhatsApp, Push)
- Stores notification history in MongoDB
- Implements automatic retry logic for failed deliveries
- Provides admin tools for bulk email operations
- Tracks delivery status per channel

## Architecture

### Core Components

1. **NotificationsService** - Main orchestration service
2. **EmailNotificationService** - Email delivery via Resend
3. **WhatsAppNotificationService** - WhatsApp messaging
4. **PushNotificationService** - Push notifications
5. **AdminEmailService** - Bulk email operations
6. **Notification Schema** - MongoDB persistence

## Notification Channels

### 1. Email
- **Provider**: Resend
- **Status**: ✅ Fully Implemented
- **Configuration**: `RESEND_API_KEY`, `EMAIL_FROM`
- **Features**: HTML templates, retry logic, delivery tracking
- **Requirement**: User `isEmailVerified` must be `true`

### 2. WhatsApp
- **Provider**: Custom/Twilio
- **Status**: ✅ Implementation Ready
- **Configuration**: `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER`
- **Features**: Message formatting, delivery status

### 3. Push Notifications
- **Provider**: Custom/Firebase
- **Status**: ✅ Implementation Ready
- **Configuration**: `PUSH_API_KEY`
- **Features**: Device targeting, payload customization

## Notification Schema

### MongoDB Document Structure

```typescript
{
  userId: ObjectId;              // User reference
  contestId?: ObjectId;          // Contest reference (optional)
  type: NotificationType;        // CONTEST_REMINDER | CONTEST_STARTING | CONTEST_ENDING | SYSTEM_ALERT
  title: string;                 // Notification title
  message: string;               // Notification message
  payload?: Record<string, any>; // Additional data
  
  // Multi-channel delivery
  channels: NotificationChannel[];  // ['email', 'whatsapp', 'push']
  deliveryStatus: Array<{
    channel: NotificationChannel;
    status: NotificationStatus;
    sentAt?: Date;
    failedAt?: Date;
    error?: string;
    retryCount: number;
    lastRetryAt?: Date;
  }>;
  
  // Status tracking
  status: NotificationStatus;    // PENDING | SENT | FAILED | RETRYING
  scheduledAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  
  // Retry logic
  retryCount: number;            // Current retry attempts
  maxRetries: number;            // Max 3 retries
  lastRetryAt?: Date;
  nextRetryAt?: Date;
  
  // Error tracking
  error?: string;
  errorHistory?: Array<{
    timestamp: Date;
    error: string;
    channel?: NotificationChannel;
  }>;
  
  // User interaction
  isRead: boolean;
  readAt?: Date;
  
  // Metadata
  isActive: boolean;
  expiresAt?: Date;              // Auto-cleanup after 90 days
  createdAt: Date;
  updatedAt: Date;
}
```

## User Preferences

### Notification Settings

```typescript
preferences: {
  // Which platforms to get notifications for
  platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
  
  // Notification channels
  notificationChannels: ['email', 'whatsapp', 'push'],
  
  // Hours before contest to notify (1-168 hours)
  notifyBefore: 24
}
```

### Update Preferences

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "platforms": ["codeforces", "leetcode"],
      "notificationChannels": ["email"],
      "notifyBefore": 48
    }
  }'
```

## Notification Flow

### Scheduled Check

**Schedule**: Every 30 minutes

```
1. Scheduler → Trigger notification check
2. Find contests starting within notification window
3. For each contest:
   a. Find users with matching preferences
   b. Check if already notified
   c. Send via preferred channels
   d. Mark contest as notified
```

### Notification Window

```typescript
// Default: 24 hours
NOTIFICATION_WINDOW_HOURS=24

// Example: Contest starts at 2 PM tomorrow
// Current time: 2 PM today
// Window: 2 PM today to 2 PM tomorrow
// User notifyBefore: 24 hours
// → Notification sent now
```

### Filtering Logic

```typescript
// 1. Find contests in window
const now = new Date();
const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

const contests = await Contest.find({
  startTime: { $gte: now, $lte: windowEnd },
  phase: 'BEFORE',
  isActive: true,
  isNotified: false
});

// 2. For each contest, find matching users
const users = await User.find({
  'preferences.platforms': contest.platform,
  'preferences.contestTypes': { $in: [contest.type, []] },
  isActive: true
});

// 3. Filter by notifyBefore
const matchingUsers = users.filter(user => {
  const hoursUntilStart = (contest.startTime - now) / (1000 * 60 * 60);
  return hoursUntilStart <= user.preferences.notifyBefore;
});
```

## Email Notifications

### Configuration

```bash
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@codenotify.dev
```

### Email Template

```typescript
{
  from: 'CodeNotify <noreply@codenotify.dev>',
  to: user.email,
  subject: `Upcoming Contest: ${contest.name}`,
  html: `
    <h1>${contest.name}</h1>
    <p>Platform: ${contest.platform}</p>
    <p>Starts: ${contest.startTime}</p>
    <p>Duration: ${contest.durationMinutes} minutes</p>
    <a href="${contest.websiteUrl}">Register Now</a>
  `
}
```

### Send Email

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'CodeNotify <noreply@codenotify.dev>',
  to: user.email,
  subject: `Upcoming: ${contest.name}`,
  html: emailTemplate
});
```

## Notification Types

### 1. Contest Reminder

**Trigger**: Contest starting within user's `notifyBefore` window

**Content**:
- Contest name
- Platform
- Start time
- Duration
- Registration link

### 2. Daily Digest (Future)

**Trigger**: Daily at user-specified time

**Content**:
- All contests in next 24 hours
- Grouped by platform
- Summary statistics

### 3. Weekly Summary (Future)

**Trigger**: Weekly on user-specified day

**Content**:
- Upcoming contests for the week
- Past week statistics
- Platform highlights

## Implementation

### NotificationsService

The main service orchestrates notification delivery across multiple channels:

```typescript
@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly emailService: EmailNotificationService,
    private readonly whatsappService: WhatsAppNotificationService,
    private readonly pushService: PushNotificationService,
  ) {}

  /**
   * Find users who should be notified about upcoming contests
   */
  async getUsersForNotification(contest: ContestDocument): Promise<UserDocument[]> {
    const now = new Date();
    const hoursUntilStart = (contest.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return await this.userModel.find({
      isActive: true,
      'preferences.platforms': contest.platform,
      'preferences.notifyBefore': { $gte: Math.floor(hoursUntilStart) },
    }).exec();
  }

  /**
   * Send notification via multiple channels
   */
  async sendMultiChannelNotification(
    user: UserDocument,
    contest: ContestDocument,
    type: NotificationType,
  ): Promise<NotificationDocument> {
    // Create notification document
    const notification = await this.notificationModel.create({
      userId: user._id,
      contestId: contest._id,
      type,
      title: `Contest: ${contest.name}`,
      message: `${contest.name} starts in X hours`,
      channels: user.preferences.notificationChannels || ['email'],
      status: NotificationStatus.PENDING,
      deliveryStatus: [],
    });

    // Send via each channel
    const channels = user.preferences.notificationChannels || ['email'];
    
    for (const channel of channels) {
      const payload = {
        userId: user._id.toString(),
        contestId: contest._id.toString(),
        contestName: contest.name,
        platform: contest.platform,
        startTime: contest.startTime,
        hoursUntilStart: Math.floor((contest.startTime.getTime() - Date.now()) / (1000 * 60 * 60)),
      };

      let result: NotificationResult;
      
      if (channel === 'email') {
        result = await this.emailService.send(user.email, payload);
      } else if (channel === 'whatsapp') {
        result = await this.whatsappService.send(user.phoneNumber, payload);
      } else if (channel === 'push') {
        result = await this.pushService.send(user._id.toString(), payload);
      }

      // Update delivery status
      notification.deliveryStatus.push({
        channel,
        status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        sentAt: result.success ? new Date() : undefined,
        failedAt: result.success ? undefined : new Date(),
        error: result.error,
        retryCount: 0,
      });
    }

    // Update overall status
    const allSent = notification.deliveryStatus.every(d => d.status === NotificationStatus.SENT);
    const allFailed = notification.deliveryStatus.every(d => d.status === NotificationStatus.FAILED);
    
    notification.status = allSent ? NotificationStatus.SENT : 
                         allFailed ? NotificationStatus.FAILED : 
                         NotificationStatus.SENT; // Partial success
    
    if (allSent) notification.sentAt = new Date();
    if (allFailed) notification.failedAt = new Date();

    await notification.save();
    return notification;
  }
}
```

### Channel Services

Each channel has its own service implementing the same interface:

```typescript
export interface NotificationService {
  send(recipient: string, payload: NotificationPayload): Promise<NotificationResult>;
  healthCheck(): Promise<boolean>;
}

// Email Service
@Injectable()
export class EmailNotificationService implements NotificationService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(email: string, payload: NotificationPayload): Promise<NotificationResult> {
    try {
      await this.resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Upcoming: ${payload.contestName}`,
        html: this.generateEmailTemplate(payload),
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### Retry Logic

Failed notifications are automatically retried:

```typescript
async retryFailedNotification(notificationId: string): Promise<NotificationDocument> {
  const notification = await this.notificationModel.findById(notificationId);
  
  if (!notification || !notification.canRetry) {
    throw new Error('Cannot retry notification');
  }

  notification.status = NotificationStatus.RETRYING;
  notification.retryCount += 1;
  notification.lastRetryAt = new Date();
  
  // Retry failed channels
  for (const delivery of notification.deliveryStatus) {
    if (delivery.status === NotificationStatus.FAILED) {
      // Retry logic for each channel
      const result = await this.retryChannel(delivery.channel, notification);
      
      if (result.success) {
        delivery.status = NotificationStatus.SENT;
        delivery.sentAt = new Date();
        delivery.error = undefined;
      } else {
        delivery.retryCount += 1;
        delivery.lastRetryAt = new Date();
        delivery.error = result.error;
      }
    }
  }

  // Update overall status
  const allSent = notification.deliveryStatus.every(d => d.status === NotificationStatus.SENT);
  notification.status = allSent ? NotificationStatus.SENT : NotificationStatus.FAILED;
  
  await notification.save();
  return notification;
}
```

### Scheduler Integration

Notifications are triggered by the contest scheduler:

```typescript
@Injectable()
export class ContestSchedulerService {
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkUpcomingContests() {
    const contests = await this.findUpcomingContests();
    
    for (const contest of contests) {
      const users = await this.notificationsService.getUsersForNotification(contest);
      
      for (const user of users) {
        // Check if already notified
        const alreadyNotified = await this.wasNotificationSent(user._id, contest._id);
        
        if (!alreadyNotified) {
          await this.notificationsService.sendMultiChannelNotification(
            user,
            contest,
            NotificationType.CONTEST_REMINDER
          );
        }
      }
    }
  }
}
```

## Admin Email Operations

The system includes an `AdminEmailService` for bulk email operations:

### Features

1. **Custom Emails** - Send to specific email addresses
2. **Bulk Emails** - Send to users by ID (max 1000)
3. **Announcements** - Broadcast to all users with filters
4. **Contest Reminders** - Manual contest notifications

### Example: Send Announcement

```typescript
await adminEmailService.sendAnnouncement({
  subject: 'New Feature Released',
  title: 'Exciting Update',
  message: 'We have added support for AtCoder contests!',
  actionUrl: 'https://codenotify.dev/features',
  actionText: 'Learn More',
  filters: {
    platforms: ['atcoder'],  // Only users interested in AtCoder
    isActive: true
  }
});
```

## Database Indexes

Optimized indexes for query performance:

```typescript
// Compound indexes
{ userId: 1, createdAt: -1 }
{ userId: 1, status: 1 }
{ userId: 1, contestId: 1 } // unique, sparse
{ contestId: 1, createdAt: -1 }
{ status: 1, scheduledAt: 1 }
{ status: 1, nextRetryAt: 1 }
{ type: 1, createdAt: -1 }

// TTL index for auto-cleanup
{ expiresAt: 1 } // expireAfterSeconds: 0
```

## Configuration

### Environment Variables

```bash
# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@codenotify.dev

# WhatsApp (Optional)
WHATSAPP_API_KEY=your_key
WHATSAPP_PHONE_NUMBER=+1234567890

# Push Notifications (Optional)
PUSH_API_KEY=your_key
```

### Notification Expiration

Notifications automatically expire after 90 days (set in pre-save middleware):

```typescript
NotificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    this.expiresAt = ninetyDaysFromNow;
  }
  next();
});
```

## Best Practices

### ✅ Do

1. **Use database persistence** - All notifications stored in MongoDB
2. **Implement retry logic** - Max 3 retries with exponential backoff
3. **Track per-channel status** - Monitor delivery for each channel
4. **Check duplicate notifications** - Prevent sending within 12 hours
5. **Use pagination** - For notification history queries
6. **Monitor stats** - Track success rates and failures
7. **Cleanup old data** - Use TTL indexes or manual cleanup
8. **Test channels** - Use admin test endpoints before production

### ❌ Don't

1. **Don't skip duplicate checks** - Prevents notification spam
2. **Don't ignore retry limits** - Max 3 retries per notification
3. **Don't exceed bulk limits** - Max 1000 users per bulk operation
4. **Don't hardcode config** - Use environment variables
5. **Don't expose user data** - Protect email addresses and phone numbers

## Monitoring & Debugging

### Service Health Check

```bash
# Check all services
GET /notifications/health

# Check service status
GET /notifications/status
```

### Notification Stats

```bash
# Get overall stats
GET /notifications/notifications/stats

# Get user-specific stats
GET /notifications/notifications/stats?userId=123

# Get date range stats
GET /notifications/notifications/stats?startDate=2024-01-01&endDate=2024-01-31
```

### View Delivery Status

```typescript
{
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "SENT",
      "sentAt": "2024-02-16T12:35:00.000Z",
      "retryCount": 0
    },
    {
      "channel": "whatsapp",
      "status": "FAILED",
      "failedAt": "2024-02-16T12:35:05.000Z",
      "error": "Invalid phone number",
      "retryCount": 3
    }
  ]
}
```

## Troubleshooting

### Notifications Not Sent

**Check**:
1. User has `notificationChannels` configured
2. User's `notifyBefore` setting matches contest timing
3. Contest platform matches user preferences
4. Notification not already sent (duplicate check)
5. Service health status is healthy

### Email Delivery Failed

**Check**:
1. Valid `RESEND_API_KEY` in environment
2. `EMAIL_FROM` is configured
3. User email address is valid
4. Check Resend dashboard for delivery logs
5. Review `errorHistory` in notification document

### Retry Not Working

**Check**:
1. `retryCount` < `maxRetries` (3)
2. Notification status is `FAILED` or `RETRYING`
3. `canRetry` virtual field returns true
4. No blocking errors (e.g., invalid email)

### Database Issues

**Check**:
1. MongoDB connection is active
2. Indexes are created properly
3. TTL index is functioning for cleanup
4. No unique constraint violations

## Performance Optimization

### Batch Processing

Process notifications in batches to avoid overwhelming services:

```typescript
const BATCH_SIZE = 50;
for (let i = 0; i < users.length; i += BATCH_SIZE) {
  const batch = users.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(user => sendNotification(user, contest)));
}
```

### Query Optimization

Use indexes for efficient queries:

```typescript
// Good - uses compound index
await notificationModel.find({ userId, status: 'SENT' }).sort({ createdAt: -1 });

// Bad - full collection scan
await notificationModel.find({ message: /contest/ });
```

## Testing

### Test Individual Channels

```bash
# Test email
POST /notifications/test/email
{ "email": "test@example.com" }

# Test WhatsApp
POST /notifications/test/whatsapp
{ "phoneNumber": "+1234567890" }

# Test push
POST /notifications/test/push
{ "userId": "507f1f77bcf86cd799439011" }
```

### Test Bulk Operations

```bash
# Send to small group first
POST /notifications/emails/bulk
{
  "userIds": ["user1", "user2"],
  "subject": "Test",
  "html": "<p>Test message</p>"
}
```

## Related Documentation

- [Notifications API](/api/notifications)
- [User Preferences](/api/users/profile)
- [Error Handling](/api/errors)
- [Rate Limiting](/api/rate-limiting)
