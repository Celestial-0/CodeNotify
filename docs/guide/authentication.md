# Authentication Flow

Complete guide to authentication in CodeNotify.

## Overview

CodeNotify uses **JWT (JSON Web Tokens)** for stateless authentication with a refresh token mechanism.

## Token Types

### Access Token
- **Validity**: 15 minutes
- **Purpose**: Authenticate API requests
- **Storage**: Memory or secure storage
- **Refresh**: Use refresh token when expired

### Refresh Token
- **Validity**: 7 days
- **Purpose**: Obtain new access tokens
- **Storage**: Secure httpOnly cookie (recommended)
- **Rotation**: Same token returned on refresh

## Authentication Endpoints

### 1. Sign Up

**Endpoint**: `POST /auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response**:
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

**Process**:
1. Validate input (email format, password strength)
2. Check if email already exists
3. Hash password with bcrypt
4. Create user in database (isEmailVerified: false)
5. Generate OTP and send email
6. Return user data (no tokens yet)

### 2. Verify Email

**Endpoint**: `POST /auth/verify-email`

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Process**:
1. Validate OTP
2. Set isEmailVerified = true
3. Return user data
4. User can now sign in

### 3. Sign In

**Endpoint**: `POST /auth/signin`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**: Same as signup

**Process**:
1. Find user by email
2. Verify password with bcrypt
3. Check if account is active AND email is verified
4. Generate new tokens
5. Update lastLogin timestamp
6. Return user data and tokens

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Process**:
1. Verify refresh token signature
2. Check if token is expired
3. Find user by ID from token
4. Verify stored refresh token matches
5. Generate NEW access token
6. Return SAME refresh token

**Important**: Refresh token is NOT regenerated!

### 4. Sign Out

**Endpoint**: `POST /auth/signout`

**Headers**: `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "message": "Signed out successfully"
}
```

**Process**:
1. Verify access token
2. Remove refresh token from database
3. Return success message

## Token Structure

### Access Token Payload

```json
{
  "sub": "507f1f77bcf86cd799439011",  // User ID
  "email": "user@example.com",
  "role": "user",
  "iat": 1707998400,                   // Issued at
  "exp": 1707999300                    // Expires at (15 min)
}
```

### Refresh Token Payload

```json
{
  "sub": "507f1f77bcf86cd799439011",  // User ID
  "iat": 1707998400,                   // Issued at
  "exp": 1708603200                    // Expires at (7 days)
}
```

## Authentication Flow

### Initial Authentication

```
1. User → POST /auth/signup or /auth/signin
2. Server → Validate credentials
3. Server → Generate tokens
4. Server → Store refresh token in DB
5. Server → Return { user, accessToken, refreshToken }
6. Client → Store tokens securely
```

### Making Authenticated Requests

```
1. Client → GET /users/profile
   Headers: Authorization: Bearer <accessToken>
2. Server → Verify JWT signature
3. Server → Check expiration
4. Server → Extract user from token
5. Server → Process request
6. Server → Return response
```

### Token Refresh Flow

```
1. Client → Request fails with 401 Unauthorized
2. Client → POST /auth/refresh with refreshToken
3. Server → Verify refresh token
4. Server → Generate new access token
5. Server → Return { accessToken, refreshToken }
6. Client → Retry original request with new token
```

## Implementation

### Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

// Hash password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### JWT Generation

```typescript
import { JwtService } from '@nestjs/jwt';

// Generate access token
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email, role: user.role },
  { secret: process.env.JWT_SECRET, expiresIn: '15m' }
);

// Generate refresh token
const refreshToken = this.jwtService.sign(
  { sub: user.id },
  { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
);
```

### JWT Verification

```typescript
// Verify access token
const payload = this.jwtService.verify(token, {
  secret: process.env.JWT_SECRET
});

// Verify refresh token
const payload = this.jwtService.verify(token, {
  secret: process.env.JWT_REFRESH_SECRET
});
```

## Guards

### JwtAuthGuard

Protects routes requiring authentication:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: UserDocument) {
  return user;
}
```

### RolesGuard

Protects routes requiring specific roles:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deleteUser(@Param('id') id: string) {
  // Only admins can access
}
```

## Security Best Practices

### Token Storage

**✅ Recommended**:
- Access token: Memory or sessionStorage
- Refresh token: Secure httpOnly cookie

**❌ Not Recommended**:
- localStorage (XSS vulnerable)
- Regular cookies without httpOnly

### Token Secrets

```bash
# Use strong, random secrets (min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=different-secret-for-refresh-tokens-min-32-chars
```

**Requirements**:
- Minimum 32 characters
- Random and unpredictable
- Different for access and refresh
- Never commit to version control
- Rotate periodically

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

```typescript
@Throttle(5, 60)  // 5 requests per 60 seconds
@Post('signin')
async signin(@Body() dto: SignInDto) {
  // Protected from brute force
}
```

## Error Handling

### 401 Unauthorized

Token is invalid or expired:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solution**: Use refresh token to get new access token

### 403 Forbidden

User doesn't have required role:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Solution**: Contact admin for role upgrade

## Client Implementation

### JavaScript Example

```javascript
class AuthClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async signup(email, password, name) {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    return data;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    // Try with current access token
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    // If unauthorized, refresh and retry
    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    }

    return response.json();
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    // refreshToken stays the same
  }

  async signout() {
    await fetch(`${this.baseUrl}/auth/signout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    
    this.accessToken = null;
    this.refreshToken = null;
  }
}
```

## Related Documentation

- [API Authentication](/api/authentication) - Complete API reference
- [User Management](/api/users)
- [Security Guards](/server/security/guards)
