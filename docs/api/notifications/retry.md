# Retry Failed Notification

Manually retry a failed notification.

## Endpoint

```http
POST /notifications/notifications/:id/retry
```

**Authentication:** Required (JWT)

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Notification unique identifier (MongoDB ObjectId) |

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/notifications/507f1f77bcf86cd799439011/retry \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

### Success Response
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
    "deliveryStatus": [
      {
        "channel": "email",
        "status": "SENT",
        "sentAt": "2024-02-16T14:30:00.000Z",
        "retryCount": 1
      }
    ],
    "updatedAt": "2024-02-16T14:30:00.000Z"
  }
}
```

### Failure Response
```json
{
  "success": false,
  "error": "Failed to retry notification: Invalid email address"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether retry was successful |
| `notification` | object | Updated notification object (if successful) |
| `error` | string | Error message (if failed) |

## Behavior

- Attempts to resend the notification via all failed channels
- Increments `retryCount` for each channel
- Updates notification status based on retry result
- Does not retry if max retry count (3) is reached
- Only retries notifications with `FAILED` status

## Retry Logic

### Automatic Retries
Notifications are automatically retried up to 3 times with exponential backoff:
- 1st retry: After 1 minute
- 2nd retry: After 5 minutes
- 3rd retry: After 15 minutes

### Manual Retry
This endpoint allows manual retry regardless of automatic retry schedule.

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "error": "Notification not found"
}
```

### 400 Bad Request - Already Sent
```json
{
  "success": false,
  "error": "Notification already sent successfully"
}
```

### 400 Bad Request - Max Retries
```json
{
  "success": false,
  "error": "Maximum retry count reached (3)"
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

1. **Manual Recovery**: Retry after fixing underlying issues
2. **User Request**: User reports not receiving notification
3. **System Recovery**: Retry after service restoration
4. **Testing**: Test notification delivery after configuration changes
5. **Debugging**: Investigate delivery issues

## Example: Partial Failure

Notification failed on one channel but succeeded on another:

```json
{
  "success": true,
  "notification": {
    "id": "507f1f77bcf86cd799439011",
    "status": "SENT",
    "deliveryStatus": [
      {
        "channel": "email",
        "status": "SENT",
        "sentAt": "2024-02-16T14:30:00.000Z",
        "retryCount": 1
      },
      {
        "channel": "push",
        "status": "FAILED",
        "failedAt": "2024-02-16T14:30:05.000Z",
        "error": "Device token expired",
        "retryCount": 4
      }
    ]
  }
}
```

## Example: Max Retries Reached

```json
{
  "success": false,
  "error": "Maximum retry count reached (3). Please check notification configuration."
}
```

## Integration Example

### React Component
```typescript
const RetryNotification = ({ notificationId }: { notificationId: string }) => {
  const [retrying, setRetrying] = useState(false);
  
  const handleRetry = async () => {
    setRetrying(true);
    
    try {
      const response = await fetch(
        `http://localhost:3000/notifications/notifications/${notificationId}/retry`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Notification retried successfully');
        // Refresh notification list
        refreshNotifications();
      } else {
        toast.error(`Retry failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to retry notification');
      console.error(error);
    } finally {
      setRetrying(false);
    }
  };
  
  return (
    <button 
      onClick={handleRetry} 
      disabled={retrying}
      className="retry-button"
    >
      {retrying ? 'Retrying...' : 'Retry'}
    </button>
  );
};
```

### Vue Component
```typescript
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ notificationId: string }>();
const retrying = ref(false);

const handleRetry = async () => {
  retrying.value = true;
  
  try {
    const { data, error } = await useFetch(
      `/notifications/notifications/${props.notificationId}/retry`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      }
    );
    
    if (data.value?.success) {
      toast.success('Notification retried successfully');
      emit('retried', data.value.notification);
    } else {
      toast.error(`Retry failed: ${data.value?.error}`);
    }
  } catch (err) {
    toast.error('Failed to retry notification');
  } finally {
    retrying.value = false;
  }
};
</script>

<template>
  <button 
    @click="handleRetry" 
    :disabled="retrying"
    class="retry-button"
  >
    {{ retrying ? 'Retrying...' : 'Retry' }}
  </button>
</template>
```

## Best Practices

### ✅ Do

- Check notification status before retrying
- Handle both success and failure responses
- Show loading state during retry
- Refresh notification list after successful retry
- Log retry attempts for debugging
- Investigate root cause of failures

### ❌ Don't

- Retry notifications that are already sent
- Retry repeatedly without investigating errors
- Ignore max retry limit
- Retry without user confirmation
- Assume retry will always succeed

## Troubleshooting

### Common Failure Reasons

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid email address | User email is invalid | Update user email |
| Device token expired | Push token is outdated | Request new push token |
| Service unavailable | External service down | Wait and retry later |
| Rate limit exceeded | Too many requests | Wait before retrying |
| Max retries reached | Already retried 3 times | Check configuration |

## Related Endpoints

- [Get Notification by ID](/api/notifications/get-by-id)
- [Get Notification History](/api/notifications/history)
- [Notification Stats](/api/notifications/stats)
- [Health Check](/api/notifications/health)
