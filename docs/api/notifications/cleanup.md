# Cleanup Old Notifications

Delete notifications older than a specified number of days.

## Endpoint

```http
DELETE /notifications/notifications/cleanup
```

**Authentication:** Required (JWT)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `daysOld` | number | No | 90 | Delete notifications older than this many days |

## Request Examples

### Default Cleanup (90 days)
```bash
curl -X DELETE "http://localhost:3000/notifications/notifications/cleanup" \
  -H "Authorization: Bearer <access_token>"
```

### Custom Days
```bash
curl -X DELETE "http://localhost:3000/notifications/notifications/cleanup?daysOld=30" \
  -H "Authorization: Bearer <access_token>"
```

### Aggressive Cleanup (7 days)
```bash
curl -X DELETE "http://localhost:3000/notifications/notifications/cleanup?daysOld=7" \
  -H "Authorization: Bearer <access_token>"
```

## Response

**Status Code:** `200 OK`

```json
{
  "deleted": 250,
  "message": "Cleaned up 250 notifications older than 90 days",
  "cutoffDate": "2023-11-17T00:00:00.000Z"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `deleted` | number | Number of notifications deleted |
| `message` | string | Success message with details |
| `cutoffDate` | string | Date threshold used for deletion |

## Behavior

- Deletes notifications created before the cutoff date
- Cutoff date = current date - `daysOld` days
- Deletes notifications regardless of status (SENT, FAILED, PENDING)
- Deletes notifications regardless of read status
- Permanent deletion (cannot be undone)
- Affects all users

## Use Cases

1. **Database Maintenance**: Regular cleanup to manage database size
2. **Performance**: Improve query performance by reducing data
3. **Compliance**: Meet data retention policies
4. **Storage Management**: Free up storage space
5. **Scheduled Cleanup**: Automated cleanup via cron jobs

## Example: No Old Notifications

If no notifications match the criteria:

```json
{
  "deleted": 0,
  "message": "No notifications found older than 90 days",
  "cutoffDate": "2023-11-17T00:00:00.000Z"
}
```

## Example: Large Cleanup

```json
{
  "deleted": 5420,
  "message": "Cleaned up 5420 notifications older than 180 days",
  "cutoffDate": "2023-08-20T00:00:00.000Z"
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
  "message": "daysOld must be a positive number",
  "error": "Bad Request"
}
```

## Recommended Cleanup Schedule

| Frequency | Days Old | Use Case |
|-----------|----------|----------|
| Daily | 7 | High-volume systems |
| Weekly | 30 | Medium-volume systems |
| Monthly | 90 | Low-volume systems |
| Quarterly | 180 | Archival systems |

## Integration Example

### Scheduled Cleanup (Node.js)
```typescript
import cron from 'node-cron';

// Run cleanup every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  try {
    const response = await fetch(
      'http://localhost:3000/notifications/notifications/cleanup?daysOld=90',
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    
    const data = await response.json();
    console.log(`Cleanup completed: ${data.message}`);
    
    // Log to monitoring system
    logger.info('Notification cleanup', {
      deleted: data.deleted,
      cutoffDate: data.cutoffDate
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    // Alert admin
    alertAdmin('Notification cleanup failed');
  }
});
```

### Manual Cleanup (React Admin Panel)
```typescript
const CleanupPanel = () => {
  const [daysOld, setDaysOld] = useState(90);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleCleanup = async () => {
    if (!confirm(`Delete notifications older than ${daysOld} days?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `http://localhost:3000/notifications/notifications/cleanup?daysOld=${daysOld}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const data = await response.json();
      setResult(data);
      toast.success(data.message);
    } catch (error) {
      toast.error('Cleanup failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="cleanup-panel">
      <h2>Notification Cleanup</h2>
      <div>
        <label>Delete notifications older than:</label>
        <input 
          type="number" 
          value={daysOld} 
          onChange={(e) => setDaysOld(Number(e.target.value))}
          min="1"
        />
        <span>days</span>
      </div>
      <button 
        onClick={handleCleanup} 
        disabled={loading}
        className="cleanup-button"
      >
        {loading ? 'Cleaning...' : 'Cleanup'}
      </button>
      {result && (
        <div className="result">
          <p>Deleted: {result.deleted} notifications</p>
          <p>Cutoff Date: {new Date(result.cutoffDate).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};
```

### Automated Cleanup (NestJS Service)
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationCleanupService {
  private readonly logger = new Logger(NotificationCleanupService.name);
  
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCleanup() {
    this.logger.log('Starting weekly notification cleanup');
    
    try {
      const result = await this.cleanupNotifications(90);
      this.logger.log(`Cleaned up ${result.deleted} notifications`);
    } catch (error) {
      this.logger.error('Cleanup failed', error);
    }
  }
  
  private async cleanupNotifications(daysOld: number) {
    const response = await fetch(
      `http://localhost:3000/notifications/notifications/cleanup?daysOld=${daysOld}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      }
    );
    
    return await response.json();
  }
}
```

## Best Practices

### ✅ Do

- Run cleanup during low-traffic periods
- Start with conservative retention (90+ days)
- Monitor deletion counts
- Log cleanup operations
- Set up automated cleanup schedules
- Test with small `daysOld` values first
- Backup database before large cleanups

### ❌ Don't

- Delete recent notifications (< 7 days)
- Run cleanup during peak hours
- Delete without confirmation
- Ignore cleanup failures
- Run cleanup too frequently
- Use very small `daysOld` values without testing

## Performance Considerations

- **Large Deletions**: May take several seconds for thousands of notifications
- **Database Load**: Can impact database performance during cleanup
- **Indexes**: Ensure `createdAt` field is indexed for performance
- **Batch Size**: Consider implementing batch deletion for very large datasets

## Monitoring

Track cleanup operations:
- Number of notifications deleted
- Cleanup duration
- Database size before/after
- Cleanup failures
- Retention policy compliance

## Data Retention Policy

Example policy:
```
- SENT notifications: 90 days
- FAILED notifications: 180 days (for debugging)
- PENDING notifications: 30 days
- System alerts: 365 days
```

To implement custom retention:
```typescript
// Delete SENT notifications older than 90 days
await cleanup(90, { status: 'SENT' });

// Delete FAILED notifications older than 180 days
await cleanup(180, { status: 'FAILED' });
```

## Related Endpoints

- [Get Notification History](/api/notifications/history)
- [Notification Stats](/api/notifications/stats)
- [Get Notification by ID](/api/notifications/get-by-id)

## See Also

- [Database Design](/server/database)
- [Scheduler & Jobs](/server/scheduler)
