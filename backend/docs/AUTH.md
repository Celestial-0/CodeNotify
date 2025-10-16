# 🔐 Authentication System Documentation

## Overview

CodeNotify implements a robust authentication system using JWT tokens, bcrypt password hashing, MongoDB for persistence, and Zod for input validation. The system provides secure user registration, login, session management, and profile operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│  Client Request → Zod Validation → Controller → Service     │
│       ↓                                           ↓         │
│  JWT Guard ← Passport Strategy ← bcrypt ← MongoDB          │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | NestJS | Backend framework with TypeScript |
| **Authentication** | JWT + Passport | Token-based authentication |
| **Password Security** | bcrypt | Password hashing with salt |
| **Database** | MongoDB + Mongoose | User data persistence |
| **Validation** | Zod | Input validation and type safety |
| **Testing** | Jest | Unit and integration testing |

## File Structure

```
src/
├── auth/
│   ├── guards/
│   │   └── jwt-auth.guard.ts          # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts            # Passport JWT strategy
│   ├── auth.controller.ts             # Authentication endpoints
│   ├── auth.service.ts                # Authentication business logic
│   └── auth.module.ts                 # Auth module configuration
├── users/
│   ├── schemas/
│   │   └── user.schema.ts             # MongoDB User schema
│   ├── users.controller.ts            # User management endpoints
│   ├── users.service.ts               # User business logic
│   └── users.module.ts                # Users module configuration
└── common/
    ├── dto/
    │   ├── auth.dto.ts                # Auth DTOs with Zod schemas
    │   └── user.dto.ts                # User DTOs with Zod schemas
    ├── decorators/
    │   └── current-user.decorator.ts  # Get current user decorator
    └── pipes/
        └── zod-validation.pipe.ts     # Zod validation pipe
```

## Core Features

### 🔑 Authentication Features

- **User Registration** - Secure signup with email validation
- **User Login** - Credential-based authentication
- **JWT Tokens** - Access tokens (15min) + Refresh tokens (7 days)
- **Password Security** - bcrypt hashing with 12 salt rounds
- **Session Management** - Token refresh and logout functionality
- **Account Management** - Profile updates and account status control

### 🛡️ Security Features

- **Input Validation** - Zod schemas for all user inputs
- **Password Hashing** - Secure bcrypt implementation
- **JWT Security** - Short-lived access tokens with refresh mechanism
- **Route Protection** - Guards for protected endpoints
- **Error Handling** - Secure error responses without data leakage
- **User Status** - Active/inactive account validation

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Status Code |
|--------|----------|-------------|---------------|--------------|-------------|
| POST | `/auth/signup` | Register new user | ❌ | `CreateUserDto` | 201 |
| POST | `/auth/signin` | Login user | ❌ | `SigninDto` | 200 |
| POST | `/auth/signout` | Logout user | ✅ | - | 200 |
| POST | `/auth/refresh` | Refresh access token | ❌ | `{ refreshToken, userId }` | 200 |

## Authentication Endpoint Details

### 1. User Registration

**POST** `/auth/signup`

Creates a new user account with email, password, and profile information.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "preferences": {
      "platforms": ["codeforces", "leetcode"],
      "alertFrequency": "immediate",
      "contestTypes": []
    },
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }'
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Minimum 6 characters
- `name`: Minimum 2 characters
- `phoneNumber`: Optional string

**Error Responses:**
- `400 Bad Request`: Validation errors or invalid input
- `409 Conflict`: Email already exists

---

### 2. User Login

**POST** `/auth/signin`

Authenticates a user with email and password, returning JWT tokens.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "preferences": {
      "platforms": ["codeforces", "leetcode"],
      "alertFrequency": "immediate",
      "contestTypes": []
    },
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z",
    "lastLogin": "2023-09-06T15:45:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Required, minimum 1 character

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account deactivated

---

### 3. User Logout

**POST** `/auth/signout`

Logs out the current user and invalidates their refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully signed out"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/auth/signout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Authentication Required:** ✅ JWT Bearer token

**Error Responses:**
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Account deactivated

---

### 4. Refresh Access Token

**POST** `/auth/refresh`

Generates new access and refresh tokens using a valid refresh token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0"
  }'
```

**Validation Rules:**
- `refreshToken`: Required, must be a valid JWT refresh token
- `userId`: Required, must be a valid user ID

**Error Responses:**
- `400 Bad Request`: Missing or invalid request body
- `401 Unauthorized`: Invalid or expired refresh token
- `404 Not Found`: User not found

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Status Code |
|--------|----------|-------------|---------------|--------------|-------------|
| GET | `/users/profile` | Get user profile | ✅ | - | 200 |
| PUT | `/users/profile` | Update user profile | ✅ | `UpdateUserDto` | 200 |
| GET | `/users/:id` | Get user by ID | ✅ | - | 200 |
| DELETE | `/users/profile` | Deactivate account | ✅ | - | 200 |
| PUT | `/users/activate` | Activate account | ✅ | - | 200 |

## Data Models

### User Schema

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber?: string;

  @Prop({
    type: {
      platforms: [{ type: String, enum: ['codeforces', 'leetcode', 'codechef', 'atcoder'] }],
      alertFrequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
      contestTypes: [String],
    },
    default: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
  })
  preferences: UserPreferences;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  lastLogin?: Date;
}
```

### User Preferences

```typescript
interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
}
```

## Validation Schemas

### User Registration

```typescript
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phoneNumber: z.string().optional(),
});
```

### User Login

```typescript
export const SigninSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
```

