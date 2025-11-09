# Contest Statistics

Get overall contest statistics across all platforms.

## Endpoint

```http
GET /contests/stats
```

## Authentication

**Not required** - Public endpoint

## Response

### Success (200 OK)

```json
{
  "totalContests": 1250,
  "upcomingContests": 45,
  "runningContests": 2,
  "finishedContests": 1203,
  "platformBreakdown": {
    "codeforces": 450,
    "leetcode": 380,
    "codechef": 220,
    "atcoder": 200
  },
  "typeBreakdown": {
    "CF": 350,
    "WEEKLY": 180,
    "BIWEEKLY": 200,
    "LONG": 80,
    "ABC": 150,
    "ARC": 50
  },
  "difficultyBreakdown": {
    "BEGINNER": 200,
    "EASY": 150,
    "MEDIUM": 600,
    "HARD": 250,
    "EXPERT": 50
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalContests` | number | Total active contests in database |
| `upcomingContests` | number | Contests not yet started |
| `runningContests` | number | Contests currently in progress |
| `finishedContests` | number | Contests that have ended |
| `platformBreakdown` | object | Count by platform |
| `typeBreakdown` | object | Count by contest type |
| `difficultyBreakdown` | object | Count by difficulty level |

## Examples

### cURL

```bash
curl http://localhost:3000/contests/stats
```

### JavaScript

```javascript
const getStats = async () => {
  const response = await fetch('http://localhost:3000/contests/stats');
  return await response.json();
};

// Usage
const stats = await getStats();
console.log(`Total contests: ${stats.totalContests}`);
console.log(`Upcoming: ${stats.upcomingContests}`);
```

### React Dashboard

```typescript
import { useState, useEffect } from 'react';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/contests/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Contest Statistics</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalContests}</h2>
          <p>Total Contests</p>
        </div>
        <div className="stat-card">
          <h2>{stats.upcomingContests}</h2>
          <p>Upcoming</p>
        </div>
        <div className="stat-card">
          <h2>{stats.runningContests}</h2>
          <p>Running Now</p>
        </div>
        <div className="stat-card">
          <h2>{stats.finishedContests}</h2>
          <p>Finished</p>
        </div>
      </div>

      <h2>By Platform</h2>
      <ul>
        {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
          <li key={platform}>{platform}: {count}</li>
        ))}
      </ul>

      <h2>By Difficulty</h2>
      <ul>
        {Object.entries(stats.difficultyBreakdown).map(([level, count]) => (
          <li key={level}>{level}: {count}</li>
        ))}
      </ul>
    </div>
  );
};
```

## Use Cases

### Analytics Dashboard

Display key metrics and trends.

### Platform Comparison

Compare contest availability across platforms.

### Difficulty Distribution

Visualize contest difficulty levels.

## Related Endpoints

- [Platform Stats](/api/contests/platform-stats) - Platform-specific statistics
- [List Contests](/api/contests/list) - Detailed contest list

## Notes

- Public endpoint
- Counts only active contests (`isActive: true`)
- Updated in real-time as contests are synced
- Breakdowns may have empty categories if no contests exist
