# Send Custom Email

Send custom email to specific addresses (Admin only).

## Endpoint

```http
POST /notifications/emails/custom
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "to": "user@example.com",
  "subject": "Important Update",
  "html": "<h1>Hello!</h1><p>This is a custom email.</p>",
  "text": "Hello! This is a custom email.",
  "replyTo": "support@codenotify.dev"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject |
| `html` | string | Yes | HTML email content |
| `text` | string | No | Plain text version |
| `replyTo` | string | No | Reply-to email address |

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/emails/custom \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Important Update",
    "html": "<h1>Hello!</h1><p>Custom message here.</p>",
    "text": "Hello! Custom message here."
  }'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "messageId": "abc123def456",
  "to": "user@example.com",
  "subject": "Important Update",
  "provider": "Resend"
}
```

## Use Cases

1. **Custom Announcements**: Send personalized messages
2. **Support Emails**: Reply to user inquiries
3. **Marketing**: Send promotional emails
4. **Notifications**: Custom system notifications
5. **Testing**: Test email templates

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid email address",
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```

## Best Practices

### ✅ Do

- Include both HTML and text versions
- Use valid email addresses
- Test with your own email first
- Include unsubscribe links
- Use professional email templates

### ❌ Don't

- Send spam or unsolicited emails
- Use invalid HTML
- Ignore email deliverability best practices
- Send without user consent

## Related Endpoints

- [Send Bulk Email](/api/notifications/send-bulk-email)
- [Send Announcement](/api/notifications/send-announcement)
- [Send Contest Reminder](/api/notifications/send-contest-reminder)
