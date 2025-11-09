# Authentication Overview

Complete guide to authentication in CodeNotify API.

## Authentication Method

CodeNotify uses **JWT (JSON Web Tokens)** for stateless authentication with refresh token rotation.

### Token Types

| Token | Purpose | Expiry | Storage |
|-------|---------|--------|---------|
| **Access Token** | API authentication | 15 minutes | Client memory/state |
| **Refresh Token** | Token renewal | 7 days | Secure storage (httpOnly cookie recommended) |

## Authentication Flow

### Initial Authentication

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /auth/signup or /auth/signin
    API->>Database: Verify credentials
    Database-->>API: User data
    API->>API: Generate tokens (15min + 7day)
    API->>Database: Store hashed refresh token
    API-->>Client: { user, accessToken, refreshToken }
    Client->>Client: Store tokens
```

### Making Authenticated Requests

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant JwtGuard
    participant Controller

    Client->>API: GET /users/profile<br/>Authorization: Bearer <accessToken>
    API->>JwtGuard: Validate token
    JwtGuard->>JwtGuard: Verify signature<br/>Check expiration<br/>Load user
    JwtGuard-->>API: User object
    API->>Controller: Execute with user context
    Controller-->>Client: Protected resource
```

### Token Refresh Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /auth/refresh<br/>{ userId, refreshToken }
    API->>Database: Get user & verify token
    Database-->>API: User with hashed refresh token
    API->>API: Compare tokens (bcrypt)
    API->>API: Generate NEW access token
    API-->>Client: { accessToken (NEW), refreshToken (SAME) }
    Client->>Client: Update access token
```

## Endpoints

### 1. Sign Up

**Endpoint**: `POST /auth/signup`  
**Access**: Public

Create a new user account and receive authentication tokens.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phoneNumber": "+1234567890"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

[Full Documentation →](/api/auth/signup)

### 2. Sign In

**Endpoint**: `POST /auth/signin`  
**Access**: Public

Authenticate with existing credentials and receive tokens.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

[Full Documentation →](/api/auth/signin)

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`  
**Access**: Public

Obtain a new access token using a valid refresh token.

**Request**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: Refresh token returned is the SAME token you sent. Only access token is regenerated.

[Full Documentation →](/api/auth/refresh)

### 4. Sign Out

**Endpoint**: `POST /auth/signout`  
**Access**: Protected (JWT required)

Invalidate refresh token and end session.

**Request**: No body (user from JWT)

**Response** (200):
```json
{
  "message": "Successfully signed out"
}
```

[Full Documentation →](/api/auth/signout)

## Using Authentication

### Include Access Token

All protected endpoints require the access token in the Authorization header:

```http
GET /users/profile HTTP/1.1
Host: api.codenotify.dev
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Format

```
Authorization: Bearer <access_token>
```

- **Scheme**: `Bearer`
- **Token**: JWT access token (no quotes)
- **Separator**: Single space

### Example Requests

#### cURL

```bash
curl -X GET https://api.codenotify.dev/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### JavaScript (Fetch)

