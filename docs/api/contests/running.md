# Get Running Contests

Get all contests that are currently in progress.

## Endpoint

```http
GET /contests/running
```

## Authentication

**Not required** - Public endpoint

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | No | Filter by platform (codeforces, leetcode, codechef, atcoder) |

## Response

### Success (200 OK)

Returns an array of currently running contests sorted by start time.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "platformId": "1234",
    "name": "Codeforces Round #900 (Div. 2)",
    "platform": "codeforces",
    "phase": "CODING",
    "type": "CF",
    "startTime": "2024-02-15T14:35:00.000Z",
    "endTime": "2024-02-15T16:35:00.000Z",
    "durationMinutes": 120,
    "participantCount": 15000,
    "isActive": true,
    "createdAt": "2024-02-14T10:00:00.000Z",
    "updatedAt": "2024-02-15T14:35:00.000Z"
  }
]
```

## Filtering Logic

**Running contests** are defined as:
- `startTime <= now` (already started)
- `endTime >= now` (not yet finished)
- `isActive = true`

## Examples

### cURL

```bash
# All running contests
curl http://localhost:3000/contests/running

# Codeforces only
curl "http://localhost:3000/contests/running?platform=codeforces"
```

### JavaScript

```javascript
const getRunningContests = async (platform = null) => {
  const url = platform 
    ? `/contests/running?platform=${platform}`
    : '/contests/running';
  const response = await fetch(url);
  return await response.json();
};

// Usage
const running = await getRunningContests();
console.log(`${running.length} contests currently running`);
```

## Use Cases

### Live Contest Banner

```javascript
const LiveContestBanner = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchRunning = async () => {
      const data = await fetch('/contests/running').then(res => res.json());
      setContests(data);
    };

    fetchRunning();
    const interval = setInterval(fetchRunning, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (contests.length === 0) return null;

  return (
    <div className="live-banner">
      <span>🔴 LIVE:</span>
      {contests.map(c => (
        <a key={c.id} href={c.websiteUrl}>{c.name}</a>
      ))}
    </div>
  );
};
```

## Related Endpoints

- [Upcoming Contests](/api/contests/upcoming) - Not yet started
- [Finished Contests](/api/contests/finished) - Already completed

## Notes

- Public endpoint
- Results sorted by start time
- Updates in real-time as contests start/end
- Maximum 50 results (typically few contests running simultaneously)
