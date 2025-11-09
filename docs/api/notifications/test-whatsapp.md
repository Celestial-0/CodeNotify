# Test WhatsApp Notification

Send a test WhatsApp notification (Admin only).

## Endpoint

```http
POST /notifications/test/whatsapp
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "phoneNumber": "+1234567890"
}
```

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/test/whatsapp \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Test WhatsApp sent to +1234567890",
  "payload": {
    "userId": "test-user",
    "contestId": "test-contest",
    "contestName": "Test Contest - LeetCode Weekly Contest 400",
    "platform": "leetcode",
    "startTime": "2024-02-16T17:35:00.000Z",
    "hoursUntilStart": 3
  }
}
```

## Use Cases

- Test WhatsApp service configuration
- Verify phone number format
- Debug WhatsApp delivery issues
- Demo WhatsApp notifications

## Related Endpoints

- [Test Email](/api/notifications/test-email)
- [Test Push](/api/notifications/test-push)
- [Service Status](/api/notifications/status)
