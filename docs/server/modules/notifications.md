# Notifications Module

Comprehensive multi-channel notification system for contest alerts and system announcements.

## Overview

The Notifications module handles all notification delivery across multiple channels (Email, WhatsApp, Push) with support for scheduling, retry logic, and delivery tracking.

## Location

```
Server/src/notifications/
├── notifications.module.ts          # Module configuration
├── notifications.controller.ts      # REST API endpoints
├── notifications.service.ts         # Core notification orchestration
├── schemas/
│   └── notification.schema.ts       # Notification MongoDB schema
├── dto/
│   ├── notification.dto.ts          # Query and response DTOs
│   └── email.dto.ts                 # Email-specific DTOs
└── services/
    ├── email-notification.service.ts      # Email delivery
    ├── whatsapp-notification.service.ts   # WhatsApp delivery
    ├── push-notification.service.ts       # Push notification delivery
    └── admin-email.service.ts             # Admin email operations
```

## Module Configuration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [
    NotificationsService,
    EmailNotificationService,
    WhatsAppNotificationService,
    PushNotificationService,
    AdminEmailService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

## Notification Schema

### Enums

#### NotificationStatus
```typescript
enum NotificationStatus {
  PENDING = 'PENDING',      // Queued for delivery
  SENT = 'SENT',           // Successfully delivered
  FAILED = 'FAILED',       // Delivery failed
  RETRYING = 'RETRYING',   // Retry in progress
}
```

#### NotificationChannel
```typescript
enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}
```

#### NotificationType
```typescript
enum NotificationType {
  CONTEST_REMINDER = 'CONTEST_REMINDER',    // Upcoming contest alert
  CONTEST_STARTING = 'CONTEST_STARTING',    // Contest starting now
  CONTEST_ENDING = 'CONTEST_ENDING',        // Contest ending soon
  SYSTEM_ALERT = 'SYSTEM_ALERT',           // System announcements
}
```

### Schema Structure

```typescript
{
  // References
  userId: ObjectId,              // User reference (indexed)
  contestId?: ObjectId,          // Contest reference (optional, indexed)
  
  // Notification metadata
  type: NotificationType,        // Type of notification (indexed)
  title: string,                 // Notification title
  message: string,               // Notification message
  payload?: Record<string, any>, // Flexible payload data
  
  // Delivery information
  channels: NotificationChannel[],           // Target channels
  deliveryStatus: ChannelDeliveryStatus[],   // Per-channel status
  status: NotificationStatus,                // Overall status (indexed)
  
  // Timing
  scheduledAt?: Date,            // When to send (indexed)
  sentAt?: Date,                 // When sent (indexed)
  failedAt?: Date,               // When failed
  
  // Retry logic
  retryCount: number,            // Current retry count (default: 0)
  maxRetries: number,            // Max retries allowed (default: 3)
  lastRetryAt?: Date,            // Last retry timestamp
  nextRetryAt?: Date,            // Next retry scheduled (indexed)
  
  // Error tracking
  error?: string,                // Latest error message
  errorHistory: Array<{          // Full error history
    timestamp: Date,
    error: string,
    channel?: NotificationChannel,
  }>,
  
  // User interaction
  isRead: boolean,               // Read status (default: false)
  readAt?: Date,                 // When marked as read
  
  // Metadata
  isActive: boolean,             // Active status (default: true, indexed)
  expiresAt?: Date,              // Auto-cleanup date (indexed, TTL)
  
  // Timestamps
  createdAt: Date,               // Auto-generated
  updatedAt: Date,               // Auto-generated
}
```

### Channel Delivery Status

```typescript
interface ChannelDeliveryStatus {
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  failedAt?: Date;
  error?: string;
  retryCount: number;
  lastRetryAt?: Date;
}
```

### Virtual Fields

