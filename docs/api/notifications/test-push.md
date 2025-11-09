# Test Push Notification

Send a test push notification (Admin only).

## Endpoint

```http
POST /notifications/test/push
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/test/push \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "507f1f77bcf86cd799439011"}'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Test push notification sent to user 507f1f77bcf86cd799439011",
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "contestId": "test-contest",
    "contestName": "Test Contest - AtCoder Beginner Contest 350",
    "platform": "atcoder",
    "startTime": "2024-02-16T15:35:00.000Z",
    "hoursUntilStart": 1
  }
}
```

## Use Cases

- Test push notification service
- Verify device token configuration
- Debug push delivery issues
- Demo push notifications

## Related Endpoints

- [Test Email](/api/notifications/test-email)
- [Test WhatsApp](/api/notifications/test-whatsapp)
- [Service Status](/api/notifications/status)
