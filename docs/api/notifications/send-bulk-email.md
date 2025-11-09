# Send Bulk Email

Send email to multiple users by IDs (Admin only).

## Endpoint

```http
POST /notifications/emails/bulk
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "subject": "Important Announcement",
  "html": "<h1>Hello!</h1><p>Bulk email content.</p>",
  "text": "Hello! Bulk email content."
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userIds` | array | Yes | Array of user IDs (max 1000) |
| `subject` | string | Yes | Email subject |
| `html` | string | Yes | HTML email content |
| `text` | string | No | Plain text version |

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/emails/bulk \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "subject": "System Update",
    "html": "<p>Important system update notification.</p>"
  }'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "email": "user1@example.com",
      "success": true,
      "messageId": "abc123"
    },
    {
      "userId": "507f1f77bcf86cd799439012",
      "email": "user2@example.com",
      "success": true,
      "messageId": "def456"
    }
  ]
}
```

## Limits

- **Max Users**: 1000 per request
- **Rate Limit**: 10 requests per hour

## Use Cases

1. **Announcements**: Send updates to specific user groups
2. **Notifications**: Bulk contest reminders
3. **Marketing**: Targeted campaigns
4. **Support**: Mass communication

## Best Practices

### ✅ Do

- Batch requests for large user lists
- Monitor delivery success rates
- Include unsubscribe links
- Test with small batches first

### ❌ Don't

- Exceed 1000 users per request
- Send without user consent
- Ignore failed deliveries

## Related Endpoints

- [Send Custom Email](/api/notifications/send-custom-email)
- [Send Announcement](/api/notifications/send-announcement)
