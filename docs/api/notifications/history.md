# Get Notification History

Retrieve notification history with filtering and pagination.

## Endpoint

```http
GET /notifications/notifications
```

**Authentication:** Required (JWT)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userId` | string | No | - | Filter by user ID |
| `status` | string | No | - | Filter by status: `PENDING`, `SENT`, `FAILED`, `RETRYING` |
| `type` | string | No | - | Filter by type: `CONTEST_REMINDER`, `CONTEST_STARTING`, `CONTEST_ENDING`, `SYSTEM_ALERT` |
| `startDate` | string | No | - | Filter from date (ISO 8601) |
| `endDate` | string | No | - | Filter to date (ISO 8601) |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max: 100) |

## Request Example

```bash
curl "http://localhost:3000/notifications/notifications?userId=507f1f77bcf86cd799439011&status=SENT&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "contestId": "507f1f77bcf86cd799439013",
      "type": "CONTEST_REMINDER",
      "title": "Contest Starting Soon",
      "message": "Codeforces Round #900 starts in 2 hours",
      "payload": {
        "contestName": "Codeforces Round #900",
        "platform": "codeforces",
        "startTime": "2024-02-16T14:35:00.000Z",
        "hoursUntilStart": 2
      },
      "channels": ["email"],
      "status": "SENT",
      "deliveryStatus": [
        {
          "channel": "email",
          "status": "SENT",
          "sentAt": "2024-02-16T12:35:00.000Z",
          "retryCount": 0
        }
      ],
      "isRead": false,
      "createdAt": "2024-02-16T12:35:00.000Z",
      "updatedAt": "2024-02-16T12:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Response Fields

### Notification Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Notification unique identifier |
| `userId` | string | User who received the notification |
| `contestId` | string | Related contest ID (if applicable) |
| `type` | string | Notification type |
| `title` | string | Notification title |
| `message` | string | Notification message |
| `payload` | object | Additional notification data |
| `channels` | array | Delivery channels used |
| `status` | string | Overall notification status |
| `deliveryStatus` | array | Per-channel delivery status |
| `isRead` | boolean | Whether notification was read |
| `readAt` | string | When notification was read |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of notifications |
| `totalPages` | number | Total number of pages |

## Filter Examples

### By Status
```bash
curl "http://localhost:3000/notifications/notifications?status=FAILED" \
  -H "Authorization: Bearer <token>"
```

### By Type
```bash
curl "http://localhost:3000/notifications/notifications?type=CONTEST_REMINDER" \
  -H "Authorization: Bearer <token>"
```

### By Date Range
```bash
curl "http://localhost:3000/notifications/notifications?startDate=2024-02-01T00:00:00Z&endDate=2024-02-28T23:59:59Z" \
  -H "Authorization: Bearer <token>"
```

### Multiple Filters
```bash
curl "http://localhost:3000/notifications/notifications?userId=123&status=SENT&type=CONTEST_REMINDER&page=2&limit=50" \
  -H "Authorization: Bearer <token>"
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid query parameters",
  "error": "Bad Request"
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

## Use Cases

1. **User Dashboard**: Display user's notification history
2. **Failed Notifications**: Find and retry failed notifications
3. **Analytics**: Track notification delivery patterns
4. **Debugging**: Investigate notification issues
5. **Audit Trail**: Review notification history

## Best Practices

### ✅ Do

- Use pagination for large result sets
- Filter by date range to limit results
- Combine filters for specific queries
- Cache results when appropriate

### ❌ Don't

- Request all notifications without pagination
- Use very large limit values (max: 100)
- Poll this endpoint frequently (use webhooks instead)

## Related Endpoints

- [Get Notification by ID](/api/notifications/get-by-id)
- [Mark as Read](/api/notifications/mark-as-read)
- [Notification Stats](/api/notifications/stats)
- [Retry Failed Notification](/api/notifications/retry)