### Profile Update

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phoneNumber: z.string().optional(),
  preferences: z.object({
    platforms: z.array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder'])).optional(),
    alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
    contestTypes: z.array(z.string()).optional(),
  }).optional(),
});
```

## Request/Response Examples

### User Registration

**Request:**
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Login

**Request:**
```bash
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Route Usage

**Request:**
```bash
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "alertFrequency": "immediate",
    "contestTypes": []
  },
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z",
  "lastLogin": "2023-09-06T10:30:00.000Z"
}
```

## Security Implementation

### Password Security

```typescript
// Password hashing during registration
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification during login
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### JWT Token Management

```typescript
// Token generation
const payload: JwtPayload = {
  sub: userId,
  email: email,
};

const accessToken = await this.jwtService.signAsync(payload, {
  secret: this.configService.get<string>('JWT_SECRET'),
  expiresIn: '15m',
});

const refreshToken = await this.jwtService.signAsync(payload, {
  secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
  expiresIn: '7d',
});
```

### Route Protection

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: UserDocument) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // ... other fields
  };
}
```

## Environment Configuration

Required environment variables:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/codenotify

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Server
PORT=3000
NODE_ENV=development
```

## Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| **Validation Error** | 400 | Invalid input data (Zod validation) |
| **Unauthorized** | 401 | Invalid credentials or expired tokens |
| **Forbidden** | 403 | Account deactivated or insufficient permissions |
| **Conflict** | 409 | Email already exists during registration |
| **Not Found** | 404 | User not found |
| **Internal Server Error** | 500 | Server-side errors |

### Error Response Format

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Token Refresh Flow

1. Client receives access token (15min) and refresh token (7 days)
2. When access token expires, client sends refresh token to `/auth/refresh`
3. Server validates refresh token and issues new access + refresh tokens
4. Client updates stored tokens and continues with new access token

```typescript
// Refresh token endpoint
@Post('refresh')
async refreshTokens(@Body() body: { refreshToken: string; userId: string }) {
  return await this.authService.refreshTokens(body.userId, body.refreshToken);
}
```

## Testing

The authentication system includes comprehensive test coverage:

### Test Categories

- **Unit Tests** - Service and controller logic
- **Integration Tests** - Service-controller interactions
- **Security Tests** - Password hashing, token validation
- **Error Handling** - Exception scenarios and edge cases
- **Validation Tests** - Input validation with Zod schemas

### Running Tests

```bash
# Run all tests
npm test

# Run auth-specific tests
npm test -- auth

# Run with coverage
npm run test:cov

# Watch mode for development
npm run test:watch
```

### Test Statistics

- **AuthService**: 13 test cases
- **AuthController**: 8 test cases
- **UsersService**: 18 test cases
- **UsersController**: 14 test cases
- **Other Modules**: 3 test cases
- **Total**: 56 test cases across 12 test suites with full coverage

## Usage Examples

### Client Integration

```typescript
// Registration
const registerUser = async (userData) => {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const { user, accessToken, refreshToken } = await response.json();
  
  // Store tokens securely
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return user;
};

// Making authenticated requests
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/users/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Token refresh
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const userId = getCurrentUserId();
  
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, userId })
  });
  
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
  
  localStorage.setItem('accessToken', newAccessToken);
  localStorage.setItem('refreshToken', newRefreshToken);
};
```

## Best Practices

### Security Best Practices

1. **Password Security**
   - Use bcrypt with high salt rounds (12+)
   - Never store plain text passwords
   - Implement password strength requirements

2. **Token Management**
   - Use short-lived access tokens (15 minutes)
   - Implement secure refresh token rotation
   - Store tokens securely on client side

3. **Input Validation**
   - Validate all inputs with Zod schemas
   - Sanitize user inputs
   - Use type-safe DTOs

4. **Error Handling**
   - Don't leak sensitive information in errors
   - Use appropriate HTTP status codes
   - Log security events for monitoring

### Development Best Practices

1. **Code Organization**
   - Separate concerns (auth, users, validation)
   - Use dependency injection
   - Follow NestJS conventions

2. **Testing**
   - Write comprehensive unit tests
   - Mock external dependencies
   - Test error scenarios

3. **Configuration**
   - Use environment variables for secrets
   - Separate configs for different environments
   - Validate configuration on startup

## Troubleshooting

### Common Issues

1. **JWT Token Expired**
   - Implement automatic token refresh
   - Handle 401 responses gracefully
   - Redirect to login when refresh fails

2. **MongoDB Connection Issues**
   - Check connection string format
   - Verify database credentials
   - Ensure MongoDB service is running

3. **Validation Errors**
   - Check Zod schema definitions
   - Verify input data format
   - Handle validation errors in UI

4. **CORS Issues**
   - Configure CORS for your frontend domain
   - Include credentials in requests
   - Set proper headers

### Debug Commands

```bash
# Check application logs
npm run start:dev

# Run tests with verbose output
npm test -- --verbose

# Check database connection
# (Add to your main.ts for debugging)
console.log('MongoDB URI:', process.env.MONGO_URI);
```

## Future Enhancements

- **Email Verification** - Verify email addresses during registration
- **Password Reset** - Secure password reset via email
- **Two-Factor Authentication** - Add 2FA support
- **OAuth Integration** - Support for Google, GitHub, etc.
- **Rate Limiting** - Prevent brute force attacks
- **Session Management** - Advanced session control
- **Audit Logging** - Track authentication events

---

**✅ The authentication system is production-ready with comprehensive security, testing, and documentation!**