# Sign In

Authenticate an existing user and obtain access tokens.

## Endpoint

```http
POST /auth/signin
```

## Authentication

No authentication required (public endpoint).

## Request Body

```typescript
{
  email: string;     // User's email address
  password: string;  // User's password
}
```

### Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Minimum 1 character |

## Response

### Success (200 OK)

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Error Responses

### 401 Unauthorized - Invalid Credentials

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 401 Unauthorized - Account Deactivated

```json
{
  "statusCode": 401,
  "message": "Account is deactivated",
  "error": "Unauthorized"
}
```

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### JavaScript (Fetch)

```javascript
const signin = async (email, password) => {
  const response = await fetch('http://localhost:3000/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const { user, accessToken, refreshToken } = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userId', user.id);
  
  return user;
};

// Usage
try {
  const user = await signin('john@example.com', 'SecurePass123!');
  console.log('Logged in as:', user.name);
} catch (error) {
  console.error('Login error:', error);
}
```

## Implementation Details

### Password Verification

Passwords are verified using bcrypt compare:

```typescript
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### Token Generation

New tokens are generated on each signin:
- Access token expires in 15 minutes
- Refresh token expires in 7 days

### Database Updates

On successful signin:
1. Refresh token is hashed and stored
2. `lastLogin` timestamp is updated

### Security Features

- Failed signin attempts are logged
- Account status (`isActive`) is checked
- Passwords are never returned in responses
- Refresh tokens are hashed before storage

## Related Endpoints

- [Sign Up](/api/auth/signup) - Create new account
- [Refresh Token](/api/auth/refresh) - Get new access token
- [Sign Out](/api/auth/signout) - Invalidate tokens
