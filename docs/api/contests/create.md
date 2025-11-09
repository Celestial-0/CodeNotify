# Create Contest (Admin)

Create a new contest manually.

## Endpoint

```http
POST /contests
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Request Body

```json
{
  "platformId": "1234",
  "name": "Codeforces Round #900 (Div. 2)",
  "platform": "codeforces",
  "phase": "BEFORE",
  "type": "CF",
  "startTime": "2024-02-15T14:35:00.000Z",
  "endTime": "2024-02-15T16:35:00.000Z",
  "durationMinutes": 120,
  "description": "Educational round",
  "websiteUrl": "https://codeforces.com/contest/1234",
  "registrationUrl": "https://codeforces.com/contestRegistration/1234",
  "difficulty": "MEDIUM",
  "participantCount": 0,
  "problemCount": 6,
  "platformMetadata": {
    "frozen": false
  },
  "isActive": true
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `platformId` | string | Platform-specific ID (unique with platform) |
| `name` | string | Contest name |
| `platform` | string | Platform enum value |
| `phase` | string | Contest phase enum |
| `type` | string | Contest type enum |
| `startTime` | string | Start time (ISO 8601) |
| `endTime` | string | End time (ISO 8601) |
| `durationMinutes` | number | Duration (must be positive) |

### Optional Fields

- `description`, `websiteUrl`, `registrationUrl`, `preparedBy`
- `difficulty`, `participantCount`, `problemCount`
- `country`, `city`, `platformMetadata`
- `isActive` (default: true)

### Validation Rules

- `endTime` must be after `startTime`
- `durationMinutes` must be positive
- URLs must be valid format
- `platformId` + `platform` combination must be unique

## Response

### Success (201 Created)

```json
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
  "isActive": true,
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request

Validation error.

```json
{
  "statusCode": 400,
  "message": ["End time must be after start time"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

Missing or invalid token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

Not an admin user.

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 409 Conflict

Duplicate contest (same platformId + platform).

```json
{
  "statusCode": 409,
  "message": "Contest with platformId 1234 already exists for codeforces"
}
```

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/contests \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "platformId": "1234",
    "name": "Test Contest",
    "platform": "codeforces",
    "phase": "BEFORE",
    "type": "CF",
    "startTime": "2024-02-15T14:35:00.000Z",
    "endTime": "2024-02-15T16:35:00.000Z",
    "durationMinutes": 120
  }'
```

### JavaScript

```javascript
const createContest = async (contestData, adminToken) => {
  const response = await fetch('http://localhost:3000/contests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contestData)
  });

  if (!response.ok) {
    throw new Error('Failed to create contest');
  }

  return await response.json();
};
```

## Notes

- **Admin only** - Requires admin role
- Returns 201 Created on success
- Duplicate check on platformId + platform
- `lastSyncedAt` automatically set to current time
