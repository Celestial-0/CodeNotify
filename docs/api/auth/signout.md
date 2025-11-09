# Sign Out

Invalidate user tokens and end the session.

## Endpoint

```http
POST /auth/signout
```

## Authentication

**Required**: JWT access token in Authorization header.

```http
Authorization: Bearer <access_token>
```

## Request Body

No request body required.

## Response

### Success (200 OK)

```json
{
  "message": "Successfully signed out"
}
```

## Error Responses

### 401 Unauthorized - Missing Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 401 Unauthorized - User Not Found

```json
{
  "statusCode": 401,
  "message": "User not found",
  "error": "Unauthorized"
}
```

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/auth/signout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch)

```javascript
const logout = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/auth/signout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.ok) {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    // Redirect to signin
    window.location.href = '/signin';
  }
};
```

### TypeScript (Axios)

```typescript
import axios from 'axios';

const logout = async (): Promise<void> => {
  try {
    await axios.post('http://localhost:3000/auth/signout', null, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    // Clear tokens
    localStorage.clear();
    
    // Redirect
    window.location.href = '/signin';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

## Implementation Details

### Database Operations

On logout:
1. User is retrieved from JWT payload
2. Refresh token is set to `null` in database
3. Success message is returned

```typescript
await this.usersService.updateRefreshToken(userId, null);
```

### Token Invalidation

- Refresh token is cleared from database
- Access token remains valid until expiry (15 minutes)
- Client should discard both tokens immediately

### Security Considerations

- Access token cannot be invalidated server-side (stateless JWT)
- For immediate invalidation, implement token blacklist
- Always clear tokens on client-side
- Consider implementing token versioning for critical operations

## Best Practices

### Complete Logout Flow

```javascript
const completeLogout = async () => {
  try {
    // 1. Call logout endpoint
    await logout();
    
    // 2. Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Clear cookies if used
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // 4. Reset app state
    // dispatch(resetState());
    
    // 5. Redirect
    window.location.href = '/signin';
  } catch (error) {
    // Even if API call fails, clear local data
    localStorage.clear();
    window.location.href = '/signin';
  }
};
```

### Multi-Tab Logout

```javascript
// Broadcast logout to other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken' && e.newValue === null) {
    window.location.href = '/signin';
  }
});

const logout = async () => {
  await fetch('http://localhost:3000/auth/signout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  
  // This triggers storage event in other tabs
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  window.location.href = '/signin';
};
```

## Related Endpoints

- [Sign In](/api/auth/signin) - Authenticate user
- [Refresh Token](/api/auth/refresh) - Get new access token
- [Sign Up](/api/auth/signup) - Create account

## Notes

- Logout is idempotent - calling multiple times has no side effects
- Failed logout attempts are logged for security monitoring
- Consider implementing "logout from all devices" functionality
- For enhanced security, implement token blacklist or versioning
