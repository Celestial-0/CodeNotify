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
  refreshToken: string;  // Valid refresh token (contains user ID in payload)
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

**Important**: Both access token and refresh token are regenerated (token rotation for enhanced security).

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
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (!response.ok) {
    // Refresh token expired or invalid, redirect to signin
    window.location.href = '/signin';
    return null;
  }
  
  const { accessToken, refreshToken: newRefreshToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken); // Store new refresh token
  
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
- **Login/Register**: Generate NEW access token (15min) + NEW refresh token (7 days)
- **POST /auth/refresh**: Generate NEW access token (15min) + NEW refresh token (7 days)
  - Old refresh token is invalidated
  - New refresh token extends session by another 7 days
- **Access token expires**: Client calls /auth/refresh to get new tokens
- **Refresh token expires** (after 7 days of inactivity): User must signin again

### Why Token Rotation?

Modern JWT best practice uses refresh token rotation:
- **Enhanced security**: Each refresh invalidates the old token
- **Compromise detection**: If old token is reused, it indicates potential theft
- **Extended sessions**: Active users get rolling 7-day sessions
- **Auto-logout**: Inactive users (7+ days) must re-authenticate

### Security Verification

```typescript
// 1. Verify refresh token signature with JWT_REFRESH_SECRET
const payload = await jwtService.verifyAsync(refreshToken, {
  secret: JWT_REFRESH_SECRET
});

// 2. Verify token matches stored token (single-use)
if (user.refreshToken !== refreshToken) {
  throw new UnauthorizedException('Invalid refresh token');
}

// 3. Generate new tokens and update stored refresh token
const newTokens = await generateTokens(user.id, user.email, user.role);
await updateRefreshToken(user.id, newTokens.refreshToken);
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
