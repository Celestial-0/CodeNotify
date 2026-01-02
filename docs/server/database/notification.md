# Notification Schema

MongoDB schema for notification tracking, delivery status, and multi-channel notification history.

## Overview

The Notification schema stores all notification records including delivery status across multiple channels (Email, WhatsApp, Push), retry logic, and user interaction tracking.

## Location

```
Server/src/notifications/schemas/notification.schema.ts
```

## Schema Definition

### TypeScript Interface

```typescript
interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  contestId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
  channels: NotificationChannel[];
  deliveryStatus: ChannelDeliveryStatus[];
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  nextRetryAt?: Date;
  error?: string;
  errorHistory?: Array<{
    timestamp: Date;
    error: string;
    channel?: NotificationChannel;
  }>;
  isRead: boolean;
  readAt?: Date;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  isDelivered: boolean;
  isFailed: boolean;
  isPending: boolean;
  canRetry: boolean;
  successfulChannels: NotificationChannel[];
  failedChannels: NotificationChannel[];
}
```

### Mongoose Schema

```typescript
@Schema({ timestamps: true })
export class Notification {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    
    ,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Contest', index: true })
  contestId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: NotificationType, index: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  payload?: Record<string, any>;

  @Prop({ type: [String], enum: NotificationChannel, required: true })
  channels: NotificationChannel[];

  @Prop({ type: Array, default: [] })
  deliveryStatus: ChannelDeliveryStatus[];

  @Prop({
    required: true,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    index: true,
  })
  status: NotificationStatus;

  // ... other fields
}
```

## Enums

### NotificationStatus

```typescript
enum NotificationStatus {
  PENDING = 'PENDING',      // Queued for delivery
  SENT = 'SENT',           // Successfully delivered
  FAILED = 'FAILED',       // Delivery failed
  RETRYING = 'RETRYING',   // Retry in progress
}
```

**Lifecycle:**
1. `PENDING` - Created, waiting for delivery
2. `SENT` - Successfully delivered to all channels
3. `FAILED` - Failed on all channels
4. `RETRYING` - Attempting retry after failure

### NotificationChannel

```typescript
enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}
```

**Supported Channels:**
- `email` - Email notifications (✅ Implemented)
- `whatsapp` - WhatsApp messages (🚧 Stub)
- `push` - Push notifications (🚧 Stub)

### NotificationType

```typescript
enum NotificationType {
  CONTEST_REMINDER = 'CONTEST_REMINDER',    // Upcoming contest alert
  CONTEST_STARTING = 'CONTEST_STARTING',    // Contest starting now
  CONTEST_ENDING = 'CONTEST_ENDING',        // Contest ending soon
  SYSTEM_ALERT = 'SYSTEM_ALERT',           // System announcements
}
```

**Types:**
- `CONTEST_REMINDER` - Sent X hours before contest (based on user preference)
- `CONTEST_STARTING` - Sent when contest is about to start
- `CONTEST_ENDING` - Sent when contest is about to end
- `SYSTEM_ALERT` - Admin announcements and system messages

## Fields

### Required Fields

#### userId
- **Type:** `ObjectId`
- **Required:** Yes
- **Indexed:** Yes
- **Reference:** `User` collection
- **Description:** User receiving the notification

#### type
- **Type:** `NotificationType` (enum)
- **Required:** Yes
- **Indexed:** Yes
- **Description:** Type of notification

#### title
- **Type:** `String`
- **Required:** Yes
- **Description:** Notification title/subject
- **Example:** `"Contest Starting Soon"`

#### message
- **Type:** `String`
- **Required:** Yes
- **Description:** Notification message body
- **Example:** `"Codeforces Round #900 starts in 2 hours"`

#### channels
- **Type:** `Array<NotificationChannel>`
- **Required:** Yes
- **Description:** Target delivery channels
- **Example:** `['email', 'push']`

#### status
- **Type:** `NotificationStatus` (enum)
- **Required:** Yes
- **Default:** `PENDING`
- **Indexed:** Yes
- **Description:** Overall notification status

### Optional Fields

#### contestId
- **Type:** `ObjectId`
- **Required:** No
- **Indexed:** Yes
- **Reference:** `Contest` collection
- **Description:** Related contest (for contest notifications)

