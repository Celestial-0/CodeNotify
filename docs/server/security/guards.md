# Guards & Strategies

Complete guide to authentication and authorization guards in CodeNotify.

## Overview

Guards control access to routes and endpoints. CodeNotify uses two main guards:
1. **JwtAuthGuard** - Validates JWT tokens (authentication)
2. **RolesGuard** - Checks user roles (authorization)

## JWT Auth Guard

### Purpose

Protects routes by validating JWT access tokens. Applied globally to all routes except those marked with `@Public()`.

### Implementation

**File**: `server/src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;  // Skip authentication
    }

    return super.canActivate(context);  // Validate JWT
  }
}
```

### How It Works

```
Request → JwtAuthGuard → Check @Public() → Yes → Allow
                              ↓
                             No
                              ↓
                         Validate JWT → Valid → Allow
                              ↓
                           Invalid
                              ↓
                          401 Unauthorized
```

### Global Application

**File**: `server/src/main.ts`

```typescript
const app = await NestFactory.create(AppModule);

// Apply JWT guard globally
app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
```

All routes are protected by default unless marked `@Public()`.

### Usage Examples

#### Protected Route (Default)

```typescript
@Controller('users')
export class UsersController {
  @Get('profile')
  getProfile(@CurrentUser() user: UserDocument) {
    // JWT required - automatically enforced
    return user;
  }
}
```

#### Public Route

```typescript
@Controller('auth')
export class AuthController {
  @Public()  // Skip JWT validation
  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
```

#### Class-Level Protection

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard)  // Protect all routes
export class AdminController {
  @Get('users')
  getAllUsers() {
    // JWT required
  }

  @Get('stats')
  getStats() {
    // JWT required
  }
}
```

## Roles Guard

### Purpose

Enforces role-based access control (RBAC). Checks if authenticated user has required role(s).

### Implementation

**File**: `server/src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required - allow access
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (populated by JwtStrategy)
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // No user - deny access
    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### How It Works

```
Request → RolesGuard → Check @Roles() → None → Allow
                            ↓
                       Has @Roles()
                            ↓
                       Get user.role
                            ↓
                       Match required? → Yes → Allow
                            ↓
                           No
                            ↓
                       403 Forbidden
```

### Role Types

**File**: `server/src/auth/decorators/roles.decorator.ts`

```typescript
export type Role = 'user' | 'admin';
```

- **user**: Regular user (default)
- **admin**: Administrator with elevated privileges

### Usage Examples

#### Admin-Only Route

```typescript
@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    // Only admin can access
    return this.usersService.deleteUser(id);
  }
}
```

#### Multiple Roles

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Post('contests/sync')
syncContests() {
  // Admin OR moderator can access
  return this.contestsService.syncAllPlatforms();
}
```

#### Class-Level Roles

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')  // All routes require admin
export class AdminController {
  @Get('users')
  getAllUsers() {
    // Admin only
  }

  @Get('stats')
  getStats() {
    // Admin only
  }
}
```

## Decorators

### @Public()

Marks routes as public (skip JWT authentication).

**File**: `server/src/common/decorators/public.decorator.ts`

```typescript
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage**:
```typescript
@Public()
@Post('signup')
signup(@Body() dto: CreateUserDto) {
  // No authentication required
}
```

### @Roles()

Specifies required roles for a route.

**File**: `server/src/auth/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage**:
```typescript
@Roles('admin')
@Delete('users/:id')
deleteUser(@Param('id') id: string) {
  // Only admin can access
}
```

### @CurrentUser()

Extracts authenticated user from request.

**File**: `server/src/common/decorators/current-user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    return ctx.switchToHttp().getRequest<{ user: User }>().user;
  },
);
```

**Usage**:
```typescript
@Get('profile')
getProfile(@CurrentUser() user: UserDocument) {
  // user is populated by JwtStrategy
  return user;
}
```

## Guard Execution Order

### Multiple Guards

When using multiple guards, they execute in order:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
getUsers() {
  // 1. JwtAuthGuard validates token
  // 2. RolesGuard checks role
}
```

### Execution Flow

```
Request
  ↓
