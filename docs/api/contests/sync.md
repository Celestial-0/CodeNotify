# Sync Platform Contests (Admin)

Manually trigger synchronization of contests from a specific platform.

## Endpoint

```http
POST /contests/sync/:platform
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Platform name (codeforces, leetcode, codechef, atcoder) |

## Request Body

```json
{
  "forceSync": false
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `forceSync` | boolean | No | false | Force sync even if recently synced |

## Response

### Success (200 OK)

```json
{
  "message": "Sync completed for codeforces",
  "platform": "codeforces",
  "synced": 5,
  "updated": 12,
  "failed": 0
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `platform` | string | Platform name |
| `synced` | number | New contests added |
| `updated` | number | Existing contests updated |
| `failed` | number | Failed operations |

## Examples

### cURL

```bash
# Sync Codeforces
curl -X POST http://localhost:3000/contests/sync/codeforces \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"forceSync": false}'

# Sync LeetCode
curl -X POST http://localhost:3000/contests/sync/leetcode \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### JavaScript

```javascript
const syncPlatform = async (platform, forceSync = false, adminToken) => {
  const response = await fetch(`http://localhost:3000/contests/sync/${platform}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ forceSync })
  });

  if (!response.ok) {
    throw new Error(`Failed to sync ${platform}`);
  }

  return await response.json();
};

// Usage
const result = await syncPlatform('codeforces', false, adminToken);
console.log(`Synced: ${result.synced}, Updated: ${result.updated}`);
```

### React Admin Panel

```typescript
const SyncButton = ({ platform }) => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`/contests/sync/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceSync: false })
      });
      
      const data = await response.json();
      setResult(data);
      alert(`Synced ${data.synced} new, updated ${data.updated}`);
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button onClick={handleSync} disabled={syncing}>
      {syncing ? 'Syncing...' : `Sync ${platform}`}
    </button>
  );
};
```

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 500 Internal Server Error

Platform sync failed.

```json
{
  "statusCode": 500,
  "message": "Platform codeforces not registered or not enabled"
}
```

## Sync Process

1. **Fetch contests** from platform API
2. **Transform** to internal format
3. **Upsert** to database:
   - Existing contests (by platformId + platform) → **Update**
   - New contests → **Create**
4. **Return** statistics

## Platform Availability

- ✅ **codeforces** - Enabled
- ✅ **leetcode** - Enabled
- ✅ **codechef** - Enabled
- ✅ **atcoder** - Enabled

## Automatic Sync

Contests are automatically synced every 6 hours via scheduled job. Manual sync is useful for:
- Immediate updates
- Testing
- After platform API changes

## Notes

- **Admin only**
- Returns 200 OK (not 201 Created)
- Duplicate contests are updated, not created
- Failed contests are logged but don't stop the sync
- `lastSyncedAt` updated for all contests
