# Update User Profile

Update the authenticated user's profile information and notification preferences.

## Endpoint

```http
PUT /users/profile
```

## Authentication

**Required**: Yes (JWT access token)

```http
Authorization: Bearer <access_token>
```

## Request Body

All fields are optional. Only include fields you want to update.

```typescript
{
  name?: string;              // Min 2 characters
  phoneNumber?: string;       // Phone number
  preferences?: {
    platforms?: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
    alertFrequency?: 'immediate' | 'daily' | 'weekly';
    contestTypes?: string[];
    notificationChannels?: {
      whatsapp?: boolean;
      email?: boolean;
      push?: boolean;
    };
    notifyBefore?: number;    // 1-168 hours
  };
}
```

### Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | No | Minimum 2 characters |
| `phoneNumber` | string | No | Any string format |
| `preferences.platforms` | array | No | Valid platform names |
| `preferences.alertFrequency` | string | No | 'immediate', 'daily', or 'weekly' |
| `preferences.contestTypes` | array | No | Array of strings |
| `preferences.notificationChannels.whatsapp` | boolean | No | true or false |
| `preferences.notificationChannels.email` | boolean | No | true or false |
| `preferences.notificationChannels.push` | boolean | No | true or false |
| `preferences.notifyBefore` | number | No | 1-168 (hours) |

## Response

### Success (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Smith",
  "phoneNumber": "+1234567890",
  "preferences": {
    "platforms": ["codeforces", "leetcode", "codechef"],
    "alertFrequency": "daily",
    "contestTypes": ["div1", "div2"],
    "notificationChannels": {
      "whatsapp": true,
      "email": true,
      "push": true
    },
    "notifyBefore": 48
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique identifier |
| `email` | string | User's email (cannot be changed) |
| `name` | string | Updated name |
| `phoneNumber` | string | Updated phone number |
| `preferences` | object | Updated preferences |

## Error Responses

### 400 Bad Request

Invalid request body or validation failure.

```json
{
  "statusCode": 400,
  "message": [
    "Name must be at least 2 characters long",
    "notifyBefore must be between 1 and 168",
    "platforms must contain valid platform names"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized

Missing or invalid JWT token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found

User not found in database.

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Examples

### Update Name Only

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

### Update Preferences

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "platforms": ["codeforces", "leetcode", "codechef"],
      "alertFrequency": "daily",
      "notifyBefore": 48
    }
  }'
```

### Update Multiple Fields

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phoneNumber": "+1234567890",
    "preferences": {
      "platforms": ["codeforces", "leetcode"],
      "alertFrequency": "immediate",
      "notificationChannels": {
        "whatsapp": true,
        "email": true,
        "push": false
      }
    }
  }'
```

### JavaScript (Fetch)

```javascript
const updateProfile = async (updates) => {
  const response = await fetch('http://localhost:3000/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};

// Usage
const updatedProfile = await updateProfile({
  name: 'John Smith',
  preferences: {
    platforms: ['codeforces', 'leetcode', 'codechef'],
    alertFrequency: 'daily'
  }
});
```

### React Component

```typescript
import { useState } from 'react';

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [alertFrequency, setAlertFrequency] = useState('immediate');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          preferences: {
            platforms,
            alertFrequency
          }
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        minLength={2}
      />
      
      <select
        value={alertFrequency}
        onChange={(e) => setAlertFrequency(e.target.value)}
      >
        <option value="immediate">Immediate</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
```

### Python (Requests)

```python
import requests

def update_profile(access_token, updates):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.put(
        'http://localhost:3000/users/profile',
        headers=headers,
        json=updates
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
updated = update_profile(access_token, {
    'name': 'John Smith',
    'preferences': {
        'platforms': ['codeforces', 'leetcode'],
        'alertFrequency': 'daily'
    }
})
```

## Use Cases

### Change Notification Frequency

```javascript
// Switch to daily digest
await fetch('/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      alertFrequency: 'daily'
    }
  })
});
```

### Subscribe to New Platform

```javascript
// Add CodeChef to subscribed platforms
const currentProfile = await fetch('/users/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
}).then(res => res.json());