JwtAuthGuard
  ├─ Check @Public() → Yes → Skip to RolesGuard
  └─ No → Validate JWT
      ├─ Valid → Continue to RolesGuard
      └─ Invalid → 401 Unauthorized
  ↓
RolesGuard
  ├─ Check @Roles() → None → Allow
  └─ Has @Roles()
      ├─ Check user.role → Match → Allow
      └─ No match → 403 Forbidden
  ↓
Controller Method
```

## Error Responses

### 401 Unauthorized (JwtAuthGuard)

**Causes**:
- Missing Authorization header
- Invalid token format
- Expired token
- Invalid signature
- User not found
- User deactivated

**Response**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden (RolesGuard)

**Causes**:
- User authenticated but lacks required role
- User is 'user' but route requires 'admin'

**Response**:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

## Common Patterns

### Pattern 1: Public Endpoint

```typescript
@Public()
@Post('auth/signin')
signin(@Body() dto: SigninDto) {
  // Anyone can access
}
```

### Pattern 2: Authenticated Endpoint

```typescript
@Get('users/profile')
getProfile(@CurrentUser() user: UserDocument) {
  // JWT required (global guard)
}
```

### Pattern 3: Admin-Only Endpoint

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete('users/:id')
deleteUser(@Param('id') id: string) {
  // JWT + admin role required
}
```

### Pattern 4: Multiple Roles

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Post('contests/sync')
syncContests() {
  // JWT + (admin OR moderator) required
}
```

### Pattern 5: Class-Level Protection

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // All routes require JWT + admin role
  
  @Get('users')
  getUsers() {}
  
  @Get('stats')
  getStats() {}
}
```

## Testing

### Unit Tests - JwtAuthGuard

```typescript
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow access to public routes', () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should validate JWT for protected routes', () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // Should call super.canActivate() which validates JWT
    expect(guard.canActivate(context)).toBeDefined();
  });
});
```

### Unit Tests - RolesGuard

```typescript
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const context = createMockContext({ user: { role: 'admin' } });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const context = createMockContext({ user: { role: 'user' } });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(false);
  });
});
```

### E2E Tests

```typescript
describe('Guards E2E', () => {
  it('should allow access to public routes without token', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials)
      .expect(200);
  });

  it('should deny access to protected routes without token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .expect(401);
  });

  it('should allow access to protected routes with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  it('should deny access to admin routes for regular users', () => {
    return request(app.getHttpServer())
      .delete('/users/123')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should allow access to admin routes for admin users', () => {
    return request(app.getHttpServer())
      .delete('/users/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

## Best Practices

### ✅ Do

1. **Apply guards in correct order** (JwtAuthGuard before RolesGuard)
2. **Use @Public() sparingly** (only for truly public endpoints)
3. **Use class-level guards** for consistent protection
4. **Test guard behavior** thoroughly
5. **Log authorization failures** for security monitoring
6. **Use specific roles** (avoid overly permissive access)

### ❌ Don't

1. **Don't skip JwtAuthGuard** when using RolesGuard
2. **Don't make sensitive routes public**
3. **Don't check roles manually** in controllers (use RolesGuard)
4. **Don't ignore 403 errors** (indicates authorization issue)
5. **Don't grant admin role** without proper validation

## Troubleshooting

### Issue: 401 on Protected Route

**Symptoms**: Getting 401 even with valid token

**Checks**:
1. Token in Authorization header: `Bearer <token>`
2. Token not expired (15 minutes)
3. User exists in database
4. User is active (`isActive: true`)

### Issue: 403 on Admin Route

**Symptoms**: Authenticated but getting 403

**Checks**:
1. User role is 'admin' (check database)
2. @Roles('admin') decorator present
3. RolesGuard applied
4. Token contains correct role

### Issue: Public Route Requiring Auth

**Symptoms**: Public route returning 401

**Checks**:
1. @Public() decorator present
2. Decorator on correct method/class
3. Global guard configured correctly

## Related Documentation

- [JWT Authentication](/server/security/jwt) - Token generation and validation
- [Auth Module](/server/modules/auth) - Complete authentication system
- [Sign In](/api/auth/signin) - Get access token
- [Security](/server/security/jwt) - Security implementation
