# Send Contest Reminder

Send contest reminder to specific users (Admin only).

## Endpoint

```http
POST /notifications/emails/contest-reminder
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "contestId": "507f1f77bcf86cd799439012",
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"],
  "customMessage": "Don't miss this important contest!"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contestId` | string | Yes | Contest unique identifier |
| `userIds` | array | Yes | Array of user IDs |
| `customMessage` | string | No | Additional custom message |

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/emails/contest-reminder \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contestId": "507f1f77bcf86cd799439012",
    "userIds": ["507f1f77bcf86cd799439011"],
    "customMessage": "Special contest alert!"
  }'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "contestName": "Codeforces Round #900",
  "results": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "success": true,
      "messageId": "abc123"
    }
  ]
}
```

## Use Cases

1. **Manual Reminders**: Send reminders for important contests
2. **Special Contests**: Notify about featured contests
3. **Makeup Notifications**: Resend missed notifications
4. **Testing**: Test contest notification system

## Best Practices

### ✅ Do

- Verify contest exists before sending
- Include contest details
- Send at appropriate time before contest
- Monitor delivery success

### ❌ Don't

- Send reminders for past contests
- Spam users with multiple reminders
- Send without verifying user preferences

## Related Endpoints

- [Get Contest by ID](/api/contests/get-by-id)
- [Send Bulk Email](/api/notifications/send-bulk-email)
- [Get Notification History](/api/notifications/history)
