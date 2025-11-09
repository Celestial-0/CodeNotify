# List All Contests

Retrieve a paginated list of contests with optional filtering and sorting.

## Endpoint

```http
GET /contests
```

## Authentication

**Optional**: Public endpoint, but authentication provides better rate limits.

## Query Parameters

### Pagination

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of items per page (max: 100) |
| `offset` | number | 0 | Number of items to skip |

### Filtering

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | Filter by platform: `codeforces`, `leetcode`, `codechef`, `atcoder` |
| `phase` | string | Filter by phase: `BEFORE`, `CODING`, `FINISHED` |
| `type` | string | Contest type (platform-specific) |
| `difficulty` | string | Difficulty level: `BEGINNER`, `EASY`, `MEDIUM`, `HARD`, `EXPERT` |
| `isActive` | boolean | Filter active/inactive contests |
| `isNotified` | boolean | Filter notified contests |
| `country` | string | Filter by country |
| `city` | string | Filter by city |
| `startDate` | string | Filter contests starting after this date (ISO 8601) |
| `endDate` | string | Filter contests starting before this date (ISO 8601) |
| `search` | string | Full-text search on name and description |

### Sorting

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | string | `startTime` | Field to sort by: `startTime`, `endTime`, `createdAt`, `name`, `participantCount` |
| `sortOrder` | string | `asc` | Sort direction: `asc` or `desc` |

## Response

### Success (200 OK)

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "platformId": "1234",
      "name": "Educational Codeforces Round 123",
      "platform": "codeforces",
      "phase": "BEFORE",
      "type": "CF",
      "startTime": "2025-01-15T14:35:00.000Z",
      "endTime": "2025-01-15T16:35:00.000Z",
      "durationMinutes": 120,
      "description": "Educational round for Div. 2",
      "websiteUrl": "https://codeforces.com/contest/1234",
      "registrationUrl": "https://codeforces.com/contestRegistration/1234",
      "preparedBy": "Codeforces",
      "difficulty": "MEDIUM",
      "participantCount": 15000,
      "problemCount": 6,
      "country": null,
      "city": null,
      "platformMetadata": {
        "frozen": false,
        "durationSeconds": 7200,
        "relativeTimeSeconds": -86400
      },
      "isActive": true,
      "isNotified": false,
      "lastSyncedAt": "2025-01-14T10:00:00.000Z",
      "createdAt": "2025-01-14T10:00:00.000Z",
      "updatedAt": "2025-01-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Examples

### Basic Request

```bash
curl http://localhost:3000/contests
```

### With Pagination

```bash
curl "http://localhost:3000/contests?limit=50&offset=100"
```

### Filter by Platform

```bash
curl "http://localhost:3000/contests?platform=codeforces"
```

### Filter Upcoming Contests

```bash
curl "http://localhost:3000/contests?phase=BEFORE&sortBy=startTime&sortOrder=asc"
```

### Filter by Difficulty

```bash
curl "http://localhost:3000/contests?difficulty=MEDIUM&platform=leetcode"
```

### Date Range Filter

```bash
curl "http://localhost:3000/contests?startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T23:59:59.999Z"
```

### Full-Text Search

```bash
curl "http://localhost:3000/contests?search=educational"
```

### Complex Query

```bash
curl "http://localhost:3000/contests?platform=codeforces&phase=BEFORE&difficulty=MEDIUM&limit=10&sortBy=startTime&sortOrder=asc"
```

### JavaScript (Fetch)

```javascript
const getContests = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`http://localhost:3000/contests?${queryString}`);
  const data = await response.json();
  return data;
};

// Usage examples
const upcomingContests = await getContests({
  phase: 'BEFORE',
  sortBy: 'startTime',
  sortOrder: 'asc',
  limit: 20
});

const codeforcesContests = await getContests({
  platform: 'codeforces',
  difficulty: 'MEDIUM',
  limit: 50
});

const searchResults = await getContests({
  search: 'educational',
  limit: 10
});
```

### TypeScript with Type Safety

```typescript
interface ContestQueryParams {
  limit?: number;
  offset?: number;
  platform?: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  phase?: 'BEFORE' | 'CODING' | 'FINISHED';
  type?: string;
  difficulty?: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  isActive?: boolean;
  isNotified?: boolean;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'startTime' | 'endTime' | 'createdAt' | 'name' | 'participantCount';
  sortOrder?: 'asc' | 'desc';
}

interface Contest {
  id: string;
  platformId: string;
  name: string;
  platform: string;
  phase: string;
  type: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: string;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata?: Record<string, any>;
  isActive: boolean;
  isNotified: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedResponse {
  data: Contest[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const getContests = async (params: ContestQueryParams): Promise<PaginatedResponse> => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`http://localhost:3000/contests?${queryString}`);
  return response.json();
};
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

const useContests = (params: ContestQueryParams) => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const data = await getContests(params);
        setContests(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [JSON.stringify(params)]);

  return { contests, pagination, loading, error };
};

// Usage in component
const ContestList = () => {
  const { contests, pagination, loading } = useContests({
    platform: 'codeforces',
    phase: 'BEFORE',
    limit: 20
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {contests.map(contest => (
        <div key={contest.id}>{contest.name}</div>
      ))}
      <Pagination {...pagination} />
    </div>
  );
};
```

## Performance Considerations

- Default limit is 20 to optimize response time
- Maximum limit is 100 per request
- Use pagination for large datasets
- Indexes are optimized for common queries:
  - `platform + startTime`
  - `platform + phase`
  - `startTime`
  - `endTime`
  - Full-text search on `name` and `description`

## Related Endpoints

- [Get Contest by ID](/api/contests/get-by-id) - Get single contest
- [Upcoming Contests](/api/contests/upcoming) - Shortcut for upcoming
- [Running Contests](/api/contests/running) - Shortcut for running
- [Finished Contests](/api/contests/finished) - Shortcut for finished
- [Search Contests](/api/contests/search) - Full-text search
- [Filter by Platform](/api/contests/platform) - Platform-specific
