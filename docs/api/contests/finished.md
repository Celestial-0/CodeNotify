# Get Finished Contests

Get contests that have already ended.

## Endpoint

```http
GET /contests/finished
```

## Authentication

**Not required** - Public endpoint

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | No | Filter by platform (codeforces, leetcode, codechef, atcoder) |

## Response

### Success (200 OK)

Returns an array of finished contests sorted by end time (most recent first).

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "platformId": "1234",
    "name": "Codeforces Round #899 (Div. 2)",
    "platform": "codeforces",
    "phase": "FINISHED",
    "type": "CF",
    "startTime": "2024-02-14T14:35:00.000Z",
    "endTime": "2024-02-14T16:35:00.000Z",
    "durationMinutes": 120,
    "participantCount": 18000,
    "isActive": true,
    "createdAt": "2024-02-13T10:00:00.000Z",
    "updatedAt": "2024-02-14T16:35:00.000Z"
  }
]
```

## Filtering Logic

**Finished contests** are defined as:
- `endTime < now` (already ended)
- `isActive = true`

## Sorting

Results are sorted by `endTime` in descending order (most recently finished first).

## Limit

Maximum 50 contests returned.

## Examples

### cURL

```bash
# All finished contests
curl http://localhost:3000/contests/finished

# LeetCode only
curl "http://localhost:3000/contests/finished?platform=leetcode"
```

### JavaScript

```javascript
const getFinishedContests = async (platform = null) => {
  const url = platform 
    ? `/contests/finished?platform=${platform}`
    : '/contests/finished';
  const response = await fetch(url);
  return await response.json();
};
```

## Use Cases

### Contest History

```javascript
const ContestHistory = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetch('/contests/finished')
      .then(res => res.json())
      .then(data => setContests(data));
  }, []);

  return (
    <div>
      <h2>Recent Contests</h2>
      {contests.map(contest => (
        <div key={contest.id}>
          <h3>{contest.name}</h3>
          <p>Ended: {new Date(contest.endTime).toLocaleString()}</p>
          <p>Participants: {contest.participantCount}</p>
        </div>
      ))}
    </div>
  );
};
```

## Related Endpoints

- [Upcoming Contests](/api/contests/upcoming) - Not yet started
- [Running Contests](/api/contests/running) - Currently active

## Notes

- Public endpoint
- Sorted by end time (most recent first)
- Old contests (>90 days) are automatically cleaned up daily
- Maximum 50 results
