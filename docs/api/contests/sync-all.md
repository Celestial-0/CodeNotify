# Sync All Platforms (Admin)

Manually trigger synchronization of contests from all registered platforms.

## Endpoint

```http
POST /contests/sync/all
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Request

No request body required.

## Response

### Success (200 OK)

```json
{
  "message": "Sync completed for all platforms",
  "results": {
    "codeforces": {
      "synced": 5,
      "updated": 12,
      "failed": 0
    },
    "leetcode": {
      "synced": 2,
      "updated": 8,
      "failed": 0
    },
    "codechef": {
      "synced": 3,
      "updated": 5,
      "failed": 0
    },
    "atcoder": {
      "synced": 4,
      "updated": 6,
      "failed": 0
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `results` | object | Results per platform |
| `results[platform].synced` | number | New contests added |
| `results[platform].updated` | number | Existing contests updated |
| `results[platform].failed` | number | Failed operations |

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/contests/sync/all \
  -H "Authorization: Bearer <admin_token>"
```

### JavaScript

```javascript
const syncAllPlatforms = async (adminToken) => {
  const response = await fetch('http://localhost:3000/contests/sync/all', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to sync platforms');
  }

  return await response.json();
};

// Usage
const result = await syncAllPlatforms(adminToken);

// Calculate totals
const totals = Object.values(result.results).reduce((acc, platform) => ({
  synced: acc.synced + platform.synced,
  updated: acc.updated + platform.updated,
  failed: acc.failed + platform.failed
}), { synced: 0, updated: 0, failed: 0 });

console.log(`Total: ${totals.synced} new, ${totals.updated} updated`);
```

### React Admin Panel

```typescript
const SyncAllButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState(null);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/contests/sync/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button onClick={handleSyncAll} disabled={syncing}>
        {syncing ? 'Syncing All Platforms...' : 'Sync All Platforms'}
      </button>

      {results && (
        <div>
          <h3>Sync Results</h3>
          {Object.entries(results).map(([platform, stats]) => (
            <div key={platform}>
              <strong>{platform}:</strong> {stats.synced} new, {stats.updated} updated
              {stats.failed > 0 && <span> ({stats.failed} failed)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
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

## Sync Process

For each registered platform:
1. **Fetch contests** from platform API
2. **Transform** to internal format
3. **Upsert** to database
4. **Continue** to next platform (failures don't stop other platforms)

## Platforms Synced

- ✅ Codeforces
- ✅ LeetCode
- ✅ CodeChef
- ✅ AtCoder

## Automatic Sync

This operation is automatically performed every 6 hours via scheduled job (`sync-all-contests`).

Manual sync is useful for:
- Immediate updates after platform changes
- Testing
- Admin dashboard refresh

## Performance

- Syncs platforms sequentially (not parallel)
- Takes 10-30 seconds depending on platform response times
- Failed platforms don't stop other platforms from syncing

## Notes

- **Admin only**
- Returns 200 OK
- Failures per platform are logged but don't fail the entire operation
- Each platform's `lastSyncedAt` is updated independently
