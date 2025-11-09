# Platform Statistics

Get detailed statistics for a specific platform.

## Endpoint

```http
GET /contests/stats/:platform
```

## Authentication

**Not required** - Public endpoint

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Platform name (codeforces, leetcode, codechef, atcoder) |

## Response

### Success (200 OK)

```json
{
  "platform": "codeforces",
  "totalContests": 450,
  "upcomingContests": 12,
  "runningContests": 1,
  "finishedContests": 437,
  "averageDuration": 120,
  "averageParticipants": 15000,
  "lastSyncTime": "2024-02-15T10:00:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `platform` | string | Platform name |
| `totalContests` | number | Total contests for this platform |
| `upcomingContests` | number | Upcoming contests |
| `runningContests` | number | Currently running |
| `finishedContests` | number | Finished contests |
| `averageDuration` | number | Average duration in minutes |
| `averageParticipants` | number | Average participant count |
| `lastSyncTime` | string | Last sync timestamp (ISO 8601) |

## Examples

### cURL

```bash
# Codeforces stats
curl http://localhost:3000/contests/stats/codeforces

# LeetCode stats
curl http://localhost:3000/contests/stats/leetcode
```

### JavaScript

```javascript
const getPlatformStats = async (platform) => {
  const response = await fetch(`/contests/stats/${platform}`);
  return await response.json();
};

// Usage
const cfStats = await getPlatformStats('codeforces');
console.log(`Codeforces: ${cfStats.totalContests} contests`);
console.log(`Average duration: ${cfStats.averageDuration} minutes`);
```

### React Component

```typescript
const PlatformStats = ({ platform }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/contests/stats/${platform}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [platform]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>{stats.platform} Statistics</h2>
      <p>Total Contests: {stats.totalContests}</p>
      <p>Upcoming: {stats.upcomingContests}</p>
      <p>Average Duration: {stats.averageDuration} minutes</p>
      <p>Average Participants: {stats.averageParticipants.toLocaleString()}</p>
      <p>Last Synced: {new Date(stats.lastSyncTime).toLocaleString()}</p>
    </div>
  );
};
```

## Use Cases

### Platform Comparison

Compare metrics across different platforms.

### Sync Status

Check when platform was last synchronized.

### Platform Health

Monitor platform activity and participation.

## Related Endpoints

- [Overall Stats](/api/contests/stats) - All platforms combined
- [Filter by Platform](/api/contests/platform) - Platform contests

## Notes

- Public endpoint
- Only counts active contests
- Averages calculated from all contests (including finished)
- Last sync time shows most recent contest sync for that platform