```typescript
isDelivered: boolean           // status === SENT
isFailed: boolean              // status === FAILED
isPending: boolean             // status === PENDING
canRetry: boolean              // retryCount < maxRetries && (FAILED || RETRYING)
successfulChannels: string[]   // Channels with SENT status
failedChannels: string[]       // Channels with FAILED status
```

### Indexes

```typescript
// Compound indexes for performance
{ userId: 1, createdAt: -1 }
{ userId: 1, status: 1 }
{ userId: 1, contestId: 1 } (unique, sparse)
{ contestId: 1, createdAt: -1 }
{ status: 1, scheduledAt: 1 }
{ status: 1, nextRetryAt: 1 }
{ type: 1, createdAt: -1 }
{ expiresAt: 1 } (TTL index for auto-cleanup)
```

## Core Services

### NotificationsService

Main orchestration service for notification delivery.

#### Key Methods

**sendNotification()**
```typescript
async sendNotification(
  userId: string,
  contestId: string,
  type: NotificationType,
  channels: NotificationChannel[]
): Promise<Notification>
```
Creates and sends notification across specified channels.

**getNotificationHistory()**
```typescript
async getNotificationHistory(
  userId: string,
  options: {
    page: number;
    limit: number;
    status?: NotificationStatus;
    type?: NotificationType;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PaginatedNotificationsResponseDto>
```
Retrieves paginated notification history with filters.

**markNotificationAsRead()**
```typescript
async markNotificationAsRead(id: string): Promise<Notification>
```
Marks a notification as read.

**markAllNotificationsAsRead()**
```typescript
async markAllNotificationsAsRead(userId: string): Promise<{ modifiedCount: number }>
```
Marks all notifications as read for a user.

**retryFailedNotification()**
```typescript
async retryFailedNotification(id: string): Promise<Notification>
```
Retries a failed notification if retry count allows.

**getNotificationStats()**
```typescript
async getNotificationStats(
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<NotificationStatsResponseDto>
```
Returns notification statistics.

**cleanupOldNotifications()**
```typescript
async cleanupOldNotifications(daysOld: number = 90): Promise<{ deletedCount: number }>
```
Removes notifications older than specified days.

**healthCheckAll()**
```typescript
async healthCheckAll(): Promise<{
  email: { status: string; configured: boolean };
  whatsapp: { status: string; configured: boolean };
  push: { status: string; configured: boolean };
}>
```
Checks health of all notification services.

### EmailNotificationService

Handles email delivery using Nodemailer.

#### Methods

**send()**
```typescript
async send(
  email: string,
  payload: {
    userId: string;
    contestId: string;
    contestName: string;
    platform: string;
    startTime: Date;
    hoursUntilStart: number;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }>
```

**Features:**
- HTML email templates
- Contest reminder formatting
- Error handling and logging
- SMTP configuration

### WhatsAppNotificationService

Handles WhatsApp message delivery (stub implementation).

#### Methods

**send()**
```typescript
async send(
  phoneNumber: string,
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }>
```

**Note:** Currently a stub implementation. Requires WhatsApp Business API integration.

### PushNotificationService

Handles push notification delivery (stub implementation).

#### Methods

**send()**
```typescript
async send(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }>
```

**Note:** Currently a stub implementation. Requires Firebase Cloud Messaging or similar.

### AdminEmailService

Admin-specific email operations for bulk and custom emails.

#### Methods

**sendCustomEmail()**
```typescript
async sendCustomEmail(dto: SendCustomEmailDto): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}>
```
Send custom HTML email to specific addresses.

**sendBulkEmail()**
```typescript
async sendBulkEmail(dto: SendBulkEmailDto): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{ userId: string; email: string; success: boolean; error?: string }>;
}>
```
Send bulk email to users by IDs.

**sendAnnouncement()**
```typescript
async sendAnnouncement(dto: SendAnnouncementDto): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  totalUsers: number;
}>
```
Send announcement to all users or filtered subset.

