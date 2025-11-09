# Sign Up

Create a new user account.

## Endpoint

```http
POST /auth/signup
```

## Authentication

No authentication required (public endpoint).

## Request Body

```typescript
{
  name: string;          // Full name (minimum 2 characters)
  email: string;         // Valid email address
  password: string;      // Password (minimum 6 characters)
  phoneNumber?: string;  // Optional phone number
}
```

### Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | Minimum 2 characters |
| `email` | string | Yes | Valid email format, unique |
| `password` | string | Yes | Minimum 6 characters |
| `phoneNumber` | string | No | Optional string |

## Response

### Success (201 Created)

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `user.id` | string | Unique user identifier (MongoDB ObjectId) |
| `user.email` | string | User's email address |
| `user.name` | string | User's full name |
| `user.phoneNumber` | string | User's phone number (if provided) |
| `user.role` | string | User role (`user` or `admin`) |
| `accessToken` | string | JWT access token (expires in 15 minutes) |
| `refreshToken` | string | JWT refresh token (expires in 7 days) |

## Error Responses

### 400 Bad Request

Invalid request body or validation failure.

```json
{
  "statusCode": 400,
  "message": [
    "Invalid email format",
    "Password must be at least 6 characters long",
    "Name must be at least 2 characters long"
  ],
  "error": "Bad Request"
}
```

### 409 Conflict

User with email already exists.

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890"
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    phoneNumber: '+1234567890'
  })
});

const data = await response.json();
console.log('Access Token:', data.accessToken);
console.log('Refresh Token:', data.refreshToken);

// Store tokens securely
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

### Python (Requests)

```python
import requests

response = requests.post('http://localhost:3000/auth/signup', json={
    'name': 'John Doe',
    'email': 'john@example.com',
    'password': 'SecurePass123!',
    'phoneNumber': '+1234567890'
})

data = response.json()
access_token = data['accessToken']
refresh_token = data['refreshToken']

print(f'User ID: {data["user"]["id"]}')
print(f'Access Token: {access_token}')
```

### TypeScript (Axios)

```typescript
import axios from 'axios';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface SignupResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(
    'http://localhost:3000/auth/signup',
    data
  );
  return response.data;
};

// Usage
const result = await signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  phoneNumber: '+1234567890'
});

console.log('User created:', result.user.id);
```

## Implementation Details

### Password Hashing

Passwords are hashed using **bcrypt** with 12 salt rounds before storage. Plain text passwords are never stored.

```typescript
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Note**: Current validation requires minimum 6 characters. For production, consider:
- Minimum 8-12 characters
- Complexity requirements (uppercase, lowercase, numbers, special characters)
- Password strength meter
- Common password blacklist

### Token Generation

Both access and refresh tokens are JWT tokens signed with different secrets:

- **Access Token**: 15-minute expiry, signed with `JWT_SECRET`
- **Refresh Token**: 7-day expiry, signed with `JWT_REFRESH_SECRET`

### Default User Preferences

New users are created with default notification preferences:

```typescript
{
  platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
  notificationChannels: ['email'],
  notifyBefore: 24, // hours
  contestTypes: [],
  difficultyLevels: []
}
```

### Database Operations

1. Check if email already exists
2. Hash password with bcrypt
3. Create user document in MongoDB
4. Generate JWT tokens
5. Store hashed refresh token in user document
6. Return user data and tokens

## Security Considerations

- **Password Requirements**: Minimum 6 characters (consider increasing to 8+ for production)
- **Email Validation**: Must be valid format and unique across all users
- **Token Security**: Refresh tokens are hashed with bcrypt before storage
- **Rate Limiting**: 100 requests per 15 minutes per IP (unauthenticated)
- **CORS**: Configured for specific origins in production
- **Bcrypt Salt Rounds**: 12 rounds for password hashing

### Production Security Recommendations

For enhanced security in production:
1. Increase minimum password length to 8-12 characters
2. Enforce password complexity (uppercase, lowercase, numbers, special chars)
3. Implement password strength meter
4. Add CAPTCHA for signup to prevent bots
5. Implement email verification
6. Add account lockout after failed attempts
7. Monitor for suspicious signup patterns

## Related Endpoints

- [Sign In](/api/auth/signin) - Authenticate existing user
- [Refresh Token](/api/auth/refresh) - Get new access token
- [Sign Out](/api/auth/signout) - Invalidate tokens

## Notes

- User accounts are created with `role: 'user'` by default
- Admin accounts must be created manually in the database
- Email verification is not currently implemented
- Phone numbers are optional and not verified
- Users are automatically marked as active (`isActive: true`)