#### payload
- **Type:** `Object` (flexible)
- **Required:** No
- **Description:** Additional notification data
- **Example:**
  ```json
  {
    "contestName": "Codeforces Round #900",
    "platform": "codeforces",
    "startTime": "2024-02-20T14:35:00Z",
    "hoursUntilStart": 2
  }
  ```

#### deliveryStatus
- **Type:** `Array<ChannelDeliveryStatus>`
- **Default:** `[]`
- **Description:** Per-channel delivery tracking
- **See:** [Channel Delivery Status](#channel-delivery-status)

#### scheduledAt
- **Type:** `Date`
- **Required:** No
- **Indexed:** Yes
- **Description:** When notification should be sent

#### sentAt
- **Type:** `Date`
- **Required:** No
- **Indexed:** Yes
- **Description:** When notification was successfully sent

#### failedAt
- **Type:** `Date`
- **Required:** No
- **Description:** When notification failed

### Retry Fields

#### retryCount
- **Type:** `Number`
- **Default:** `0`
- **Description:** Number of retry attempts made

#### maxRetries
- **Type:** `Number`
- **Default:** `3`
- **Description:** Maximum retry attempts allowed

#### lastRetryAt
- **Type:** `Date`
- **Required:** No
- **Description:** Timestamp of last retry attempt

#### nextRetryAt
- **Type:** `Date`
- **Required:** No
- **Indexed:** Yes
- **Description:** When next retry should occur

### Error Tracking

#### error
- **Type:** `String`
- **Required:** No
- **Description:** Latest error message

#### errorHistory
- **Type:** `Array<ErrorRecord>`
- **Default:** `[]`
- **Description:** Complete error history
- **Structure:**
  ```typescript
  {
    timestamp: Date;
    error: string;
    channel?: NotificationChannel;
  }
  ```

### User Interaction

#### isRead
- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Whether user has read the notification

#### readAt
- **Type:** `Date`
- **Required:** No
- **Description:** When user marked as read

### System Fields

#### isActive
- **Type:** `Boolean`
- **Default:** `true`
- **Indexed:** Yes
- **Description:** Active status (soft delete)

#### expiresAt
- **Type:** `Date`
- **Required:** No
- **Indexed:** Yes (TTL)
- **Description:** Auto-cleanup date
- **Default:** 90 days from creation
- **Behavior:** MongoDB automatically deletes when date is reached

#### createdAt
- **Type:** `Date`
- **Auto-generated:** Yes
- **Description:** Creation timestamp

#### updatedAt
- **Type:** `Date`
- **Auto-generated:** Yes
- **Description:** Last update timestamp

## Channel Delivery Status

Per-channel delivery tracking structure.

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

### Fields

- **channel**: Which channel (email, whatsapp, push)
- **status**: Delivery status for this channel
- **sentAt**: When successfully sent on this channel
- **failedAt**: When failed on this channel
- **error**: Error message for this channel
- **retryCount**: Retry attempts for this channel
- **lastRetryAt**: Last retry timestamp for this channel

### Example

```json
[
  {
    "channel": "email",
    "status": "SENT",
    "sentAt": "2024-02-15T10:00:00Z",
    "retryCount": 0
  },
  {
    "channel": "push",
    "status": "FAILED",
    "failedAt": "2024-02-15T10:00:05Z",
    "error": "FCM token not found",
    "retryCount": 2,
    "lastRetryAt": "2024-02-15T10:05:00Z"
  }
]
```

## Virtual Fields

### isDelivered
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Notification successfully delivered
- **Calculation:** `status === SENT`

### isFailed
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Notification failed
- **Calculation:** `status === FAILED`

### isPending
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Notification pending delivery
- **Calculation:** `status === PENDING`

### canRetry
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Notification can be retried
- **Calculation:** `retryCount < maxRetries && (status === FAILED || status === RETRYING)`

### successfulChannels
- **Type:** `Array<NotificationChannel>`
- **Virtual:** Yes
- **Description:** Channels with successful delivery
- **Calculation:** Filter `deliveryStatus` where `status === SENT`

### failedChannels
- **Type:** `Array<NotificationChannel>`
- **Virtual:** Yes
- **Description:** Channels with failed delivery
- **Calculation:** Filter `deliveryStatus` where `status === FAILED`

## Indexes

### Single Field Indexes

```typescript
{ userId: 1 }           // Find user notifications
{ contestId: 1 }        // Find contest notifications
{ type: 1 }             // Filter by type
{ status: 1 }           // Filter by status
{ scheduledAt: 1 }      // Scheduled notifications
{ isActive: 1 }         // Active notifications
```

### Compound Indexes

```typescript
{ userId: 1, createdAt: -1 }              // User notification history
{ userId: 1, status: 1 }                  // User notifications by status
{ userId: 1, contestId: 1 }               // User-contest notification (unique, sparse)
{ contestId: 1, createdAt: -1 }           // Contest notification history
{ status: 1, scheduledAt: 1 }             // Pending scheduled notifications
{ status: 1, nextRetryAt: 1 }             // Retry queue
```

### Unique Compound Index

```typescript
{ userId: 1, contestId: 1 } // Unique, Sparse
```

**Purpose:** Prevent duplicate notifications per user per contest

**Sparse:** Allows multiple notifications with null `contestId`

### TTL Index

```typescript
{ expiresAt: 1 } // expireAfterSeconds: 0
```

**Purpose:** Automatic cleanup of old notifications

**Behavior:** MongoDB deletes documents when `expiresAt` date is reached

## Example Documents

### Contest Reminder (Pending)

```json
{
  "_id": "65c1234567890abcdef12345",
  "userId": "65c1111111111111111111111",
  "contestId": "65c2222222222222222222222",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "Codeforces Round #900 (Div. 2) starts in 2 hours",
  "payload": {
    "contestName": "Codeforces Round #900 (Div. 2)",
    "platform": "codeforces",
    "startTime": "2024-02-20T14:35:00Z",
    "hoursUntilStart": 2
  },
  "channels": ["email", "push"],
  "deliveryStatus": [],
  "status": "PENDING",
  "scheduledAt": "2024-02-20T12:35:00Z",
  "retryCount": 0,
  "maxRetries": 3,
  "isRead": false,
  "isActive": true,
  "expiresAt": "2024-05-20T12:35:00Z",
  "createdAt": "2024-02-20T12:30:00Z",
  "updatedAt": "2024-02-20T12:30:00Z"
}
```

### Contest Reminder (Sent)

```json
{
  "_id": "65c1234567890abcdef12346",
  "userId": "65c1111111111111111111111",
  "contestId": "65c2222222222222222222222",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "LeetCode Weekly Contest 380 starts in 1 hour",
  "payload": {
    "contestName": "Weekly Contest 380",
    "platform": "leetcode",
    "startTime": "2024-02-18T02:30:00Z",
    "hoursUntilStart": 1
  },
  "channels": ["email"],
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "SENT",
      "sentAt": "2024-02-18T01:30:00Z",
      "retryCount": 0
    }
  ],
  "status": "SENT",
  "scheduledAt": "2024-02-18T01:30:00Z",
  "sentAt": "2024-02-18T01:30:05Z",
  "retryCount": 0,
  "maxRetries": 3,
  "isRead": true,
  "readAt": "2024-02-18T02:00:00Z",
  "isActive": true,
  "expiresAt": "2024-05-18T01:30:00Z",
  "createdAt": "2024-02-18T01:25:00Z",
  "updatedAt": "2024-02-18T02:00:00Z"
}
```

### Contest Reminder (Failed with Retry)

```json
{
  "_id": "65c1234567890abcdef12347",
  "userId": "65c1111111111111111111111",
  "contestId": "65c2222222222222222222222",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "CodeChef Starters 120 starts in 3 hours",
  "payload": {
    "contestName": "Starters 120",
    "platform": "codechef",
    "startTime": "2024-02-21T14:30:00Z",
    "hoursUntilStart": 3
  },
  "channels": ["email", "whatsapp"],
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "SENT",
      "sentAt": "2024-02-21T11:30:00Z",
      "retryCount": 0
    },
    {
      "channel": "whatsapp",
      "status": "FAILED",
      "failedAt": "2024-02-21T11:30:05Z",
      "error": "WhatsApp service not configured",
      "retryCount": 2,
      "lastRetryAt": "2024-02-21T11:35:00Z"
    }
  ],
  "status": "SENT",
  "scheduledAt": "2024-02-21T11:30:00Z",
  "sentAt": "2024-02-21T11:30:00Z",
  "retryCount": 2,
  "maxRetries": 3,
  "lastRetryAt": "2024-02-21T11:35:00Z",
  "nextRetryAt": "2024-02-21T11:40:00Z",
  "error": "Partial failure: whatsapp failed",
  "errorHistory": [
    {
      "timestamp": "2024-02-21T11:30:05Z",
      "error": "WhatsApp service not configured",
      "channel": "whatsapp"
    },
    {
      "timestamp": "2024-02-21T11:35:00Z",
      "error": "WhatsApp service not configured",
      "channel": "whatsapp"
    }
  ],
  "isRead": false,
  "isActive": true,
  "expiresAt": "2024-05-21T11:30:00Z",
  "createdAt": "2024-02-21T11:25:00Z",
  "updatedAt": "2024-02-21T11:35:00Z"
}
```

### System Alert

```json
{
  "_id": "65c1234567890abcdef12348",
  "userId": "65c1111111111111111111111",
  "type": "SYSTEM_ALERT",
  "title": "Platform Maintenance",
  "message": "CodeNotify will undergo maintenance on Feb 25, 2024 from 2:00 AM to 4:00 AM UTC",
  "payload": {
    "maintenanceStart": "2024-02-25T02:00:00Z",
    "maintenanceEnd": "2024-02-25T04:00:00Z",
    "affectedServices": ["sync", "notifications"]
  },
  "channels": ["email"],
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "SENT",
      "sentAt": "2024-02-20T10:00:00Z",
      "retryCount": 0
    }
  ],
  "status": "SENT",
  "sentAt": "2024-02-20T10:00:00Z",
  "retryCount": 0,
  "maxRetries": 3,
  "isRead": false,
  "isActive": true,
  "expiresAt": "2024-05-20T10:00:00Z",
  "createdAt": "2024-02-20T09:55:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

## Common Queries

### Find User Notifications

```typescript
const notifications = await this.notificationModel
  .find({ userId: ObjectId(userId), isActive: true })
  .sort({ createdAt: -1 })
  .limit(20);
```

### Find Unread Notifications

```typescript
const unreadNotifications = await this.notificationModel.find({
  userId: ObjectId(userId),
  isRead: false,
  isActive: true
});
```

### Find Failed Notifications

```typescript
const failedNotifications = await this.notificationModel.find({
  status: NotificationStatus.FAILED,
  retryCount: { $lt: 3 }
});
```

### Find Notifications Ready for Retry

```typescript
const now = new Date();
const retryQueue = await this.notificationModel.find({
  status: { $in: [NotificationStatus.FAILED, NotificationStatus.RETRYING] },
  nextRetryAt: { $lte: now },
  retryCount: { $lt: 3 }
});
```

### Find Pending Scheduled Notifications

```typescript
const now = new Date();
const pendingNotifications = await this.notificationModel.find({
  status: NotificationStatus.PENDING,
  scheduledAt: { $lte: now }
});
```

### Mark as Read

```typescript
await this.notificationModel.findByIdAndUpdate(
  notificationId,
  {
    $set: {
      isRead: true,
      readAt: new Date()
    }
  },
  { new: true }
);
```

### Mark All as Read for User

```typescript
await this.notificationModel.updateMany(
  { userId: ObjectId(userId), isRead: false },
  {
    $set: {
      isRead: true,
      readAt: new Date()
    }
  }
);
```

### Get Notification Statistics

```typescript
const stats = await this.notificationModel.aggregate([
  { $match: { userId: ObjectId(userId) } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);
```

## Notification Lifecycle

### 1. Creation

```typescript
const notification = await this.notificationModel.create({
  userId: user._id,
  contestId: contest._id,
  type: NotificationType.CONTEST_REMINDER,
  title: 'Contest Starting Soon',
  message: `${contest.name} starts in ${hoursUntilStart} hours`,
  payload: { /* ... */ },
  channels: user.preferences.notificationChannels,
  status: NotificationStatus.PENDING,
  scheduledAt: new Date(),
  retryCount: 0,
  maxRetries: 3,
  isRead: false,
  isActive: true
});
```

### 2. Delivery Attempt

```typescript
// Send to each channel
for (const channel of notification.channels) {
  const result = await this.sendToChannel(channel, notification);
  
  notification.deliveryStatus.push({
    channel,
    status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
    sentAt: result.success ? new Date() : undefined,
    failedAt: result.success ? undefined : new Date(),
    error: result.error,
    retryCount: 0
  });
}

// Update overall status
const allSent = notification.deliveryStatus.every(d => d.status === NotificationStatus.SENT);
const allFailed = notification.deliveryStatus.every(d => d.status === NotificationStatus.FAILED);

notification.status = allSent ? NotificationStatus.SENT :
                      allFailed ? NotificationStatus.FAILED :
                      NotificationStatus.SENT; // Partial success

if (allSent) {
  notification.sentAt = new Date();
} else if (allFailed) {
  notification.failedAt = new Date();
  notification.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 min
}

await notification.save();
```

### 3. Retry (if failed)

```typescript
if (notification.canRetry) {
  notification.status = NotificationStatus.RETRYING;
  notification.retryCount++;
  notification.lastRetryAt = new Date();
  
  // Retry failed channels only
  const failedChannels = notification.deliveryStatus
    .filter(d => d.status === NotificationStatus.FAILED);
  
  for (const channelStatus of failedChannels) {
    const result = await this.sendToChannel(channelStatus.channel, notification);
    
    if (result.success) {
      channelStatus.status = NotificationStatus.SENT;
      channelStatus.sentAt = new Date();
    } else {
      channelStatus.retryCount++;
      channelStatus.lastRetryAt = new Date();
      channelStatus.error = result.error;
      
      notification.errorHistory.push({
        timestamp: new Date(),
        error: result.error,
        channel: channelStatus.channel
      });
    }
  }
  
  // Update overall status
  const allSent = notification.deliveryStatus.every(d => d.status === NotificationStatus.SENT);
  notification.status = allSent ? NotificationStatus.SENT : NotificationStatus.FAILED;
  
  if (!allSent && notification.retryCount < notification.maxRetries) {
    notification.nextRetryAt = new Date(Date.now() + 10 * 60 * 1000); // Retry in 10 min
  }
  
  await notification.save();
}
```

### 4. User Interaction

```typescript
// User marks as read
notification.isRead = true;
notification.readAt = new Date();
await notification.save();
```

### 5. Cleanup (Automatic)

MongoDB automatically deletes notifications when `expiresAt` date is reached (TTL index).

## Pre-save Middleware

### Set Expiration Date

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

## Relationships

### Many-to-One with User

```typescript
Notification.userId -> User._id
```

Each notification belongs to one user.

### Many-to-One with Contest

```typescript
Notification.contestId -> Contest._id
```

Contest-related notifications reference a contest (optional).

## Performance Optimization

### Query Optimization

1. **Use indexes** for userId, contestId, status
2. **Limit results** with pagination
3. **Project only needed fields**
4. **Use lean()** for read-only queries

### Example Optimized Query

```typescript
const notifications = await this.notificationModel
  .find({ userId: ObjectId(userId), isActive: true })
  .select('type title message status createdAt isRead')
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();
```

### Cleanup Strategy

1. **TTL Index** - Automatic cleanup after 90 days
2. **Manual Cleanup** - Admin endpoint to cleanup old notifications
3. **Soft Delete** - Use `isActive: false` instead of hard delete

## Best Practices

### ✅ Do

1. **Set expiresAt** for automatic cleanup
2. **Track per-channel status** in deliveryStatus
3. **Implement retry logic** for failed notifications
4. **Log errors** in errorHistory
5. **Use unique index** to prevent duplicate contest notifications
6. **Mark as notified** in Contest schema to prevent duplicates
7. **Update isRead** when user views notification
8. **Use pagination** for notification history

### ❌ Don't

1. **Don't create duplicate notifications** (use unique index)
2. **Don't retry indefinitely** (respect maxRetries)
3. **Don't skip error logging** (track all failures)
4. **Don't ignore partial failures** (track per-channel status)
5. **Don't hard-delete notifications** (use isActive flag)
6. **Don't query without indexes** (use userId, status indexes)
7. **Don't skip TTL index** (prevents database bloat)

## Migration Notes

### Adding New Channel

1. Add channel to `NotificationChannel` enum
2. Update user preferences schema
3. Implement channel service
4. Test delivery and retry logic

### Adding New Type

1. Add type to `NotificationType` enum
2. Create notification template
3. Update notification service
4. Test notification flow

## Related Documentation

- [Notifications Module](/server/modules/notifications)
- [Notifications API](/api/notifications)
- [User Schema](/server/database/user)
- [Contest Schema](/server/database/contest)
- [Database Indexes](/server/database/indexes)
- [Notification System Guide](/guide/notifications)
