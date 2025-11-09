# Update Contest (Admin)

Update an existing contest.

## Endpoint

```http
PATCH /contests/:id
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Contest MongoDB ObjectId |

## Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "name": "Updated Contest Name",
  "phase": "CODING",
  "startTime": "2024-02-15T15:00:00.000Z",
  "participantCount": 15000,
  "isActive": true
}
```

### Updatable Fields

- `name`, `phase`, `type`
- `startTime`, `endTime`, `durationMinutes`
- `description`, `websiteUrl`, `registrationUrl`, `preparedBy`
- `difficulty`, `participantCount`, `problemCount`
- `country`, `city`, `platformMetadata`
- `isActive`, `isNotified`

### Validation

- If both `startTime` and `endTime` provided, `endTime` must be after `startTime`
- `durationMinutes` must be positive if provided
- URLs must be valid format

## Response

### Success (200 OK)

Returns the updated contest.

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Updated Contest Name",
  "phase": "CODING",
  "startTime": "2024-02-15T15:00:00.000Z",
  "participantCount": 15000,
  "updatedAt": "2024-02-15T15:05:00.000Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["End time must be after start time"]
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

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Contest with ID 507f1f77bcf86cd799439011 not found"
}
```

## Examples

### cURL

```bash
curl -X PATCH http://localhost:3000/contests/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "participantCount": 15000,
    "phase": "CODING"
  }'
```

### JavaScript

```javascript
const updateContest = async (id, updates, adminToken) => {
  const response = await fetch(`http://localhost:3000/contests/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error('Failed to update contest');
  }

  return await response.json();
};

// Usage
await updateContest('507f1f77bcf86cd799439011', {
  participantCount: 15000,
  phase: 'CODING'
}, adminToken);
```

## Notes

- **Admin only**
- Partial updates supported
- `updatedAt` automatically updated
- Cannot change `platformId` or `platform` (unique constraint)
