# Notifications API

Multi-channel notification system for contest alerts and admin email operations.

## Overview

The Notifications API provides endpoints for:
- Notification history and management
- Multi-channel test notifications (admin)
- Bulk email operations (admin)
- Service health monitoring

## Base URL

```
http://localhost:3000/notifications
```

## Authentication

Most endpoints require JWT authentication. Admin endpoints require `admin` role.

```http
Authorization: Bearer <access_token>
```

## Notification Channels

| Channel | Status | Description |
|---------|--------|-------------|
| **Email** | ✅ Active | Email notifications via Resend |
| **WhatsApp** | ✅ Active | WhatsApp messages (implementation ready) |
| **Push** | ✅ Active | Push notifications (implementation ready) |

## Notification Types

| Type | Description |
|------|-------------|
| `CONTEST_REMINDER` | Contest starting within notification window |
| `CONTEST_STARTING` | Contest is about to start |
| `CONTEST_ENDING` | Contest is about to end |
| `SYSTEM_ALERT` | System-wide announcements |

## Notification Status

| Status | Description |
|--------|-------------|
| `PENDING` | Notification queued for delivery |
| `SENT` | Successfully delivered |
| `FAILED` | Delivery failed |
| `RETRYING` | Retry in progress |

## Notification Schema

```typescript
{
  id: string;
  userId: string;
  contestId?: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  deliveryStatus: Array<{
    channel: NotificationChannel;
    status: NotificationStatus;
    sentAt?: Date;
    failedAt?: Date;
    error?: string;
    retryCount: number;
  }>;
  scheduledAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## User Preferences

Configure notification preferences in your profile:

```json
{
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "notificationChannels": ["email"],
    "notifyBefore": 24,
    "alertFrequency": "daily"
  }
}
```

### Preference Fields

| Field | Type | Description |
|-------|------|-------------|
| `platforms` | array | Platforms to receive notifications for |
| `notificationChannels` | array | Channels to send notifications through |
| `notifyBefore` | number | Hours before contest to notify (1-168) |
| `alertFrequency` | string | How often to receive alerts |

## Notification Schedule

Notifications are checked every 30 minutes:

```
Schedule: */30 * * * * (Every 30 minutes)
Window: 24 hours (configurable)
```

### How It Works

1. **Scheduler runs** every 30 minutes
2. **Finds contests** starting within notification window
3. **Matches users** with platform preferences
4. **Checks timing** against user's `notifyBefore` setting
5. **Sends notifications** via preferred channels
6. **Marks as notified** to prevent duplicates

## API Endpoints

### Service Status

#### Get Service Status
```http
GET /notifications/status
```

Returns status of all notification services (email, WhatsApp, push).

**Response:**
```json
{
  "email": { "enabled": true, "healthy": true },
  "whatsapp": { "enabled": true, "healthy": false },
  "push": { "enabled": true, "healthy": false }
}
```

#### Health Check
```http
GET /notifications/health
```

Performs health check on all notification services.

---

### Test Endpoints (Admin Only)

#### Test Email
```http
POST /notifications/test/email
```

**Auth Required:** Admin role

**Body:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent to test@example.com",
  "payload": { /* test data */ }
}
```

#### Test WhatsApp
```http
POST /notifications/test/whatsapp
```

**Auth Required:** Admin role

**Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

#### Test Push Notification
```http
POST /notifications/test/push
```

**Auth Required:** Admin role

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### Email Operations (Admin Only)

#### Send Custom Email
```http
POST /notifications/emails/custom
```

**Auth Required:** Admin role

**Body:**
```json
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "html": "<h1>Email Content</h1>",
  "text": "Plain text version",
  "replyTo": "support@example.com"
}
```

#### Send Bulk Email
```http
POST /notifications/emails/bulk
```

**Auth Required:** Admin role

**Body:**
```json
{
  "userIds": ["userId1", "userId2"],
  "subject": "Bulk Email Subject",
  "html": "<p>Email content</p>",
  "text": "Plain text"
}
```

**Limits:** Max 1000 users per request

#### Send Announcement
```http
POST /notifications/emails/announcement
```

**Auth Required:** Admin role

**Body:**
```json
{
  "subject": "Important Announcement",
  "title": "New Feature Released",
  "message": "We're excited to announce...",
  "actionUrl": "https://example.com/feature",
  "actionText": "Learn More",
  "filters": {
    "platforms": ["codeforces", "leetcode"],
    "isActive": true
  }
}
```

