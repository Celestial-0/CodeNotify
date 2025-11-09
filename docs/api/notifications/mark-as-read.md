# Mark Notification as Read

Mark a specific notification as read.

## Endpoint

```http
PATCH /notifications/notifications/:id/read
```

**Authentication:** Required (JWT)

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Notification unique identifier (MongoDB ObjectId) |

## Request Example

```bash
curl -X PATCH http://localhost:3000/notifications/notifications/507f1f77bcf86cd799439011/read \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "notification": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "type": "CONTEST_REMINDER",
    "title": "Contest Starting Soon",
    "message": "Codeforces Round #900 starts in 2 hours",
    "status": "SENT",
    "isRead": true,
    "readAt": "2024-02-16T14:00:00.000Z",
    "createdAt": "2024-02-16T12:30:00.000Z",
    "updatedAt": "2024-02-16T14:00:00.000Z"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation success status |
| `notification` | object | Updated notification object |
| `notification.isRead` | boolean | Now set to `true` |
| `notification.readAt` | string | Timestamp when marked as read |
| `notification.updatedAt` | string | Updated timestamp |

## Error Responses

### 404 Not Found
```json
{
  "success": false,
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
  "success": false,
  "error": "Invalid notification ID format"
}
```

## Behavior

- Sets `isRead` to `true`
- Sets `readAt` to current timestamp
- Updates `updatedAt` timestamp
- Idempotent: Can be called multiple times safely
- Does not affect notification delivery status

## Use Cases

1. **User Interface**: Mark notifications as read when user views them
2. **Notification Center**: Track which notifications user has seen
3. **Unread Count**: Update unread notification counter
4. **User Engagement**: Track notification engagement metrics
5. **Cleanup**: Mark old notifications as read before cleanup

## Example: Already Read Notification

If notification is already marked as read, the operation succeeds and returns the current state:

```json
{
  "success": true,
  "notification": {
    "id": "507f1f77bcf86cd799439011",
    "isRead": true,
    "readAt": "2024-02-16T13:00:00.000Z"
  }
}
```

## Integration Example

### React Component
```typescript
const markAsRead = async (notificationId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/notifications/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Notification marked as read');
      // Update UI state
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};
```

### Vue Component
```typescript
const markAsRead = async (notificationId: string) => {
  const { data, error } = await useFetch(
    `/notifications/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    }
  );
  
  if (data.value?.success) {
    // Update notification state
    notification.value.isRead = true;
    notification.value.readAt = data.value.notification.readAt;
  }
};
```

## Best Practices

### ✅ Do

- Mark notifications as read when user views them
- Update UI immediately after marking as read
- Handle errors gracefully
- Use optimistic UI updates for better UX
- Batch mark operations when possible (use mark all as read)

### ❌ Don't

- Mark notifications as read without user interaction
- Ignore error responses
- Poll this endpoint repeatedly
- Mark notifications as read on behalf of other users

## Related Endpoints

- [Mark All as Read](/api/notifications/mark-all-as-read)
- [Get Notification by ID](/api/notifications/get-by-id)
- [Get Notification History](/api/notifications/history)
- [Notification Stats](/api/notifications/stats)
