# JWT Strategy

Passport strategy for validating JWT tokens and extracting user information.

## Overview

The JWT Strategy is a Passport strategy that validates JWT access tokens and loads the authenticated user. It's automatically invoked by the `JwtAuthGuard` on protected routes.

## Implementation

**File**: `server/src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET', AUTH.JWT_SECRET);
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }
    return user;
  }
}
```

## Configuration

### Token Extraction

```typescript
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
```

Extracts JWT from the `Authorization` header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expiration Handling

```typescript
ignoreExpiration: false
```

- Expired tokens are automatically rejected
- Returns 401 Unauthorized for expired tokens
- Client must refresh token using `/auth/refresh` endpoint

### Secret Key

```typescript
secretOrKey: configService.get<string>('JWT_SECRET')
```

- Loaded from environment variable `JWT_SECRET`
- Falls back to `AUTH.JWT_SECRET` constant if not set
- Throws error if secret is undefined (security check)

## JWT Payload

### Structure

```typescript
export interface JwtPayload {
  sub: string;      // Subject (user ID)
  email: string;    // User email
  role: string;     // User role ('user' or 'admin')
  iat?: number;     // Issued at (timestamp)
  exp?: number;     // Expiration (timestamp)
}
```

### Example Payload

```json
{
  "sub": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1704067200,
  "exp": 1704068100
}
```

## Validation Process

### Flow

```
1. Extract token from Authorization header
   ↓
2. Verify token signature with JWT_SECRET
   ↓
3. Check token expiration
   ↓
4. Extract payload (sub, email, role)
   ↓
5. Load user from database by ID (payload.sub)
   ↓
6. Check if user exists
   ↓
7. Check if user is active
   ↓
8. Return user object (attached to request)
```

### Validation Method

```typescript
async validate(payload: JwtPayload) {
  // 1. Load user from database
  const user = await this.usersService.getUserById(payload.sub);
  
  // 2. Check user exists
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  
  // 3. Check user is active
  if (!user.isActive) {
    throw new UnauthorizedException('User account is deactivated');
  }
  
  // 4. Return user (attached to request.user)
  return user;
}
```

## Error Handling

### Common Errors

| Error | Cause | HTTP Status |
|-------|-------|-------------|
| `User not found` | User ID in token doesn't exist | 401 |
| `User account is deactivated` | User.isActive = false | 401 |
| `jwt malformed` | Invalid token format | 401 |
| `jwt expired` | Token past expiration time | 401 |
| `invalid signature` | Token signed with wrong secret | 401 |
| `No auth token` | Missing Authorization header | 401 |

### Error Responses

```json
{
  "statusCode": 401,
  "message": "User not found",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 401,
  "message": "jwt expired",
  "error": "Unauthorized"
}
```

## Usage in Guards

### JWT Auth Guard

The strategy is used by `JwtAuthGuard`:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Uses JwtStrategy automatically
}
```

### Protected Route Example

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)  // Invokes JwtStrategy
export class UsersController {
  @Get('profile')
  getProfile(@CurrentUser() user: UserDocument) {
    // user is populated by JwtStrategy.validate()
    return user;
  }
}
```

## Request Flow

### Successful Authentication

```
Client Request
├── Header: Authorization: Bearer <token>
│
├── JwtAuthGuard intercepts
│   ├── Calls JwtStrategy
│   │   ├── Extracts token from header
│   │   ├── Verifies signature
│   │   ├── Checks expiration
│   │   ├── Loads user from database
│   │   ├── Validates user exists and is active
│   │   └── Returns user object
│   │
│   └── Attaches user to request.user
│
└── Controller method executes
    └── Access user via @CurrentUser() decorator
```

### Failed Authentication

```
Client Request
├── Header: Authorization: Bearer <invalid_token>
│
├── JwtAuthGuard intercepts
│   ├── Calls JwtStrategy
│   │   ├── Token verification fails
│   │   └── Throws UnauthorizedException
│   │
│   └── Returns 401 response
│
└── Controller method NOT executed
```

## Security Features

### 1. Token Signature Verification

- Every token is verified with `JWT_SECRET`
- Prevents token tampering
- Invalid signatures are rejected

### 2. Expiration Check

- Tokens expire after 15 minutes
- Expired tokens are automatically rejected
- Forces regular token refresh

### 3. User Validation

- User existence is verified on every request
- Deleted users can't access API
- Deactivated accounts are blocked

### 4. Active Status Check

- `isActive` flag prevents deactivated users
- Immediate access revocation
- No need to invalidate tokens

## Configuration Options

### Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key-here-min-32-chars

# Optional (defaults provided)
JWT_EXPIRATION=15m
```

### Default Constants

```typescript
export const AUTH = {
  JWT_SECRET: 'default-secret-for-development-only',
  JWT_REFRESH_SECRET: 'default-refresh-secret-for-development-only',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  BCRYPT_ROUNDS: 12
};
```

**⚠️ Warning**: Never use default secrets in production!

## Testing

### Unit Tests

```typescript
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret')
          }
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn()
          }
        }
      ]
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should validate user and return user object', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true
    };
    
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

    const payload = { sub: '123', email: 'test@example.com', role: 'user' };
    const result = await strategy.validate(payload);

    expect(result).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if user not found', async () => {
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(null);

    const payload = { sub: '123', email: 'test@example.com', role: 'user' };
    
    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('should throw UnauthorizedException if user is inactive', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: false
    };
    
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

    const payload = { sub: '123', email: 'test@example.com', role: 'user' };
    
    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
```

### E2E Tests

```typescript
describe('JWT Strategy E2E', () => {
  it('should authenticate with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  it('should reject expired token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject invalid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
```

## Best Practices

### ✅ Do

1. **Use strong secrets** (32+ random characters)
2. **Rotate secrets** periodically in production
3. **Set appropriate expiration** (15 minutes for access tokens)
4. **Validate user on every request** (check exists and active)
5. **Use environment variables** for secrets
6. **Log authentication failures** for security monitoring

### ❌ Don't

1. **Don't use default secrets** in production
2. **Don't ignore expiration** (security risk)
3. **Don't skip user validation** (deleted users could access)
4. **Don't log tokens** (security risk)
5. **Don't share secrets** across environments
6. **Don't use weak secrets** (easy to crack)

## Troubleshooting

### Token Not Being Extracted

**Problem**: 401 even with valid token

**Solution**: Check Authorization header format:
```http
✅ Correct: Authorization: Bearer eyJhbGciOiJIUzI1...
❌ Wrong: Authorization: eyJhbGciOiJIUzI1...
❌ Wrong: Bearer eyJhbGciOiJIUzI1...
```

### User Not Found Error

**Problem**: Token valid but user not found

**Causes**:
- User was deleted after token was issued
- Token contains wrong user ID
- Database connection issue

**Solution**: Refresh token or re-login

### Account Deactivated Error

**Problem**: User exists but can't access

**Cause**: `user.isActive = false`

**Solution**: Contact admin to reactivate account

## Related Documentation

- [JWT Auth Guard](/server/security/guards) - Route protection
- [Sign In](/api/auth/signin) - Get access token
- [Refresh Token](/api/auth/refresh) - Renew access token
- [Auth Module](/server/modules/auth) - Complete auth system
