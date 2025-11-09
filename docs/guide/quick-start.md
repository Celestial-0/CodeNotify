# Quick Start

Get started with CodeNotify API in 5 minutes.

## Prerequisites

- CodeNotify Server installed and running
- API accessible at `http://localhost:3000`
- HTTP client (cURL, Postman, or Thunder Client)

## Step 1: Verify Server is Running

```bash
curl http://localhost:3000/contests/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:00:00.000Z"
}
```

✅ Server is running!

## Step 2: Create an Account

### Sign Up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }'
```

Response:
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ Account created! Save your tokens.

## Step 3: Get Your Profile

Use the access token from signup:

```bash
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your_access_token>"
```

Response:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "alertFrequency": "daily",
    "contestTypes": [],
    "notificationChannels": ["email"],
    "notifyBefore": 24
  },
  "isActive": true,
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z"
}
```

✅ Profile retrieved!

## Step 4: Browse Contests

### Get Upcoming Contests

```bash
curl http://localhost:3000/contests/upcoming
```

Response:
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "platformId": "1234",
    "name": "Codeforces Round #900 (Div. 2)",
    "platform": "codeforces",
    "phase": "BEFORE",
    "type": "CF",
    "startTime": "2024-02-16T14:35:00.000Z",
    "endTime": "2024-02-16T16:35:00.000Z",
    "durationMinutes": 120,
    "difficulty": "MEDIUM",
    "websiteUrl": "https://codeforces.com/contest/1234"
  }
]
```

### Filter by Platform

```bash
curl "http://localhost:3000/contests/upcoming?platform=leetcode"
```

### Search Contests

```bash
curl "http://localhost:3000/contests/search?q=weekly"
```

✅ Contests retrieved!

## Step 5: Update Preferences

Customize your notification preferences:

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "platforms": ["codeforces", "leetcode", "codechef"],
      "notificationChannels": ["email", "whatsapp"],
      "notifyBefore": 48
    }
  }'
```

Response:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": {
    "platforms": ["codeforces", "leetcode", "codechef"],
    "alertFrequency": "daily",
    "contestTypes": [],
    "notificationChannels": ["email", "whatsapp"],
    "notifyBefore": 48
  }
}
```

✅ Preferences updated!

## Complete Workflow Example

Here's a complete JavaScript example:

```javascript
const BASE_URL = 'http://localhost:3000';

// 1. Sign up
const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  })
});

const { accessToken, refreshToken } = await signupResponse.json();

// 2. Get profile
const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const profile = await profileResponse.json();
console.log('Profile:', profile);

// 3. Get upcoming contests
const contestsResponse = await fetch(`${BASE_URL}/contests/upcoming`);
const contests = await contestsResponse.json();
console.log('Upcoming contests:', contests.length);

// 4. Update preferences
const updateResponse = await fetch(`${BASE_URL}/users/profile`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      notificationChannels: ['email'],
      notifyBefore: 24
    }
  })
});

const updated = await updateResponse.json();
console.log('Preferences updated:', updated.preferences);
```

## Common Operations

### Sign In (Existing User)

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Refresh Access Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your_refresh_token>"
  }'
```

### Get Contest Statistics

```bash
curl http://localhost:3000/contests/stats
```

### Filter by Difficulty

```bash
curl http://localhost:3000/contests/difficulty/MEDIUM
```

## Token Management

### Access Token
- **Validity**: 15 minutes
- **Use**: All authenticated requests
- **Refresh**: Use refresh token when expired

### Refresh Token
- **Validity**: 7 days
- **Use**: Get new access token
- **Storage**: Secure storage (httpOnly cookie recommended)

### Token Refresh Flow

```javascript
let accessToken = 'your_access_token';
let refreshToken = 'your_refresh_token';

async function makeAuthenticatedRequest(url) {
  let response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const { accessToken: newAccessToken } = await refreshResponse.json();
    accessToken = newAccessToken;

    // Retry original request
    response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
  }

  return response.json();
}
```

## Testing with Postman

### 1. Import Collection

Create a new collection with these requests:

**Auth**:
- POST `/auth/signup`
- POST `/auth/signin`
- POST `/auth/refresh`
- POST `/auth/signout`

**Users**:
- GET `/users/profile`
- PUT `/users/profile`

**Contests**:
- GET `/contests/upcoming`
- GET `/contests/search?q=query`
- GET `/contests/platform/codeforces`

### 2. Set Environment Variables

```json
{
  "baseUrl": "http://localhost:3000",
  "accessToken": "",
  "refreshToken": ""
}
```

### 3. Use Variables

```
{{baseUrl}}/users/profile
Authorization: Bearer {{accessToken}}
```

## Next Steps

Now that you've completed the quick start:

1. **[Configuration](/guide/configuration)** - Advanced configuration options
2. **[Authentication Flow](/guide/authentication)** - Deep dive into auth
3. **[API Reference](/api/overview)** - Explore all endpoints
4. **[Architecture](/guide/architecture)** - Understand the system

## Troubleshooting

### 401 Unauthorized

- Check if access token is valid
- Token may have expired (15 min validity)
- Use refresh token to get new access token

### 404 Not Found

- Verify endpoint URL is correct
- Check if server is running on correct port

### 400 Bad Request

- Verify request body format
- Check required fields are provided
- Validate data types match schema

## Resources

- [API Documentation](/api/overview)
- [Authentication Guide](/guide/authentication)
- [Error Codes](/api/errors)
