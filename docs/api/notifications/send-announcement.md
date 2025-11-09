# Send Announcement

Send announcement to all users or filtered users (Admin only).

## Endpoint

```http
POST /notifications/emails/announcement
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "subject": "New Feature Released",
  "title": "Exciting Update!",
  "message": "We're excited to announce our new feature...",
  "actionUrl": "https://codenotify.dev/features",
  "actionText": "Learn More",
  "filters": {
    "platforms": ["codeforces", "leetcode"],
    "isActive": true
  }
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Email subject |
| `title` | string | Yes | Announcement title |
| `message` | string | Yes | Announcement message |
| `actionUrl` | string | No | Call-to-action URL |
| `actionText` | string | No | CTA button text |
| `filters` | object | No | User filters |

### Filters

| Filter | Type | Description |
|--------|------|-------------|
| `platforms` | array | Filter by preferred platforms |
| `isActive` | boolean | Filter by active status |

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/emails/announcement \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "New Feature",
    "title": "Exciting Update",
    "message": "Check out our new feature!",
    "actionUrl": "https://codenotify.dev",
    "actionText": "Learn More"
  }'
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "sent": 150,
  "failed": 2,
  "totalUsers": 152
}
```

## Use Cases

1. **Product Updates**: Announce new features
2. **System Maintenance**: Notify about downtime
3. **Community News**: Share important updates
4. **Events**: Announce contests or events

## Best Practices

### ✅ Do

- Use filters to target specific users
- Include clear call-to-action
- Test announcement with small group first
- Monitor delivery metrics

### ❌ Don't

- Send too frequently
- Send without clear purpose
- Ignore user preferences

## Related Endpoints

- [Send Bulk Email](/api/notifications/send-bulk-email)
- [Send Custom Email](/api/notifications/send-custom-email)