#### Send Contest Reminder
```http
POST /notifications/emails/contest-reminder
```

**Auth Required:** Admin role

**Body:**
```json
{
  "contestId": "507f1f77bcf86cd799439012",
  "userIds": ["userId1", "userId2"],
  "customMessage": "Don't miss this contest!"
}
```

---

### Notification History

#### Get Notifications
```http
GET /notifications/notifications
```

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): `PENDING` | `SENT` | `FAILED` | `RETRYING`
- `type` (optional): `CONTEST_REMINDER` | `CONTEST_STARTING` | `CONTEST_ENDING` | `SYSTEM_ALERT`
- `startDate` (optional): ISO datetime
- `endDate` (optional): ISO datetime
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Example:**
```bash
curl "http://localhost:3000/notifications/notifications?userId=123&status=SENT&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "notifications": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Notification by ID
```http
GET /notifications/notifications/:id
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "Codeforces Round #900 starts in 2 hours",
  "status": "SENT",
  "isRead": false,
  "createdAt": "2024-02-16T12:35:00.000Z"
}
```

#### Mark as Read
```http
PATCH /notifications/notifications/:id/read
```

**Response:**
```json
{
  "success": true,
  "notification": { /* updated notification */ }
}
```

#### Mark All as Read
```http
PATCH /notifications/notifications/user/:userId/read-all
```

Marks all notifications for a user as read.

#### Get Notification Stats
```http
GET /notifications/notifications/stats
```

**Query Parameters:**
- `userId` (optional): Filter by user
- `startDate` (optional): ISO datetime
- `endDate` (optional): ISO datetime

**Response:**
```json
{
  "total": 150,
  "sent": 140,
  "failed": 5,
  "pending": 5,
  "byChannel": {
    "email": 100,
    "whatsapp": 30,
    "push": 20
  },
  "byType": {
    "CONTEST_REMINDER": 120,
    "CONTEST_STARTING": 20,
    "CONTEST_ENDING": 10
  },
  "successRate": 93.3
}
```

#### Retry Failed Notification
```http
POST /notifications/notifications/:id/retry
```

Retries a failed notification.

**Response:**
```json
{
  "success": true,
  "notification": { /* updated notification */ }
}
```

#### Cleanup Old Notifications
```http
DELETE /notifications/notifications/cleanup?daysOld=90
```

Deletes notifications older than specified days (default: 90).

**Response:**
```json
{
  "deleted": 250,
  "message": "Cleaned up 250 notifications older than 90 days"
}
```

## Configuration

### Environment Variables

```bash
# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@codenotify.dev

# WhatsApp (if enabled)
WHATSAPP_API_KEY=your_key
WHATSAPP_PHONE_NUMBER=+1234567890

# Push Notifications (if enabled)
PUSH_API_KEY=your_key
```

## Retry Logic

Failed notifications are automatically retried:
- **Max Retries**: 3 attempts
- **Retry Delay**: Exponential backoff
- **Status**: Changes to `RETRYING` during retry
- **Final Status**: `SENT` or `FAILED` after max retries

## Notification Expiration

Notifications auto-expire after 90 days (configurable via TTL index).

## Best Practices

### ✅ Do

1. **Use pagination** for notification lists
2. **Mark notifications as read** to track user engagement
3. **Monitor stats** to track delivery success rates
4. **Test notifications** before bulk operations
5. **Use filters** in announcements to target specific users
6. **Cleanup old notifications** regularly

### ❌ Don't

1. **Don't send bulk emails without testing**
2. **Don't exceed 1000 users** in single bulk operation
3. **Don't retry manually** if auto-retry is in progress
4. **Don't ignore failed notifications** - investigate errors
5. **Don't use invalid email addresses**

## Error Handling

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| 400 | Invalid request body | Check DTO validation |
| 401 | Unauthorized | Provide valid JWT token |
| 403 | Forbidden | Admin role required |
| 404 | Notification not found | Check notification ID |
| 429 | Too many requests | Rate limit exceeded |

### Delivery Errors

Check `deliveryStatus` array for channel-specific errors:

```json
{
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "FAILED",
      "error": "Invalid email address",
      "retryCount": 3
    }
  ]
}
```

## Related Documentation

- [User Preferences](/api/users/profile)
- [Notification System Guide](/guide/notifications)
- [Error Handling](/api/errors)
