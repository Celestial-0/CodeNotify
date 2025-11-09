# Filter Contests by Platform

Get contests from a specific platform with optional filtering.

## Endpoint

```http
GET /contests/platform/:platform
```

## Authentication

**Not required** - Public endpoint

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Platform name (codeforces, leetcode, codechef, atcoder) |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `phase` | string | Filter by phase |
| `type` | string | Filter by contest type |
| `difficulty` | string | Filter by difficulty |
| `limit` | number | Max results (default: 50) |

## Examples

```bash
# All Codeforces contests
curl http://localhost:3000/contests/platform/codeforces

# LeetCode weekly contests only
curl "http://localhost:3000/contests/platform/leetcode?type=WEEKLY"

# CodeChef medium difficulty
curl "http://localhost:3000/contests/platform/codechef?difficulty=MEDIUM"
```

## Response

Returns array of contests sorted by start time.

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
    "isActive": true
  }
]
```

## Platform Values

- `codeforces` - Codeforces contests
- `leetcode` - LeetCode contests
- `codechef` - CodeChef contests
- `atcoder` - AtCoder contests

## Related Endpoints

- [Upcoming](/api/contests/upcoming) - Upcoming contests (all platforms)
- [Search](/api/contests/search) - Search contests
