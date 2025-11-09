# Mark All Notifications as Read

Mark all notifications for a specific user as read.

## Endpoint

```http
PATCH /notifications/notifications/user/:userId/read-all
```

**Authentication:** Required (JWT)

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User unique identifier (MongoDB ObjectId) |

## Request Example

```bash
curl -X PATCH http://localhost:3000/notifications/notifications/user/507f1f77bcf86cd799439010/read-all \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "modifiedCount": 15,
  "message": "Marked 15 notifications as read"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation success status |
| `modifiedCount` | number | Number of notifications marked as read |
| `message` | string | Success message with count |

## Behavior

- Marks all unread notifications for the user as read
- Sets `isRead` to `true` for all unread notifications
- Sets `readAt` to current timestamp
- Updates `updatedAt` timestamp for all modified notifications
- Idempotent: Can be called multiple times safely
- Only affects unread notifications (already read notifications are unchanged)

## Error Responses

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
  "message": "Invalid user ID format",
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Cannot mark notifications for another user",
  "error": "Forbidden"
}
```

## Use Cases

1. **Clear All Notifications**: User wants to mark all notifications as read
2. **Notification Center**: "Mark all as read" button functionality
3. **Cleanup**: Clear notification badge/counter
4. **User Preference**: User wants to start fresh
5. **Bulk Operations**: Efficient way to mark multiple notifications

## Example: No Unread Notifications

If user has no unread notifications:

```json
{
  "success": true,
  "modifiedCount": 0,
  "message": "No unread notifications to mark"
}
```

## Integration Example

### React Component
```typescript
const markAllAsRead = async (userId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/notifications/notifications/user/${userId}/read-all`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Marked ${data.modifiedCount} notifications as read`);
      // Update UI: clear unread badge, refresh notification list
      setUnreadCount(0);
      refreshNotifications();
    }
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
};
```

### Vue Component
```typescript
const markAllAsRead = async () => {
  const { data, error } = await useFetch(
    `/notifications/notifications/user/${userId.value}/read-all`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    }
  );
  
  if (data.value?.success) {
    unreadCount.value = 0;
    notifications.value.forEach(n => {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    });
    
    toast.success(`Marked ${data.value.modifiedCount} notifications as read`);
  }
};
```

### Angular Component
```typescript
markAllAsRead(userId: string): void {
  this.http.patch(
    `${this.apiUrl}/notifications/notifications/user/${userId}/read-all`,
    {},
    {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      })
    }
  ).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.isRead = true);
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
      }
    },
    error: (error) => {
      console.error('Failed to mark all as read:', error);
      this.snackBar.open('Failed to mark notifications as read', 'Close', { duration: 3000 });
    }
  });
}
```

## Performance Considerations

- **Bulk Operation**: More efficient than marking notifications individually
- **Database Impact**: Single bulk update query
- **Response Time**: Typically < 100ms for most users
- **Scalability**: Handles users with thousands of notifications

## Best Practices

### ✅ Do

- Use this endpoint instead of marking notifications individually
- Update UI immediately after successful response
- Show confirmation message with count
- Clear unread notification badge/counter
- Refresh notification list after operation

### ❌ Don't

- Call this endpoint repeatedly in short intervals
- Mark notifications for other users
- Ignore the `modifiedCount` in response
- Assume all notifications were marked without checking response

## Security

- Users can only mark their own notifications as read
- JWT authentication required
- User ID in path must match authenticated user
- Admin users cannot mark notifications for other users

## Related Endpoints

- [Mark as Read](/api/notifications/mark-as-read)
- [Get Notification History](/api/notifications/history)
- [Notification Stats](/api/notifications/stats)
- [Get Notification by ID](/api/notifications/get-by-id)