**sendContestReminder()**
```typescript
async sendContestReminder(dto: SendContestReminderDto): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{ userId: string; success: boolean; error?: string }>;
}>
```
Send contest reminder to specific users.

## API Endpoints

### Test Endpoints (Admin Only)

#### POST /notifications/test/email
Test email delivery.

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123",
  "message": "Test email sent to test@example.com",
  "payload": { ... }
}
```

#### POST /notifications/test/whatsapp
Test WhatsApp delivery.

**Request:**
```json
{
  "phoneNumber": "+1234567890"
}
```

#### POST /notifications/test/push
Test push notification delivery.

**Request:**
```json
{
  "userId": "user-id"
}
```

### Status Endpoints

#### GET /notifications/status
Get service status for all channels.

**Response:**
```json
{
  "email": { "enabled": true, "configured": true },
  "whatsapp": { "enabled": false, "configured": false },
  "push": { "enabled": false, "configured": false }
}
```

#### GET /notifications/health
Health check for all notification services.

**Response:**
```json
{
  "email": { "status": "healthy", "configured": true },
  "whatsapp": { "status": "not_configured", "configured": false },
  "push": { "status": "not_configured", "configured": false }
}
```

### Email Endpoints (Admin Only)

#### POST /notifications/emails/custom
Send custom email to specific addresses.

**Request:**
```json
{
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Important Update",
  "html": "<h1>Hello</h1><p>This is a test</p>",
  "text": "Hello, This is a test",
  "replyTo": "support@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [
    { "email": "user1@example.com", "success": true },
    { "email": "user2@example.com", "success": true }
  ]
}
```

#### POST /notifications/emails/bulk
Send bulk email to users by IDs.

**Request:**
```json
{
  "userIds": ["user1", "user2", "user3"],
  "subject": "Contest Alert",
  "html": "<h1>New Contest Available</h1>",
  "text": "New Contest Available"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "results": [
    { "userId": "user1", "email": "user1@example.com", "success": true },
    { "userId": "user2", "email": "user2@example.com", "success": true },
    { "userId": "user3", "email": "user3@example.com", "success": true }
  ]
}
```

#### POST /notifications/emails/announcement
Send announcement to all or filtered users.

**Request:**
```json
{
  "subject": "Platform Maintenance",
  "title": "Scheduled Maintenance",
  "message": "We will be performing maintenance on...",
  "actionUrl": "https://example.com/status",
  "actionText": "View Status",
  "filters": {
    "platforms": ["codeforces", "leetcode"],
    "isActive": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "sent": 150,
  "failed": 2,
  "totalUsers": 152
}
```

#### POST /notifications/emails/contest-reminder
Send contest reminder to specific users.

**Request:**
```json
{
  "contestId": "contest-id",
  "userIds": ["user1", "user2"],
  "customMessage": "Don't forget to register!"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [
    { "userId": "user1", "success": true },
    { "userId": "user2", "success": true }
  ]
}
```

### Notification History Endpoints

#### GET /notifications/notifications
Get notification history with filters.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `contestId` (optional) - Filter by contest ID
- `status` (optional) - Filter by status (PENDING, SENT, FAILED, RETRYING)
- `type` (optional) - Filter by type
- `channel` (optional) - Filter by channel
- `isRead` (optional) - Filter by read status
- `startDate` (optional) - Filter by start date (ISO 8601)
- `endDate` (optional) - Filter by end date (ISO 8601)
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `sortBy` (default: createdAt) - Sort field
- `sortOrder` (default: desc) - Sort order

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-id",
      "userId": "user-id",
      "contestId": "contest-id",
      "type": "CONTEST_REMINDER",
      "title": "Contest Starting Soon",
      "message": "Codeforces Round #900 starts in 2 hours",
      "channels": ["email", "push"],
      "status": "SENT",
      "deliveryStatus": [
        {
          "channel": "email",
          "status": "SENT",
          "sentAt": "2024-02-15T10:00:00Z",
          "retryCount": 0
        }
      ],
      "isRead": false,
      "createdAt": "2024-02-15T08:00:00Z",
      "updatedAt": "2024-02-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### GET /notifications/notifications/:id
Get notification by ID.

**Response:**
```json
{
  "id": "notification-id",
  "userId": "user-id",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "...",
  "status": "SENT",
  "createdAt": "2024-02-15T08:00:00Z"
}
```

#### PATCH /notifications/notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "notification-id",
    "isRead": true,
    "readAt": "2024-02-15T12:00:00Z"
  }
}
```

#### PATCH /notifications/notifications/user/:userId/read-all
Mark all notifications as read for a user.

**Response:**
```json
{
  "success": true,
  "modifiedCount": 15
}
```

#### GET /notifications/notifications/stats
Get notification statistics.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)