await fetch('/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      platforms: [...currentProfile.preferences.platforms, 'codechef']
    }
  })
});
```

### Enable Push Notifications

```javascript
await fetch('/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      notificationChannels: {
        whatsapp: true,
        email: true,
        push: true  // Enable push
      }
    }
  })
});
```

### Update Notification Timing

```javascript
// Get notified 2 days before contest
await fetch('/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      notifyBefore: 48  // 48 hours = 2 days
    }
  })
});
```

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Put('profile')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async updateProfile(
  @CurrentUser() user: UserDocument,
  @Body() updateUserDto: UpdateUserDto,
): Promise<{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
}> {
  return this.usersService.updateProfile(user, updateUserDto);
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async updateProfile(
  user: UserDocument,
  updateUserDto: UpdateUserDto,
): Promise<{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
}> {
  const updatedUser = await this.updateUser(user.id, updateUserDto);
  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    phoneNumber: updatedUser.phoneNumber,
    preferences: updatedUser.preferences,
  };
}
```

### Validation Schema

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
```

## Preferences Guide

### Platforms

Choose which platforms to receive notifications from:

- **codeforces** - Codeforces contests
- **leetcode** - LeetCode weekly/biweekly contests
- **codechef** - CodeChef contests (Long, Cook-Off, Lunchtime, Starters)
- **atcoder** - AtCoder contests (ABC, ARC, AGC, AHC)

### Alert Frequency

- **immediate** - Get notified as soon as contest is announced
- **daily** - Receive daily digest at 9 AM with upcoming contests
- **weekly** - Receive weekly digest every Monday with week's contests

### Contest Types

Filter by contest type (platform-specific):
- Codeforces: `div1`, `div2`, `div3`, `div4`, `educational`, `global`
- LeetCode: `weekly`, `biweekly`
- CodeChef: `long`, `cookoff`, `lunchtime`, `starters`
- AtCoder: `abc`, `arc`, `agc`, `ahc`

### Notification Channels

- **whatsapp** - WhatsApp messages (requires phone number)
- **email** - Email notifications
- **push** - Browser/mobile push notifications

### Notify Before

Hours before contest start to send notification (1-168 hours):
- `1` - 1 hour before
- `24` - 1 day before (default)
- `48` - 2 days before
- `168` - 7 days before

## Security Considerations

### Protected Fields

The following fields **cannot** be updated via this endpoint:
- `email` - Use separate email change endpoint
- `password` - Use password change endpoint
- `role` - Admin-only operation
- `isActive` - Use deactivate/activate endpoints
- `refreshToken` - Managed by auth system
- `createdAt` - Immutable
- `lastLogin` - Managed by auth system

### Validation

- All inputs are validated with Zod schemas
- Name must be at least 2 characters
- Platforms must be valid enum values
- notifyBefore must be 1-168 hours
- Invalid data returns 400 Bad Request

### Rate Limiting

- **Limit**: 20 requests per 15 minutes
- **Scope**: Per IP address
- Prevents abuse and excessive updates

## Best Practices

### ✅ Do

1. **Validate client-side** before sending request
2. **Show loading states** during update
3. **Refresh profile data** after successful update
4. **Handle errors gracefully** with user-friendly messages
5. **Only send changed fields** (partial updates)

### ❌ Don't

1. **Don't send unchanged data** (wastes bandwidth)
2. **Don't update too frequently** (rate limits)
3. **Don't ignore validation errors**
4. **Don't store sensitive data** in preferences
5. **Don't bypass client-side validation**

## Troubleshooting

### Issue: 400 Validation Error

**Symptoms**: Getting validation errors

**Common Causes**:
- Name too short (< 2 characters)
- Invalid platform name
- notifyBefore out of range (not 1-168)
- Invalid alertFrequency value

**Solution**: Check validation rules and fix input

### Issue: Changes Not Reflected

**Symptoms**: Update succeeds but changes not visible

**Cause**: Cached profile data not refreshed

**Solution**: Refetch profile after update:
```javascript
await updateProfile(changes);
const newProfile = await fetchProfile();
```

### Issue: Partial Update Not Working

**Symptoms**: All preferences reset when updating one field

**Cause**: Sending incomplete preferences object

**Solution**: Only send fields you want to change:
```javascript
// ✅ Correct - only update alertFrequency
{ preferences: { alertFrequency: 'daily' } }

// ❌ Wrong - resets other preferences
{ preferences: { alertFrequency: 'daily', platforms: [] } }
```

## Related Endpoints

- [Get Profile](/api/users/profile) - Get current profile
- [Deactivate Account](/api/users/deactivate) - Deactivate account
- [Sign Out](/api/auth/signout) - End session

## Notes

- Email cannot be changed via this endpoint
- Password changes require separate endpoint
- Role changes are admin-only
- Updates are atomic (all or nothing)
- `updatedAt` timestamp is automatically updated
- Preferences are merged with existing values (partial updates supported)
