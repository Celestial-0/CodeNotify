# Filter by Contest Type

Get contests filtered by type.

## Endpoint

```http
GET /contests/type/:type
```

## Authentication

**Not required** - Public endpoint

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Contest type |

## Contest Types

### Codeforces
- `CF` - Codeforces Round
- `IOI` - IOI-style
- `ICPC` - ICPC-style

### LeetCode
- `WEEKLY` - Weekly Contest
- `BIWEEKLY` - Biweekly Contest

### CodeChef
- `LONG` - Long Challenge
- `COOK_OFF` - Cook-Off
- `LUNCH_TIME` - Lunchtime
- `STARTERS` - Starters

### AtCoder
- `ABC` - Beginner Contest
- `ARC` - Regular Contest
- `AGC` - Grand Contest
- `AHC` - Heuristic Contest

## Examples

```bash
# Codeforces rounds
curl http://localhost:3000/contests/type/CF

# LeetCode weekly
curl http://localhost:3000/contests/type/WEEKLY

# AtCoder ABC
curl http://localhost:3000/contests/type/ABC
```

## Response

Returns array of contests with specified type, sorted by start time.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Weekly Contest 380",
    "platform": "leetcode",
    "type": "WEEKLY",
    "startTime": "2024-02-16T02:30:00.000Z",
    "endTime": "2024-02-16T04:00:00.000Z",
    "isActive": true
  }
]
```

## Notes

- Maximum 50 results
- Only active contests
- Types are platform-specific