**Response:**
```json
{
  "total": 1000,
  "sent": 950,
  "failed": 30,
  "pending": 20,
  "byChannel": {
    "email": 800,
    "whatsapp": 100,
    "push": 100
  },
  "byType": {
    "CONTEST_REMINDER": 700,
    "CONTEST_STARTING": 200,
    "CONTEST_ENDING": 50,
    "SYSTEM_ALERT": 50
  },
  "successRate": 95.0,
  "averageDeliveryTime": 1500
}
```

#### POST /notifications/notifications/:id/retry
Retry failed notification.

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "notification-id",
    "status": "RETRYING",
    "retryCount": 1
  }
}
```

#### DELETE /notifications/notifications/cleanup
Cleanup old notifications.

**Query Parameters:**
- `daysOld` (default: 90) - Delete notifications older than this many days

**Response:**
```json
{
  "success": true,
  "deletedCount": 150
}
```

## DTOs

### NotificationQueryDto

```typescript
{
  userId?: string;
  contestId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  channel?: NotificationChannel;
  isRead?: boolean;
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
  page: number;        // default: 1
  limit: number;       // default: 20
  sortBy: 'createdAt' | 'sentAt' | 'scheduledAt';  // default: 'createdAt'
  sortOrder: 'asc' | 'desc';  // default: 'desc'
}
```

### SendCustomEmailDto

```typescript
{
  to: string | string[];  // Email address(es)
  subject: string;        // 1-200 chars
  html: string;           // HTML content
  text?: string;          // Plain text (optional)
  replyTo?: string;       // Reply-to address (optional)
}
```

### SendBulkEmailDto

```typescript
{
  userIds: string[];      // 1-1000 user IDs
  subject: string;        // 1-200 chars
  html: string;           // HTML content
  text?: string;          // Plain text (optional)
}
```

### SendAnnouncementDto

```typescript
{
  subject: string;        // 1-200 chars
  title: string;          // 1-100 chars
  message: string;        // Announcement message
  actionUrl?: string;     // Optional action URL
  actionText?: string;    // Optional action button text
  filters?: {
    platforms?: string[];  // Filter by platforms
    isActive?: boolean;    // Filter by active status
  };
}
```

### SendContestReminderDto

```typescript
{
  contestId: string;
  userIds: string[];      // 1-1000 user IDs
  customMessage?: string; // Optional custom message
}
```

## Configuration

### Environment Variables

```bash
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=CodeNotify <noreply@codenotify.com>

# WhatsApp Configuration (Future)
WHATSAPP_API_KEY=your-api-key
WHATSAPP_PHONE_NUMBER=+1234567890

# Push Notification Configuration (Future)
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-project-id
```

## Notification Flow

### Contest Reminder Flow

```
1. Scheduler checks for upcoming contests (every 30 minutes)
2. For each contest, find users who:
   - Have the platform enabled in preferences
   - Match the notifyBefore time window
   - Haven't been notified yet for this contest
