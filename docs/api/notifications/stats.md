# Get Notification Statistics

Retrieve notification statistics with optional filtering.

## Endpoint

```http
GET /notifications/notifications/stats
```

**Authentication:** Required (JWT)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userId` | string | No | - | Filter by user ID |
| `startDate` | string | No | - | Start date for date range (ISO 8601) |
| `endDate` | string | No | - | End date for date range (ISO 8601) |

## Request Examples

### All Statistics
```bash
curl "http://localhost:3000/notifications/notifications/stats" \
  -H "Authorization: Bearer <access_token>"
```

### User-Specific Statistics
```bash
curl "http://localhost:3000/notifications/notifications/stats?userId=507f1f77bcf86cd799439010" \
  -H "Authorization: Bearer <access_token>"
```

### Date Range Statistics
```bash
curl "http://localhost:3000/notifications/notifications/stats?startDate=2024-02-01T00:00:00Z&endDate=2024-02-28T23:59:59Z" \
  -H "Authorization: Bearer <access_token>"
```

### Combined Filters
```bash
curl "http://localhost:3000/notifications/notifications/stats?userId=507f1f77bcf86cd799439010&startDate=2024-02-01T00:00:00Z&endDate=2024-02-28T23:59:59Z" \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "total": 150,
  "sent": 140,
  "failed": 5,
  "pending": 3,
  "retrying": 2,
  "read": 85,
  "unread": 65,
  "byChannel": {
    "email": 100,
    "whatsapp": 30,
    "push": 20
  },
  "byType": {
    "CONTEST_REMINDER": 120,
    "CONTEST_STARTING": 20,
    "CONTEST_ENDING": 8,
    "SYSTEM_ALERT": 2
  },
  "byStatus": {
    "SENT": 140,
    "FAILED": 5,
    "PENDING": 3,
    "RETRYING": 2
  },
  "successRate": 93.33,
  "failureRate": 3.33,
  "averageDeliveryTime": 2.5,
  "dateRange": {
    "start": "2024-02-01T00:00:00.000Z",
    "end": "2024-02-28T23:59:59.999Z"
  }
}
```

## Response Fields

### Overall Statistics

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of notifications |
| `sent` | number | Successfully sent notifications |
| `failed` | number | Failed notifications |
| `pending` | number | Pending notifications |
| `retrying` | number | Notifications being retried |
| `read` | number | Read notifications |
| `unread` | number | Unread notifications |

### By Channel

| Channel | Description |
|---------|-------------|
| `email` | Email notifications count |
| `whatsapp` | WhatsApp notifications count |
| `push` | Push notifications count |

### By Type

| Type | Description |
|------|-------------|
| `CONTEST_REMINDER` | Contest reminder notifications |
| `CONTEST_STARTING` | Contest starting notifications |
| `CONTEST_ENDING` | Contest ending notifications |
| `SYSTEM_ALERT` | System alert notifications |

### By Status

| Status | Description |
|--------|-------------|
| `SENT` | Successfully delivered |
| `FAILED` | Delivery failed |
| `PENDING` | Queued for delivery |
| `RETRYING` | Retry in progress |

### Metrics

| Field | Type | Description |
|-------|------|-------------|
| `successRate` | number | Percentage of successful deliveries |
| `failureRate` | number | Percentage of failed deliveries |
| `averageDeliveryTime` | number | Average delivery time in seconds |
| `dateRange` | object | Date range for statistics (if filtered) |

## Use Cases

1. **Dashboard Analytics**: Display notification metrics
2. **Performance Monitoring**: Track delivery success rates
3. **User Engagement**: Measure notification read rates
4. **Debugging**: Identify delivery issues
5. **Reporting**: Generate notification reports
6. **Optimization**: Analyze channel performance

## Example: User-Specific Stats

```json
{
  "total": 25,
  "sent": 24,
  "failed": 1,
  "pending": 0,
  "read": 15,
  "unread": 10,
  "byChannel": {
    "email": 25
  },
  "byType": {
    "CONTEST_REMINDER": 20,
    "CONTEST_STARTING": 5
  },
  "successRate": 96.0,
  "failureRate": 4.0
}
```

## Example: Date Range Stats

```json
{
  "total": 50,
  "sent": 48,
  "failed": 2,
  "byChannel": {
    "email": 35,
    "push": 15
  },
  "successRate": 96.0,
  "dateRange": {
    "start": "2024-02-01T00:00:00.000Z",
    "end": "2024-02-07T23:59:59.999Z"
  }
}
```

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
  "message": "Invalid date format",
  "error": "Bad Request"
}
```

## Integration Example

### React Dashboard Component
```typescript
const NotificationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/notifications/notifications/stats',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="stats-dashboard">
      <div className="stat-card">
        <h3>Total Notifications</h3>
        <p>{stats.total}</p>
      </div>
      <div className="stat-card">
        <h3>Success Rate</h3>
        <p>{stats.successRate.toFixed(2)}%</p>
      </div>
      <div className="stat-card">
        <h3>Unread</h3>
        <p>{stats.unread}</p>
      </div>
    </div>
  );
};
```

### Vue Dashboard Component
```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const stats = ref(null);
const loading = ref(true);

const fetchStats = async () => {
  try {
    const { data } = await useFetch('/notifications/notifications/stats', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    });
    stats.value = data.value;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div v-if="!loading" class="stats-dashboard">
    <div class="stat-card">
      <h3>Total</h3>
      <p>{{ stats.total }}</p>
    </div>
    <div class="stat-card">
      <h3>Success Rate</h3>
      <p>{{ stats.successRate.toFixed(2) }}%</p>
    </div>
  </div>
</template>
```

## Best Practices

### ✅ Do

- Cache statistics for dashboard displays
- Use date ranges for historical analysis
- Monitor success rates regularly
- Track trends over time
- Use statistics for optimization decisions

### ❌ Don't

- Poll this endpoint too frequently
- Ignore failure rates
- Request statistics without date ranges for large datasets
- Use statistics as real-time monitoring (use health check instead)

## Related Endpoints

- [Get Notification History](/api/notifications/history)
- [Get Notification by ID](/api/notifications/get-by-id)
- [Health Check](/api/notifications/health)
- [Service Status](/api/notifications/status)
