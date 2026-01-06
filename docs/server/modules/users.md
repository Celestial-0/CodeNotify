# Users Module

Complete user management system for CodeNotify.

## Overview

The Users Module handles all user-related operations including profile management, preferences, account activation/deactivation, and admin user management.

## Module Structure

```
users/
├── users.module.ts          # Module configuration
├── users.controller.ts      # REST endpoints
├── users.service.ts         # Business logic
└── schemas/
    └── user.schema.ts       # MongoDB schema
```

## Dependencies

### Imports
- **MongooseModule**: MongoDB integration for User schema
- **JwtAuthGuard**: Authentication (from Auth Module)
- **RolesGuard**: Authorization (from Auth Module)

### Providers
- UsersService

### Controllers
- UsersController

### Exports
- UsersService (used by Auth Module and other modules)

## User Schema

### MongoDB Schema

**File**: `server/src/users/schemas/user.schema.ts`

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

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({
    type: {
      platforms: [String],
      alertFrequency: String,
      contestTypes: [String],
      notificationChannels: {
        whatsapp: Boolean,
        email: Boolean,
        push: Boolean,
      },
      notifyBefore: Number,
    },
    default: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
      notificationChannels: {
        whatsapp: true,
        email: true,
        push: false,
      },
      notifyBefore: 24,
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

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `email` | string | Yes | - | Unique email address |
| `password` | string | Yes | - | Bcrypt hashed password |
| `name` | string | Yes | - | User's full name |
| `phoneNumber` | string | No | - | Phone number |
| `role` | enum | Yes | 'user' | User role ('user' or 'admin') |
| `preferences` | object | Yes | Default prefs | Notification preferences |
| `isActive` | boolean | Yes | true | Account active status |
| `isEmailVerified` | boolean | Yes | false | Email verification status |
| `refreshToken` | string | No | - | Hashed refresh token |
| `lastLogin` | Date | No | - | Last login timestamp |
| `createdAt` | Date | Auto | - | Account creation (auto) |
| `updatedAt` | Date | Auto | - | Last update (auto) |

### Virtual Fields

```typescript
UserSchema.virtual('id').get(function (this: UserDocument) {
  return this._id.toHexString();
});
```

- **id**: String representation of MongoDB `_id`

### Indexes

```typescript
// Unique index on email
{ email: 1 }, { unique: true }

// Index on role for admin queries
{ role: 1 }

// Index on isActive for filtering
{ isActive: 1 }
```

## User Preferences

### Structure

```typescript
interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
  notificationChannels: {
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  notifyBefore: number; // 1-168 hours
}
```

### Default Values

```json
{
  "platforms": ["codeforces", "leetcode"],
  "alertFrequency": "immediate",
  "contestTypes": [],
  "notificationChannels": {
    "whatsapp": true,
    "email": true,
    "push": false
  },
  "notifyBefore": 24
}
```

### Validation

**File**: `server/src/common/dto/user.dto.ts`

```typescript
preferences: z.object({
  platforms: z.array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder'])).optional(),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  contestTypes: z.array(z.string()).optional(),
  notificationChannels: z.object({
    whatsapp: z.boolean().optional(),
    email: z.boolean().optional(),
    push: z.boolean().optional(),
  }).optional(),
  notifyBefore: z.number().min(1).max(168).optional(),
}).optional()
```

## API Endpoints

### 1. Get User Profile

**Endpoint**: `GET /users/profile`  
**Access**: Protected (JWT required)  
**Status**: 200 OK

**Response**:
```typescript
{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

[Full Documentation →](/api/users/profile)

### 2. Update User Profile

**Endpoint**: `PUT /users/profile`  
**Access**: Protected (JWT required)  
**Status**: 200 OK

**Request**:
```typescript
{
  name?: string;
  phoneNumber?: string;
  preferences?: Partial<UserPreferences>;
}
```

[Full Documentation →](/api/users/update-profile)

### 3. Get User by ID

**Endpoint**: `GET /users/:id`  
**Access**: Protected (JWT required)  
**Status**: 200 OK

[Full Documentation →](/api/users/get-by-id)

### 4. Get All Users (Admin)

**Endpoint**: `GET /users`  
**Access**: Admin only  
**Status**: 200 OK

**Query Parameters**:
- `limit` (default: 20)
- `offset` (default: 0)

[Full Documentation →](/api/users/list)

### 5. Deactivate Account

**Endpoint**: `DELETE /users/profile`  
**Access**: Protected (JWT required)  
**Status**: 200 OK

**Response**:
```json
{
  "message": "Account deactivated successfully"
}
```

### 6. Activate Account

**Endpoint**: `PUT /users/activate`  
**Access**: Protected (JWT required)  
**Status**: 200 OK

**Response**:
```json
{
  "message": "Account activated successfully"
}
```

### 7. Update User Role (Admin)

**Endpoint**: `PATCH /users/:id/role`  
**Access**: Admin only  
**Status**: 200 OK

**Request**:
```json
{
  "role": "admin"
}
```

### 8. Delete User (Admin)

**Endpoint**: `DELETE /users/:id`  
**Access**: Admin only  
**Status**: 200 OK

**Response**:
```json
{
  "message": "User deleted successfully"
}
```

## Service Methods

### User CRUD Operations

#### createUser()

```typescript
async createUser(createUserDto: CreateUserDto): Promise<UserDocument>
```

Creates a new user with hashed password and default preferences.

**Used by**: Auth Module (signup)

#### getUserById()

```typescript
async getUserById(id: string): Promise<UserDocument | null>
```

Finds user by MongoDB ObjectId.

**Returns**: User document or null if not found

#### findByEmail()

```typescript
async findByEmail(email: string): Promise<UserDocument | null>
```

Finds user by email address.

**Used by**: Auth Module (signin, signup validation)

#### updateUser()

```typescript
async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>
```

Updates user fields.

**Throws**: NotFoundException if user not found

### Token Management

#### updateRefreshToken()

```typescript
async updateRefreshToken(id: string, refreshToken: string | null): Promise<void>
```

Updates user's refresh token (hashed with bcrypt).

**Used by**: Auth Module (signin, signup, signout, refresh)

**Process**:
1. Hash refresh token with bcrypt (12 rounds)
2. Store hashed token in database
3. Set to null on signout

#### updateLastLogin()

```typescript
async updateLastLogin(id: string): Promise<void>
```

Updates lastLogin timestamp to current time.

**Used by**: Auth Module (signin)

### Account Management

#### deactivateUser()

```typescript
async deactivateUser(id: string): Promise<UserDocument>
```

Sets `isActive` to false.

**Effect**: User cannot sign in (checked by JwtStrategy)

#### activateUser()

```typescript
async activateUser(id: string): Promise<UserDocument>
```

Sets `isActive` to true.

**Effect**: User can sign in again

### Admin Operations

#### getAllUsersWithPagination()

```typescript
async getAllUsersWithPagination(
  limit: number,
  offset: number,
): Promise<{ users: UserDocument[]; total: number }>
```

Fetches paginated list of all users.

**Features**:
- Excludes password and refreshToken
- Sorted by createdAt (newest first)
- Returns total count

#### updateUserRole()

```typescript
async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<UserDocument>
```

Changes user's role.

**Access**: Admin only

#### deleteUserById()

```typescript
async deleteUserById(userId: string): Promise<void>
```

Permanently deletes user from database.

**Access**: Admin only  
**Warning**: Cannot be undone

### Controller Helper Methods

#### getProfile()

```typescript
getProfile(user: UserDocument): ProfileResponse
```

Formats user document for profile response.

#### updateProfile()

```typescript
async updateProfile(user: UserDocument, updateUserDto: UpdateUserDto): Promise<ProfileResponse>
```

Updates and formats profile.

#### getUserByIdWithFormatting()

```typescript
async getUserByIdWithFormatting(id: string): Promise<UserResponse>
```

Gets user by ID and formats response.

#### deactivateAccount()

```typescript
async deactivateAccount(user: UserDocument): Promise<{ message: string }>
```

Deactivates user's own account.

#### activateAccount()

```typescript
async activateAccount(user: UserDocument): Promise<{ message: string }>
```

Reactivates user's own account.

## DTOs & Validation

### UpdateUserDto

**File**: `server/src/common/dto/user.dto.ts`

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phoneNumber: z.string().optional(),
  preferences: z.object({
    platforms: z.array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder'])).optional(),
    alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
    contestTypes: z.array(z.string()).optional(),
    notificationChannels: z.object({
      whatsapp: z.boolean().optional(),
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
    notifyBefore: z.number().min(1).max(168).optional(),
  }).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
```

### GetUserByIdDto

```typescript
export const GetUserByIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export class GetUserByIdDto extends createZodDto(GetUserByIdSchema) {}
```

### GetAllUsersDto

```typescript
export const GetAllUsersSchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
});

export class GetAllUsersDto extends createZodDto(GetAllUsersSchema) {}
```

### UpdateUserRoleDto

```typescript
export const UpdateUserRoleSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const UpdateUserRoleBodySchema = z.object({
  role: z.enum(['user', 'admin']),
});

export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {}
export class UpdateUserRoleBodyDto extends createZodDto(UpdateUserRoleBodySchema) {}
```

### DeleteUserDto

```typescript
export const DeleteUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export class DeleteUserDto extends createZodDto(DeleteUserSchema) {}
```

## Guards & Authorization

### Endpoint Protection

| Endpoint | Guards | Roles | Access |
|----------|--------|-------|--------|
| `GET /users/profile` | JwtAuthGuard | - | Any authenticated user |
| `PUT /users/profile` | JwtAuthGuard | - | Any authenticated user |
| `GET /users/:id` | JwtAuthGuard | - | Any authenticated user |
| `DELETE /users/profile` | JwtAuthGuard | - | Any authenticated user |
| `PUT /users/activate` | JwtAuthGuard | - | Any authenticated user |
| `GET /users` | JwtAuthGuard, RolesGuard | admin | Admin only |
| `PATCH /users/:id/role` | JwtAuthGuard, RolesGuard | admin | Admin only |
| `DELETE /users/:id` | JwtAuthGuard, RolesGuard | admin | Admin only |

### Example Usage

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
getProfile(@CurrentUser() user: UserDocument) {
  return this.usersService.getProfile(user);
}

@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@HttpCode(HttpStatus.OK)
async getAllUsers(@Query() query: GetAllUsersDto) {
  // Admin only
}
```

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| User not found | 404 | Invalid user ID | Check user exists |
| Unauthorized | 401 | Invalid/missing token | Refresh or re-login |
| Forbidden | 403 | Insufficient permissions | Check user role |
| Validation error | 400 | Invalid input | Fix request data |

### Error Responses

```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "User not found",
  error: "Not Found"
}

// 403 Forbidden
{
  statusCode: 403,
  message: "Forbidden resource",
  error: "Forbidden"
}
```

## Security Considerations

### Password Security

- Passwords hashed with bcrypt (12 salt rounds)
- Never exposed in API responses
- Stored in `password` field (excluded from queries)

### Refresh Token Security

- Refresh tokens hashed with bcrypt before storage
- Never exposed in API responses
- Stored in `refreshToken` field (excluded from queries)

### Data Privacy

**Excluded from responses**:
- `password` - Always excluded
- `refreshToken` - Always excluded
- `lastLogin` - Excluded for other users (privacy)

**Selection in queries**:
```typescript
.select('-password -refreshToken')
```

### Role-Based Access

- Admin endpoints protected by `RolesGuard`
- Regular users get 403 Forbidden
- Role stored in JWT token and database

## Testing

### Unit Tests

```typescript
describe('UsersService', () => {
  it('should create a user', async () => {
    const user = await usersService.createUser(createUserDto);
    expect(user.email).toBe(createUserDto.email);
  });

  it('should find user by email', async () => {
    const user = await usersService.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });

  it('should update user profile', async () => {
    const updated = await usersService.updateUser(userId, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });

  it('should deactivate user', async () => {
    const user = await usersService.deactivateUser(userId);
    expect(user.isActive).toBe(false);
  });
});
```

### E2E Tests

```typescript
describe('Users (e2e)', () => {
  it('/users/profile (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
      });
  });

  it('/users (GET) - admin only', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

## Best Practices

### ✅ Do

1. **Always exclude sensitive fields** (password, refreshToken)
2. **Validate all inputs** with Zod schemas
3. **Use transactions** for critical operations
4. **Log user actions** for audit trail
5. **Handle errors gracefully**
6. **Use indexes** for frequently queried fields

### ❌ Don't

1. **Don't expose passwords** or tokens
2. **Don't allow email changes** without verification
3. **Don't delete users** without confirmation
4. **Don't skip validation**
5. **Don't log sensitive data**
6. **Don't allow self-role-elevation**

## Integration with Other Modules

### Auth Module

- Creates users on signup
- Validates users on signin
- Updates refresh tokens
- Checks user active status

### Notifications Module

- Reads user preferences
- Filters by notification channels
- Respects notifyBefore setting

### Contests Module

- Filters contests by user preferences
- Checks subscribed platforms

## Related Documentation

- [Users API](/api/users) - API reference
- [Get Profile](/api/users/profile) - Get user profile
- [Update Profile](/api/users/update-profile) - Update profile
- [Auth Module](/server/modules/auth) - Authentication
- [User Schema](/server/database#user-schema) - Database schema

## Notes

- Users are soft-deleted (isActive flag) by default
- Hard delete is admin-only operation
- Email is unique and cannot be changed
- Role changes require admin privileges
- Preferences have sensible defaults
- Timestamps are automatically managed
