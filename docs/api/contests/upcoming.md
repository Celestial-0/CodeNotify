# Get Upcoming Contests

Get all contests that haven't started yet.

## Endpoint

```http
GET /contests/upcoming
```

## Authentication

**Not required** - Public endpoint

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | No | Filter by platform (codeforces, leetcode, codechef, atcoder) |

## Request

No request body required.

### Example URLs

```
GET /contests/upcoming
GET /contests/upcoming?platform=codeforces
GET /contests/upcoming?platform=leetcode
```

## Response

### Success (200 OK)

Returns an array of upcoming contests sorted by start time (earliest first).

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "platformId": "1234",
    "name": "Codeforces Round #900 (Div. 2)",
    "platform": "codeforces",
    "phase": "BEFORE",
    "type": "CF",
    "startTime": "2024-02-15T14:35:00.000Z",
    "endTime": "2024-02-15T16:35:00.000Z",
    "durationMinutes": 120,
    "difficulty": "MEDIUM",
    "participantCount": 0,
    "problemCount": 6,
    "websiteUrl": "https://codeforces.com/contest/1234",
    "isActive": true,
    "isNotified": false,
    "createdAt": "2024-02-14T10:00:00.000Z",
    "updatedAt": "2024-02-14T10:00:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "platformId": "weekly-380",
    "name": "Weekly Contest 380",
    "platform": "leetcode",
    "phase": "UPCOMING",
    "type": "WEEKLY",
    "startTime": "2024-02-16T02:30:00.000Z",
    "endTime": "2024-02-16T04:00:00.000Z",
    "durationMinutes": 90,
    "difficulty": "MEDIUM",
    "websiteUrl": "https://leetcode.com/contest/weekly-contest-380",
    "isActive": true,
    "isNotified": false,
    "createdAt": "2024-02-14T10:00:00.000Z",
    "updatedAt": "2024-02-14T10:00:00.000Z"
  }
]
```

## Filtering Logic

**Upcoming contests** are defined as:
- `startTime > now` (current server time)
- `isActive = true`

## Sorting

Results are sorted by `startTime` in ascending order (earliest contests first).

## Limit

Maximum 50 contests returned. Use the main list endpoint with pagination for more results.

## Examples

### Get All Upcoming Contests

```bash
curl http://localhost:3000/contests/upcoming
```

### Filter by Platform

```bash
# Codeforces only
curl http://localhost:3000/contests/upcoming?platform=codeforces

# LeetCode only
curl http://localhost:3000/contests/upcoming?platform=leetcode
```

### JavaScript (Fetch)

```javascript
const getUpcomingContests = async (platform = null) => {
  const url = platform 
    ? `http://localhost:3000/contests/upcoming?platform=${platform}`
    : 'http://localhost:3000/contests/upcoming';
    
  const response = await fetch(url);
  return await response.json();
};

// Usage
const allUpcoming = await getUpcomingContests();
const codeforcesUpcoming = await getUpcomingContests('codeforces');
```

### React Component

```typescript
import { useState, useEffect } from 'react';

const UpcomingContests = () => {
  const [contests, setContests] = useState([]);
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      const url = platform 
        ? `/contests/upcoming?platform=${platform}`
        : '/contests/upcoming';
      
      const response = await fetch(url);
      const data = await response.json();
      setContests(data);
      setLoading(false);
    };

    fetchContests();
  }, [platform]);

  return (
    <div>
      <h1>Upcoming Contests</h1>
      
      <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <option value="">All Platforms</option>
        <option value="codeforces">Codeforces</option>
        <option value="leetcode">LeetCode</option>
        <option value="codechef">CodeChef</option>
        <option value="atcoder">AtCoder</option>
      </select>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {contests.map(contest => (
            <li key={contest.id}>
              <h3>{contest.name}</h3>
              <p>Platform: {contest.platform}</p>
              <p>Starts: {new Date(contest.startTime).toLocaleString()}</p>
              <p>Duration: {contest.durationMinutes} minutes</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### Python (Requests)

```python
import requests

def get_upcoming_contests(platform=None):
    url = 'http://localhost:3000/contests/upcoming'
    params = {'platform': platform} if platform else {}
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
all_contests = get_upcoming_contests()
codeforces_contests = get_upcoming_contests('codeforces')

for contest in all_contests:
    print(f"{contest['name']} - {contest['platform']}")
    print(f"Starts: {contest['startTime']}")
```

## Use Cases

### Contest Calendar

Display upcoming contests in a calendar view:

```javascript
const ContestCalendar = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetch('/contests/upcoming')
      .then(res => res.json())
      .then(data => setContests(data));
  }, []);

  const groupByDate = (contests) => {
    return contests.reduce((acc, contest) => {
      const date = new Date(contest.startTime).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(contest);
      return acc;
    }, {});
  };

  const grouped = groupByDate(contests);

  return (
    <div>
      {Object.entries(grouped).map(([date, contests]) => (
        <div key={date}>
          <h2>{date}</h2>
          {contests.map(contest => (
            <div key={contest.id}>{contest.name}</div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Notification Setup

Find contests starting soon:

```javascript
const findContestsStartingSoon = async (hours = 24) => {
  const contests = await fetch('/contests/upcoming').then(res => res.json());
  const now = Date.now();
  const threshold = hours * 60 * 60 * 1000;

  return contests.filter(contest => {
    const timeUntilStart = new Date(contest.startTime) - now;
    return timeUntilStart <= threshold;
  });
};

// Get contests starting in next 24 hours
const soon = await findContestsStartingSoon(24);
```

## Related Endpoints

- [Running Contests](/api/contests/running) - Currently active
- [Finished Contests](/api/contests/finished) - Completed contests
- [Filter by Platform](/api/contests/platform) - Platform-specific with more options
- [List All](/api/contests/list) - Paginated list with filtering

## Notes

- Public endpoint (no authentication required)
- Maximum 50 results returned
- Sorted by start time (earliest first)
- Only returns active contests (`isActive: true`)
- Platform parameter is optional
- Results update as contests are synced (every 6 hours)