3. For each eligible user:
   - Create Notification document with PENDING status
   - Get user's enabled channels from preferences
   - Send notification to each channel:
     a. Email: EmailNotificationService.send()
     b. WhatsApp: WhatsAppNotificationService.send()
     c. Push: PushNotificationService.send()
   - Update deliveryStatus for each channel
4. Update overall notification status:
   - SENT if all channels succeeded
   - FAILED if all channels failed
   - SENT if at least one channel succeeded
5. Log results and errors
```

### Retry Logic

```
1. Failed notifications are marked with FAILED status
2. Retry job runs periodically (e.g., every hour)
3. For each FAILED notification:
   - Check if retryCount < maxRetries
   - Check if nextRetryAt <= now
   - Attempt redelivery on failed channels
   - Increment retryCount
   - Update status and deliveryStatus
4. If max retries reached, mark as permanently FAILED
```

## Best Practices

### ✅ Do

1. **Use appropriate channels** - Respect user preferences
2. **Handle failures gracefully** - Implement retry logic
3. **Log all operations** - Track delivery success/failure
4. **Clean up old data** - Run periodic cleanup jobs
5. **Test thoroughly** - Use test endpoints before production
6. **Monitor delivery rates** - Track success/failure metrics
7. **Respect rate limits** - Implement throttling for bulk operations

### ❌ Don't

1. **Don't spam users** - Respect notification preferences
2. **Don't ignore errors** - Log and handle all failures
3. **Don't send without validation** - Validate all DTOs
4. **Don't skip retry logic** - Implement proper retry mechanisms
5. **Don't hardcode templates** - Use configurable templates
6. **Don't expose sensitive data** - Sanitize error messages

## Testing

### Unit Tests

```typescript
describe('NotificationsService', () => {
  it('should create notification with correct channels', async () => {
    const notification = await service.sendNotification(
      'user-id',
      'contest-id',
      NotificationType.CONTEST_REMINDER,
      [NotificationChannel.EMAIL]
    );
    expect(notification.channels).toContain(NotificationChannel.EMAIL);
  });

  it('should mark notification as read', async () => {
    const notification = await service.markNotificationAsRead('notification-id');
    expect(notification.isRead).toBe(true);
    expect(notification.readAt).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('NotificationsController (e2e)', () => {
  it('POST /notifications/test/email should send test email', () => {
    return request(app.getHttpServer())
      .post('/notifications/test/email')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'test@example.com' })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });
});
```

## Monitoring

### Key Metrics

- **Delivery Success Rate**: `(sent / total) * 100`
- **Channel Performance**: Success rate per channel
- **Average Delivery Time**: Time from creation to delivery
- **Retry Rate**: `(retried / failed) * 100`
- **Failure Reasons**: Common error patterns

### Health Checks

```bash
# Check service status
curl http://localhost:3000/notifications/status

# Check service health
curl http://localhost:3000/notifications/health

# Get statistics
curl http://localhost:3000/notifications/notifications/stats
```

## Troubleshooting

### Email Not Sending

**Symptoms:** Email notifications fail with SMTP errors

**Solutions:**
1. Verify SMTP credentials in `.env`
2. Check SMTP host and port
3. Enable "Less secure app access" for Gmail
4. Use app-specific password for Gmail
5. Check firewall/network settings

### High Failure Rate

**Symptoms:** Many notifications marked as FAILED

**Solutions:**
1. Check service health endpoints
2. Review error logs for patterns
3. Verify external service credentials
4. Check rate limits
5. Implement exponential backoff

### Notifications Not Received

**Symptoms:** Users not receiving notifications

**Solutions:**
1. Check user preferences (channels enabled)
2. Verify notifyBefore time window
3. Check notification history for user
4. Verify contest sync is working
5. Check spam folders for emails

## Related Documentation

- [Notifications API](/api/notifications)
- [User Preferences](/api/users/update-profile)
- [Contest Scheduler](/server/scheduler)
- [Email Templates](/guide/notifications)
