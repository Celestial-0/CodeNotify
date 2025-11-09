# Get Notification by ID

Retrieve a specific notification by its unique identifier.

## Endpoint

```http
GET /notifications/notifications/:id
```

**Authentication:** Required (JWT)

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Notification unique identifier (MongoDB ObjectId) |

## Request Example

```bash
curl http://localhost:3000/notifications/notifications/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "contestId": "507f1f77bcf86cd799439012",
  "type": "CONTEST_REMINDER",
  "title": "Contest Starting Soon",
  "message": "Codeforces Round #900 starts in 2 hours",
  "payload": {
    "contestName": "Codeforces Round #900",
    "platform": "codeforces",
    "startTime": "2024-02-16T14:35:00.000Z",
    "hoursUntilStart": 2,
    "contestUrl": "https://codeforces.com/contest/1900"
  },
  "channels": ["email", "push"],
  "status": "SENT",
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "SENT",
      "sentAt": "2024-02-16T12:35:00.000Z",
      "retryCount": 0
    },
    {
      "channel": "push",
      "status": "SENT",
      "sentAt": "2024-02-16T12:35:05.000Z",
      "retryCount": 0
    }
  ],
  "scheduledAt": "2024-02-16T12:35:00.000Z",
  "sentAt": "2024-02-16T12:35:00.000Z",
  "isRead": false,
  "createdAt": "2024-02-16T12:30:00.000Z",
  "updatedAt": "2024-02-16T12:35:05.000Z"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Notification unique identifier |
| `userId` | string | User who received the notification |
| `contestId` | string | Related contest ID (optional) |
| `type` | string | Notification type |
| `title` | string | Notification title |
| `message` | string | Notification message |
| `payload` | object | Additional notification data |
| `channels` | array | Delivery channels used |
| `status` | string | Overall notification status |
| `deliveryStatus` | array | Per-channel delivery details |
| `scheduledAt` | string | When notification was scheduled |
| `sentAt` | string | When notification was sent |
| `failedAt` | string | When notification failed (if applicable) |
| `isRead` | boolean | Whether notification was read |
| `readAt` | string | When notification was read |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

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

## Delivery Status

Each channel has its own delivery status:

```json
{
  "channel": "email",
  "status": "SENT",
  "sentAt": "2024-02-16T12:35:00.000Z",
  "failedAt": null,
  "error": null,
  "retryCount": 0
}
```

### Delivery Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `channel` | string | Notification channel: `email`, `whatsapp`, `push` |
| `status` | string | Channel-specific status |
| `sentAt` | string | When notification was sent via this channel |
| `failedAt` | string | When delivery failed (if applicable) |
| `error` | string | Error message (if failed) |
| `retryCount` | number | Number of retry attempts |

## Error Responses

### 404 Not Found
```json
{
  "error": "Notification not found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid notification ID format",
  "error": "Bad Request"
}
```

## Use Cases

1. **Notification Details**: View complete notification information
2. **Delivery Tracking**: Check delivery status across channels
3. **Debugging**: Investigate notification issues
4. **User Interface**: Display notification details in UI
5. **Retry Logic**: Check status before retrying failed notifications

## Example: Failed Notification

```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "type": "CONTEST_REMINDER",
  "status": "FAILED",
  "deliveryStatus": [
    {
      "channel": "email",
      "status": "FAILED",
      "failedAt": "2024-02-16T12:35:00.000Z",
      "error": "Invalid email address",
      "retryCount": 3
    }
  ],
  "isRead": false,
  "createdAt": "2024-02-16T12:30:00.000Z"
}
```

## Best Practices

### ✅ Do

- Check notification status before retrying
- Use delivery status to identify channel-specific issues
- Cache notification details when displaying in UI
- Handle 404 errors gracefully

### ❌ Don't

- Poll this endpoint repeatedly for status updates
- Ignore delivery status errors
- Assume notification exists without error handling

## Related Endpoints

- [Get Notification History](/api/notifications/history)
- [Mark as Read](/api/notifications/mark-as-read)
- [Retry Failed Notification](/api/notifications/retry)
- [Notification Stats](/api/notifications/stats)
