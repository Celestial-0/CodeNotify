# User Schema

MongoDB schema for user accounts, authentication, and preferences.

## Overview

The User schema stores all user-related data including authentication credentials, profile information, notification preferences, and account status.

## Location

```
Server/src/users/schemas/user.schema.ts
```

## Schema Definition

### TypeScript Interface

```typescript
interface UserDocument extends Document {
  _id: Types.ObjectId;
  id: string;                    // Virtual field (string representation of _id)
  email: string;
  password: string;              // Hashed with bcrypt
  name: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  isActive: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;               // Auto-generated
  updatedAt: Date;               // Auto-generated
}
```

### Mongoose Schema

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

  @Prop({ /* preferences object */ })
  preferences: UserPreferences;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  lastLogin?: Date;
}
```

## Fields

### Required Fields

#### email
- **Type:** `String`
- **Required:** Yes
- **Unique:** Yes
- **Validation:** Must be valid email format
- **Description:** User's email address (used for login and notifications)

#### password
- **Type:** `String`
- **Required:** Yes
- **Description:** Hashed password using bcrypt (salt rounds: 10)
- **Security:** Never returned in API responses (excluded in DTOs)

#### name
- **Type:** `String`
- **Required:** Yes
- **Description:** User's full name

### Optional Fields

#### phoneNumber
- **Type:** `String`
- **Required:** No
- **Description:** User's phone number (for WhatsApp notifications)
- **Format:** International format recommended (e.g., +1234567890)

#### role
- **Type:** `String`
- **Enum:** `['user', 'admin']`
- **Default:** `'user'`
- **Description:** User role for authorization
- **Access Control:**
  - `user`: Standard user access
  - `admin`: Full system access (sync, bulk operations, user management)

#### preferences
- **Type:** `UserPreferences` (embedded object)
- **Required:** Yes (has defaults)
- **Description:** User notification and contest preferences
- **See:** [Preferences Structure](#preferences-structure)

#### isActive
- **Type:** `Boolean`
- **Default:** `true`
- **Description:** Account activation status
- **Behavior:**
  - `true`: User can login and receive notifications
  - `false`: User cannot login, no notifications sent

#### refreshToken
- **Type:** `String`
- **Required:** No
- **Description:** JWT refresh token for maintaining sessions
- **Lifecycle:** Set on login, cleared on logout
- **Expiration:** 7 days

#### lastLogin
- **Type:** `Date`
- **Required:** No
- **Description:** Timestamp of user's last successful login
- **Updated:** On every successful signin

### Auto-Generated Fields

#### createdAt
- **Type:** `Date`
- **Auto-generated:** Yes (via `timestamps: true`)
- **Description:** Account creation timestamp

#### updatedAt
- **Type:** `Date`
- **Auto-generated:** Yes (via `timestamps: true`)
- **Description:** Last update timestamp

## Preferences Structure

Embedded object for user notification and contest preferences.

```typescript
interface UserPreferences {
  platforms: string[];              // Enabled platforms
  alertFrequency: string;           // Notification frequency
  contestTypes: string[];           // Preferred contest types
  notificationChannels: {           // Enabled channels
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  notifyBefore: number;             // Hours before contest
}
```

### preferences.platforms
- **Type:** `Array<String>`
- **Enum:** `['codeforces', 'leetcode', 'codechef', 'atcoder']`
- **Default:** `['codeforces', 'leetcode']`
- **Description:** Platforms user wants to receive notifications from
- **Behavior:** Only contests from enabled platforms trigger notifications

### preferences.alertFrequency
- **Type:** `String`
- **Enum:** `['immediate', 'daily', 'weekly']`
- **Default:** `'immediate'`
- **Description:** How often to send notifications
- **Options:**
  - `immediate`: Send as soon as contest matches criteria
  - `daily`: Batch notifications once per day
  - `weekly`: Batch notifications once per week

### preferences.contestTypes
- **Type:** `Array<String>`
- **Default:** `[]` (all types)
- **Description:** Filter by specific contest types
- **Examples:** `['CF', 'WEEKLY', 'STARTERS', 'ABC']`
- **Behavior:** Empty array = all types

### preferences.notificationChannels
- **Type:** `Object`
- **Description:** Enable/disable notification channels

#### notificationChannels.whatsapp
- **Type:** `Boolean`
- **Default:** `true`
- **Description:** Enable WhatsApp notifications
- **Requires:** Valid `phoneNumber` field

#### notificationChannels.email
- **Type:** `Boolean`
- **Default:** `true`
- **Description:** Enable email notifications
- **Requires:** Valid `email` field (always present)

#### notificationChannels.push
- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Enable push notifications
- **Status:** 🚧 Not yet implemented

### preferences.notifyBefore
- **Type:** `Number`
- **Default:** `24`
- **Unit:** Hours
- **Range:** `1-168` (1 hour to 7 days)
- **Description:** Send notification X hours before contest starts
- **Example:** `24` = notify 24 hours before contest

## Virtual Fields

### id
- **Type:** `String`
- **Virtual:** Yes
- **Description:** String representation of `_id`
- **Usage:** Returned in API responses instead of `_id`
- **Implementation:**
  ```typescript
  UserSchema.virtual('id').get(function (this: UserDocument) {
    return this._id.toHexString();
  });
  ```

## Indexes

### Unique Indexes

```typescript
{ email: 1 } // Unique index on email
```

**Purpose:** Ensure email uniqueness and fast login queries

### Recommended Additional Indexes

```typescript
{ isActive: 1 }                           // Filter active users
{ 'preferences.platforms': 1 }            // Filter by platform
{ role: 1 }                               // Filter by role
{ lastLogin: -1 }                         // Sort by last login
{ createdAt: -1 }                         // Sort by registration date
```

## Schema Configuration

### Timestamps

```typescript
@Schema({ timestamps: true })
```

Automatically adds `createdAt` and `updatedAt` fields.

### Virtual Fields

```typescript
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
```

Ensures virtual fields (like `id`) are included in JSON/Object output.

## Example Documents

### Standard User

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2b$10$...", // bcrypt hash
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "user",
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "alertFrequency": "immediate",
    "contestTypes": [],
    "notificationChannels": {
      "whatsapp": true,
      "email": true,
      "push": false
    },
    "notifyBefore": 24
  },
  "isActive": true,
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "lastLogin": "2024-02-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-15T10:30:00.000Z"
}
```

### Admin User

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "id": "507f1f77bcf86cd799439012",
  "email": "admin@codenotify.com",
  "password": "$2b$10$...",
  "name": "Admin User",
  "role": "admin",
  "preferences": {
    "platforms": ["codeforces", "leetcode", "codechef", "atcoder"],
    "alertFrequency": "immediate",
    "contestTypes": [],
    "notificationChannels": {
      "whatsapp": false,
      "email": true,
      "push": false
    },
    "notifyBefore": 48
  },
  "isActive": true,
  "lastLogin": "2024-02-15T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-15T12:00:00.000Z"
}
```

### Inactive User

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "507f1f77bcf86cd799439013",
  "email": "inactive@example.com",
  "password": "$2b$10$...",
  "name": "Inactive User",
  "role": "user",
  "preferences": { /* ... */ },
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-10T15:00:00.000Z"
}
```

