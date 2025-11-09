# Refresh Token

Obtain a new access token using a refresh token.

## Endpoint

```http
POST /auth/refresh
```

## Authentication

No authentication required (public endpoint).

## Request Body

```typescript
{
  userId: string;        // User's ID
  refreshToken: string;  // Valid refresh token
}
```

## Response

### Success (200 OK)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important**: The refresh token returned is the **same** token you sent. Only the access token is regenerated.

## Error Responses

### 401 Unauthorized - Invalid Token

```json
{
  "statusCode": 401,
  "message": "Access denied",
  "error": "Unauthorized"
}
```

## Examples

### JavaScript (Fetch)

```javascript
const refreshAccessToken = async () => {
  const userId = localStorage.getItem('userId');
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, refreshToken })
  });
  
  if (!response.ok) {
    // Refresh token expired, redirect to signin
    window.location.href = '/signin';
    return null;
  }
  
  const { accessToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
  
  return accessToken;
};

// Automatic token refresh
const apiCall = async (url, options = {}) => {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  // If 401, try refreshing token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }
      });
    }
  }
  
  return response;
};
```

## Implementation Details

### Token Rotation Strategy

**Correct Behavior** (as implemented):
- Login/Register: Generate NEW access token (15min) + NEW refresh token (7 days)
- /refresh-token: Generate NEW access token (15min) + return SAME refresh token
- Access token expires: Client calls /refresh-token to get new access token
- Refresh token expires (after 7 days): User must signin again

### Why Same Refresh Token?

This prevents refresh token rotation issues:
- Simpler client-side logic
- No race conditions with multiple tabs
- Refresh token only changes on signin
- 7-day session duration is maintained

### Security Verification

```typescript
// Verify refresh token matches stored hash
const refreshTokenMatches = await bcrypt.compare(
  refreshToken,
  user.refreshToken
);
```

## Best Practices

### Client-Side Implementation

```javascript
// Check token expiry before each request
const isTokenExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};

// Refresh if needed
if (isTokenExpired(accessToken)) {
  await refreshAccessToken();
}
```

### Axios Interceptor

```javascript
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return axios(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

## Related Endpoints

- [Sign In](/api/auth/signin) - Get initial tokens
- [Sign Out](/api/auth/signout) - Invalidate tokens
