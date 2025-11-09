# Bulk Create Contests (Admin)

Create multiple contests in a single request.

## Endpoint

```http
POST /contests/bulk
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Request Body

```json
{
  "contests": [
    {
      "platformId": "1234",
      "name": "Contest 1",
      "platform": "codeforces",
      "phase": "BEFORE",
      "type": "CF",
      "startTime": "2024-02-15T14:35:00.000Z",
      "endTime": "2024-02-15T16:35:00.000Z",
      "durationMinutes": 120
    },
    {
      "platformId": "5678",
      "name": "Contest 2",
      "platform": "leetcode",
      "phase": "UPCOMING",
      "type": "WEEKLY",
      "startTime": "2024-02-16T02:30:00.000Z",
      "endTime": "2024-02-16T04:00:00.000Z",
      "durationMinutes": 90
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contests` | array | Yes | Array of contest objects (1-100) |

Each contest object follows the same validation as [Create Contest](/api/contests/create).

### Limits

- **Minimum**: 1 contest
- **Maximum**: 100 contests per request

## Response

### Success (201 Created)

Returns array of created contests.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "platformId": "1234",
    "name": "Contest 1",
    "platform": "codeforces",
    "createdAt": "2024-02-15T10:00:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "platformId": "5678",
    "name": "Contest 2",
    "platform": "leetcode",
    "createdAt": "2024-02-15T10:00:00.000Z"
  }
]
```

## Error Responses

### 400 Bad Request

Validation error.

```json
{
  "statusCode": 400,
  "message": ["contests must contain at least 1 element"],
  "error": "Bad Request"
}
```

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

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/contests/bulk \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contests": [
      {
        "platformId": "1234",
        "name": "Test Contest 1",
        "platform": "codeforces",
        "phase": "BEFORE",
        "type": "CF",
        "startTime": "2024-02-15T14:35:00.000Z",
        "endTime": "2024-02-15T16:35:00.000Z",
        "durationMinutes": 120
      },
      {
        "platformId": "5678",
        "name": "Test Contest 2",
        "platform": "leetcode",
        "phase": "UPCOMING",
        "type": "WEEKLY",
        "startTime": "2024-02-16T02:30:00.000Z",
        "endTime": "2024-02-16T04:00:00.000Z",
        "durationMinutes": 90
      }
    ]
  }'
```

### JavaScript

```javascript
const bulkCreateContests = async (contests, adminToken) => {
  const response = await fetch('http://localhost:3000/contests/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contests })
  });

  if (!response.ok) {
    throw new Error('Failed to bulk create contests');
  }

  return await response.json();
};

// Usage
const contests = [
  {
    platformId: '1234',
    name: 'Contest 1',
    platform: 'codeforces',
    phase: 'BEFORE',
    type: 'CF',
    startTime: '2024-02-15T14:35:00.000Z',
    endTime: '2024-02-15T16:35:00.000Z',
    durationMinutes: 120
  },
  // ... more contests
];

const created = await bulkCreateContests(contests, adminToken);
console.log(`Created ${created.length} contests`);
```

## Bulk Insert Behavior

- Uses MongoDB `insertMany` with `ordered: false`
- Continues inserting even if some documents fail (duplicates)
- Duplicate contests (same platformId + platform) are skipped
- Returns only successfully created contests

## Use Cases

### Import from External Source

```javascript
const importContests = async (externalData, adminToken) => {
  const contests = externalData.map(item => ({
    platformId: item.id,
    name: item.title,
    platform: item.source,
    phase: 'BEFORE',
    type: item.contestType,
    startTime: item.start,
    endTime: item.end,
    durationMinutes: item.duration
  }));

  return await bulkCreateContests(contests, adminToken);
};
```

### Batch Import

```javascript
// Split large datasets into batches of 100
const batchImport = async (allContests, adminToken) => {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < allContests.length; i += batchSize) {
    const batch = allContests.slice(i, i + batchSize);
    const created = await bulkCreateContests(batch, adminToken);
    results.push(...created);
  }

  return results;
};
```

## Notes

- **Admin only**
- Returns 201 Created on success
- Maximum 100 contests per request
- Duplicates are skipped (not an error)
- `lastSyncedAt` automatically set for all contests
- More efficient than multiple single create requests