## Validation Rules

### Email
- Must be unique
- Must be valid email format
- Cannot be empty

### Password
- Minimum 8 characters (enforced in DTO)
- Must contain uppercase, lowercase, number, special char (enforced in DTO)
- Hashed before storage (never stored in plain text)

### Name
- Cannot be empty
- Minimum 2 characters (enforced in DTO)

### Phone Number
- Optional
- Should be in international format
- Validated in DTO if provided

### Preferences
- `platforms`: Must be array of valid platform names
- `alertFrequency`: Must be one of enum values
- `notifyBefore`: Must be between 1 and 168 hours
- `notificationChannels`: Each channel must be boolean

## Security Considerations

### Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

// Hash password before saving
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verify password
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

### Password Exclusion

Password is never returned in API responses:

```typescript
// In DTOs
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  // password is NOT included
}
```

### Refresh Token Security

- Stored hashed in database
- Cleared on logout
- Expires after 7 days
- Rotated on each refresh

## Common Queries

### Find User by Email

```typescript
const user = await this.userModel.findOne({ email: 'user@example.com' });
```

### Find Active Users

```typescript
const activeUsers = await this.userModel.find({ isActive: true });
```

### Find Users by Platform

```typescript
const users = await this.userModel.find({
  'preferences.platforms': 'codeforces'
});
```

### Update Preferences

```typescript
await this.userModel.findByIdAndUpdate(
  userId,
  { $set: { 'preferences.notifyBefore': 48 } },
  { new: true }
);
```

### Deactivate User

```typescript
await this.userModel.findByIdAndUpdate(
  userId,
  { isActive: false },
  { new: true }
);
```

## Relationships

### One-to-Many with Notifications

```typescript
// User has many notifications
Notification.userId -> User._id
```

### Referenced in Contests (indirectly)

Users receive notifications about contests based on their preferences.

## Migration Notes

### Adding New Platform

1. Add platform to `preferences.platforms` enum
2. Update default preferences
3. Migrate existing users (optional):
   ```typescript
   await this.userModel.updateMany(
     {},
     { $addToSet: { 'preferences.platforms': 'newplatform' } }
   );
   ```

### Adding New Notification Channel

1. Add channel to `notificationChannels` object
2. Set default value
3. Update existing users:
   ```typescript
   await this.userModel.updateMany(
     { 'preferences.notificationChannels.newchannel': { $exists: false } },
     { $set: { 'preferences.notificationChannels.newchannel': false } }
   );
   ```

## Performance Optimization

### Recommended Indexes

```typescript
// For authentication
db.users.createIndex({ email: 1 }, { unique: true });

// For filtering active users
db.users.createIndex({ isActive: 1 });

// For notification queries
db.users.createIndex({ 'preferences.platforms': 1, isActive: 1 });

// For admin queries
db.users.createIndex({ role: 1 });

// For analytics
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ lastLogin: -1 });
```

### Query Optimization Tips

1. **Use projection** to fetch only needed fields
2. **Index frequently queried fields** (email, isActive, role)
3. **Use lean()** for read-only queries
4. **Batch updates** for bulk operations

## Best Practices

### ✅ Do

1. **Hash passwords** before storing
2. **Validate email uniqueness** before creation
3. **Clear refresh token** on logout
4. **Update lastLogin** on successful signin
5. **Use transactions** for critical updates
6. **Exclude password** from API responses
7. **Validate preferences** before saving

### ❌ Don't

1. **Don't store plain text passwords**
2. **Don't return password** in API responses
3. **Don't allow duplicate emails**
4. **Don't skip validation** on preferences
5. **Don't expose refresh tokens** in logs
6. **Don't hard-delete users** (use soft delete with isActive)

## Related Documentation

- [User API Endpoints](/api/users)
- [Authentication Flow](/guide/authentication)
- [User Preferences](/api/users/update-profile)
- [Database Indexes](/server/database/indexes)
- [Users Module](/server/modules/users)