```javascript
const response = await fetch('https://api.codenotify.dev/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

#### Axios

```javascript
axios.get('https://api.codenotify.dev/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

#### Python (Requests)

```python
import requests

response = requests.get(
    'https://api.codenotify.dev/users/profile',
    headers={'Authorization': f'Bearer {access_token}'}
)
```

## Token Management

### Storing Tokens

#### Client-Side (Web)

**Access Token**:
- Store in memory (React state, Vuex store)
- Or sessionStorage (cleared on tab close)
- Never in localStorage (XSS risk)

**Refresh Token**:
- httpOnly cookie (recommended)
- Or secure storage with encryption
- Never in localStorage

#### Mobile Apps

- Secure storage (Keychain on iOS, Keystore on Android)
- Encrypted storage
- Never in plain text

### Token Lifecycle

```
Sign In
  ↓
Receive tokens (access: 15min, refresh: 7days)
  ↓
Use access token for API calls
  ↓
Access token expires (after 15min)
  ↓
Call /auth/refresh with refresh token
  ↓
Receive new access token (refresh token unchanged)
  ↓
Continue using new access token
  ↓
Refresh token expires (after 7 days)
  ↓
User must sign in again
```

### Automatic Token Refresh

#### JavaScript Example

```javascript
let accessToken = '';
let refreshToken = '';

// Axios interceptor for automatic refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const response = await axios.post('/auth/refresh', {
          userId: getUserId(),
          refreshToken: refreshToken
        });

        // Update access token
        accessToken = response.data.accessToken;

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### React Hook Example

```typescript
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  // Refresh token before expiry
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (refreshToken) {
        try {
          const response = await fetch('/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: getUserId(),
              refreshToken
            })
          });

          const data = await response.json();
          setAccessToken(data.accessToken);
        } catch (error) {
          // Refresh failed - clear tokens
          setAccessToken('');
          setRefreshToken('');
        }
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15min expiry)

    return () => clearInterval(refreshInterval);
  }, [refreshToken]);

  return { accessToken, refreshToken, setAccessToken, setRefreshToken };
};
```

## Security Best Practices

### Token Security

1. **Never expose tokens in URLs** (use headers only)
2. **Use HTTPS** in production (prevent token interception)
3. **Store refresh tokens securely** (httpOnly cookies or encrypted storage)
4. **Implement token rotation** (already done - refresh returns same token)
5. **Set appropriate expiration** (15min access, 7day refresh)

### Password Security

1. **Minimum 6 characters** (current) - consider increasing to 8+
2. **Hash with bcrypt** (12 salt rounds)
3. **Never log passwords**
4. **Implement rate limiting** on auth endpoints
5. **Add CAPTCHA** for signup (prevent bots)

### API Security

1. **Validate all inputs** (Zod schemas)
2. **Use CORS** (restrict origins)
3. **Implement rate limiting** (100 req/15min for public)
4. **Log authentication events** (security monitoring)
5. **Monitor for suspicious activity**

## Error Handling

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | Bad Request | Invalid input | Check request format |
| 401 | Unauthorized | Invalid/expired token | Refresh or re-login |
| 401 | Invalid credentials | Wrong email/password | Check credentials |
| 401 | Account deactivated | User.isActive = false | Contact admin |
| 403 | Forbidden | Insufficient permissions | Check user role |
| 409 | Conflict | Email already exists | Use different email |
| 429 | Too Many Requests | Rate limit exceeded | Wait and retry |

### Error Response Format

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Handling Errors

```javascript
try {
  const response = await fetch('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 401:
        console.error('Invalid credentials');
        break;
      case 409:
        console.error('Email already exists');
        break;
      case 429:
        console.error('Too many attempts, please wait');
        break;
      default:
        console.error('Authentication failed');
    }
    
    throw new Error(error.message);
  }

  const data = await response.json();
  // Store tokens
} catch (error) {
  console.error('Authentication error:', error);
}
```

## Rate Limiting

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/signup` | 5 requests | 1 hour |
| `/auth/signin` | 5 requests | 15 minutes |
| `/auth/refresh` | 10 requests | 1 minute |
| `/auth/signout` | 10 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

## Testing Authentication

### Manual Testing

```bash
# 1. Sign up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# 2. Extract tokens from response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Access protected endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"refreshToken\":\"$REFRESH_TOKEN\"}"

# 5. Sign out
curl -X POST http://localhost:3000/auth/signout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Automated Testing

See [Auth Module](/server/modules/auth) for authentication implementation details.

## Related Documentation

- [Sign Up](/api/auth/signup) - Create account
- [Sign In](/api/auth/signin) - Authenticate
- [Refresh Token](/api/auth/refresh) - Renew access
- [Sign Out](/api/auth/signout) - End session
- [JWT Strategy](/api/auth/jwt-strategy) - Token validation
- [Guards](/server/security/guards) - Route protection
- [Auth Module](/server/modules/auth) - Complete implementation
