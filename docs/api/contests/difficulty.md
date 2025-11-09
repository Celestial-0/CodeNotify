# Filter by Difficulty

Get contests filtered by difficulty level.

## Endpoint

```http
GET /contests/difficulty/:level
```

## Authentication

**Not required** - Public endpoint

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `level` | string | Yes | Difficulty level |

## Difficulty Levels

- `BEGINNER` - Beginner-friendly contests
- `EASY` - Easy level
- `MEDIUM` - Medium difficulty
- `HARD` - Hard difficulty
- `EXPERT` - Expert level

## Examples

```bash
# Beginner contests
curl http://localhost:3000/contests/difficulty/BEGINNER

# Medium difficulty
curl http://localhost:3000/contests/difficulty/MEDIUM

# Expert level
curl http://localhost:3000/contests/difficulty/EXPERT
```

## Response

Returns array of contests with specified difficulty, sorted by start time.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "AtCoder Beginner Contest 340",
    "platform": "atcoder",
    "difficulty": "BEGINNER",
    "type": "ABC",
    "startTime": "2024-02-15T14:00:00.000Z",
    "endTime": "2024-02-15T15:40:00.000Z",
    "isActive": true
  }
]
```

## Notes

- Maximum 50 results
- Only active contests returned
- Not all contests have difficulty assigned
