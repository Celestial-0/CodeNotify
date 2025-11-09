# API Overview

CodeNotify provides a comprehensive RESTful API for managing competitive programming contest notifications across multiple platforms.

## Base URL

```
Development: http://localhost:3000
Production: https://api.codenotify.dev
```

## API Version

Current version: **v1** (no version prefix in URL)

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer <your_access_token>
```

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

## Request Format

### Headers

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Body

All POST/PATCH requests accept JSON payloads:

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## Response Format

### Success Response

```json
{
  "id": "string",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user
- **Admin**: Unlimited

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints returning lists support pagination:

```http
GET /contests?limit=20&offset=0
```

**Parameters:**
- `limit` (default: 20, max: 100) - Number of items per page
- `offset` (default: 0) - Number of items to skip

## Filtering & Sorting

### Filtering

```http
GET /contests?platform=codeforces&phase=BEFORE&difficulty=MEDIUM
```

### Sorting

```http
GET /contests?sortBy=startTime&sortOrder=asc
```

**Parameters:**
- `sortBy` - Field to sort by (e.g., startTime, createdAt)
- `sortOrder` - Sort direction: `asc` or `desc`

## Search

Full-text search on supported endpoints:

```http
GET /contests/search?q=educational
```

## Timestamps

All timestamps are in ISO 8601 format (UTC):

```
2025-01-01T12:00:00.000Z
```

## Enums

### ContestPlatform

```typescript
enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder'
}
```

### ContestPhase

```typescript
enum ContestPhase {
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  FINISHED = 'FINISHED'
}
```

### DifficultyLevel

```typescript
enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}
```

### UserRole

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
```

## API Modules

### Authentication
- [Sign Up](/api/auth/signup) - Create new user account
- [Sign In](/api/auth/signin) - Authenticate user
- [Refresh Token](/api/auth/refresh) - Get new access token
- [Sign Out](/api/auth/signout) - Invalidate tokens

### Users
- [Get Profile](/api/users/profile) - Get current user profile
- [Update Profile](/api/users/update-profile) - Update user information
- [Delete Account](/api/users/delete) - Delete user account

### Contests
- [List Contests](/api/contests/list) - Get all contests with pagination
- [Get Contest](/api/contests/get-by-id) - Get contest by ID
- [Filter by Platform](/api/contests/platform) - Platform-specific contests
- [Upcoming Contests](/api/contests/upcoming) - Get upcoming contests
- [Running Contests](/api/contests/running) - Get active contests
- [Finished Contests](/api/contests/finished) - Get past contests
- [Search Contests](/api/contests/search) - Full-text search
- [Contest Statistics](/api/contests/stats) - Analytics and insights
- [Sync Contests](/api/contests/sync) - Trigger platform sync (admin)

### Notifications
- [Get Notifications](/api/notifications/history) - List user notifications
- [Mark as Read](/api/notifications/mark-as-read) - Mark notification as read
- [Test Email](/api/notifications/test-email) - Send test email notification

## Examples

### cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get contests
curl -X GET http://localhost:3000/contests \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript (Fetch)

```javascript
// Login
const response = await fetch('http://localhost:3000/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { accessToken } = await response.json();

// Get contests
const contests = await fetch('http://localhost:3000/contests', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Python (Requests)

```python
import requests

# Login
response = requests.post('http://localhost:3000/auth/signin', json={
    'email': 'user@example.com',
    'password': 'password123'
})
access_token = response.json()['accessToken']

# Get contests
contests = requests.get('http://localhost:3000/contests', headers={
    'Authorization': f'Bearer {access_token}'
})
```

## Webhooks

Subscribe to real-time events:

- `contest.created` - New contest added
- `contest.starting` - Contest starting soon
- `contest.finished` - Contest ended
- `notification.sent` - Notification delivered

## Support

- **Documentation**: https://docs.codenotify.dev
- **GitHub**: https://github.com/Celestial-0/codenotify
- **Issues**: https://github.com/Celestial-0/codenotify/issues

## Changelog

### v0.0.1 (2025-01-01)
- Initial API release
- Multi-platform contest aggregation
- JWT authentication
- Multi-channel notifications
- Advanced filtering and search
