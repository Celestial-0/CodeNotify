# Get User Profile

Get the authenticated user's profile information.

## Endpoint

```http
GET /users/profile
```

## Authentication

**Required**: Yes (JWT access token)

```http
Authorization: Bearer <access_token>
```

## Request

No request body or parameters required. User information is extracted from the JWT token.

## Response

### Success (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
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
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T12:00:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique identifier (MongoDB ObjectId) |
| `email` | string | User's email address |
| `name` | string | User's full name |
| `phoneNumber` | string | User's phone number (optional) |
| `preferences` | object | User's notification preferences |
| `preferences.platforms` | string[] | Subscribed platforms |
| `preferences.alertFrequency` | string | Notification frequency |
| `preferences.contestTypes` | string[] | Preferred contest types |
| `preferences.notificationChannels` | object | Enabled notification channels |
| `preferences.notifyBefore` | number | Hours before contest to notify |
| `isActive` | boolean | Account active status |
| `createdAt` | string | Account creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |
| `lastLogin` | string | Last login timestamp (ISO 8601, optional) |

## Error Responses

### 401 Unauthorized

Missing or invalid JWT token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Causes**:
- Missing Authorization header
- Invalid token format
- Expired access token
- User not found
- Account deactivated

## Examples

### cURL

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profile = await response.json();
console.log('User Profile:', profile);
```

### Axios

```javascript
import axios from 'axios';

const getProfile = async (accessToken) => {
  try {
    const response = await axios.get('http://localhost:3000/users/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error.response.data);
    throw error;
  }
};
```

### Python (Requests)

```python
import requests

def get_profile(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(
        'http://localhost:3000/users/profile',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
profile = get_profile(access_token)
print(f"Name: {profile['name']}")
print(f"Email: {profile['email']}")
```

## Use Cases

### Display User Dashboard

```javascript
const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile.name}!</h1>
      <p>Email: {profile.email}</p>
      <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
      <p>Subscribed platforms: {profile.preferences.platforms.join(', ')}</p>
    </div>
  );
};
```

### Check Account Status

```javascript
const checkAccountStatus = async (accessToken) => {
  const profile = await fetch('/users/profile', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }).then(res => res.json());

  if (!profile.isActive) {
    alert('Your account is deactivated. Please contact support.');
    return false;
  }

  return true;
};
```

### Sync Profile Data

```javascript
// Fetch and cache profile data
const syncProfile = async () => {
  const profile = await fetch('/users/profile', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }).then(res => res.json());

  // Store in local state/context
  localStorage.setItem('userProfile', JSON.stringify(profile));
  
  return profile;
};
```

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
getProfile(@CurrentUser() user: UserDocument) {
  return this.usersService.getProfile(user);
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
getProfile(user: UserDocument): {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    preferences: user.preferences,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };
}
```

### Guards Applied

1. **JwtAuthGuard**: Validates JWT token and loads user
2. **@CurrentUser()**: Extracts user from request (populated by JwtStrategy)

### Data Exclusions

The following sensitive fields are **NOT** included in the response:
- `password` (hashed password)
- `refreshToken` (hashed refresh token)
- `_id` (MongoDB internal ID - use `id` instead)

## Security Considerations

### Token Validation

- JWT token is validated on every request
- User existence is verified in database
- Account active status is checked
- Expired tokens are rejected (15-minute expiry)

### Data Privacy

- Only the authenticated user can access their own profile
- Sensitive fields (password, refreshToken) are never exposed
- Phone number is optional and only visible to the user

### Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Scope**: Per IP address
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Best Practices

### ✅ Do

1. **Cache profile data** in client state (Redux, Context)
2. **Refresh on updates** after profile changes
3. **Handle 401 errors** by refreshing token or re-login
4. **Display loading states** while fetching
5. **Validate token expiry** before making request

### ❌ Don't

1. **Don't fetch on every render** (use caching)
2. **Don't expose tokens** in console logs
3. **Don't store sensitive data** in localStorage
4. **Don't ignore error responses**
5. **Don't make unnecessary requests**

## Troubleshooting

### Issue: 401 Unauthorized

**Symptoms**: Getting 401 even with token

**Checks**:
1. Token format: `Bearer <token>` (note the space)
2. Token not expired (15 minutes)
3. User exists in database
4. Account is active (`isActive: true`)

**Solution**: Refresh token or re-login

### Issue: Missing Fields

**Symptoms**: Some fields are undefined

**Cause**: Optional fields may not be set

**Solution**: Check for field existence before using:
```javascript
const phone = profile.phoneNumber || 'Not provided';
const lastLogin = profile.lastLogin || 'Never';
```

### Issue: Outdated Data

**Symptoms**: Profile shows old data

**Cause**: Cached data not refreshed after update

**Solution**: Refetch profile after updates:
```javascript
await updateProfile(data);
await fetchProfile(); // Refresh
```

## Related Endpoints

- [Update Profile](/api/users/update-profile) - Update user information
- [Deactivate Account](/api/users/deactivate) - Deactivate account
- [Activate Account](/api/users/activate) - Reactivate account
- [Sign Out](/api/auth/signout) - End session
- [Refresh Token](/api/auth/refresh) - Renew access token

## Notes

- Profile data is returned directly from the authenticated user object
- No database query is needed (user already loaded by JwtStrategy)
- Response includes all user data except sensitive fields
- `lastLogin` is updated on every sign-in
- `updatedAt` is updated on every profile change
