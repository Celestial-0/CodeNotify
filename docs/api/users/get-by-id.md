# Get User by ID

Get a specific user's public information by their ID.

## Endpoint

```http
GET /users/:id
```

## Authentication

**Required**: Yes (JWT access token)

```http
Authorization: Bearer <access_token>
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User's MongoDB ObjectId (24 hex characters) |

## Request

No request body required.

### Example URL

```
GET /users/507f1f77bcf86cd799439011
```

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
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique identifier |
| `email` | string | User's email address |
| `name` | string | User's full name |
| `phoneNumber` | string | User's phone number (optional) |
| `preferences` | object | User's notification preferences |
| `isActive` | boolean | Account active status |
| `createdAt` | string | Account creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

**Note**: `lastLogin` is not included for privacy reasons.

## Error Responses

### 400 Bad Request

Invalid user ID format.

```json
{
  "statusCode": 400,
  "message": ["User ID is required"],
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

User not found.

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Examples

### cURL

```bash
curl -X GET http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript (Fetch)

```javascript
const getUserById = async (userId, accessToken) => {
  const response = await fetch(`http://localhost:3000/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('User not found');
  }

  return await response.json();
};

// Usage
const user = await getUserById('507f1f77bcf86cd799439011', accessToken);
console.log('User:', user.name);
```

### Axios

```javascript
import axios from 'axios';

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response.status === 404) {
      console.error('User not found');
    }
    throw error;
  }
};
```

### Python (Requests)

```python
import requests

def get_user_by_id(user_id, access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(
        f'http://localhost:3000/users/{user_id}',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise Exception('User not found')
    else:
        raise Exception(f'Error: {response.json()}')
```

## Use Cases

### Display User Profile Page

```javascript
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
};
```

### Verify User Exists

```javascript
const userExists = async (userId) => {
  try {
    await fetch(`/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true;
  } catch (error) {
    return false;
  }
};
```

### Batch User Lookup

```javascript
const getUsersByIds = async (userIds) => {
  const promises = userIds.map(id =>
    fetch(`/users/${id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).then(res => res.json())
  );
  
  return await Promise.all(promises);
};

// Usage
const users = await getUsersByIds([
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013'
]);
```

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Get(':id')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async getUserById(@Param() params: GetUserByIdDto): Promise<{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> {
  return this.usersService.getUserByIdWithFormatting(params.id);
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async getUserByIdWithFormatting(id: string): Promise<{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> {
  const user = await this.getUserById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    preferences: user.preferences,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
```

### Validation Schema

**File**: `server/src/common/dto/user.dto.ts`

```typescript
export const GetUserByIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});
```

## Security Considerations

### Data Privacy

- Sensitive fields are excluded:
  - `password` (never exposed)
  - `refreshToken` (never exposed)
  - `lastLogin` (privacy - not shown to other users)

### Access Control

- Requires valid JWT token
- Any authenticated user can view other users
- For admin-only access, use the admin endpoints

### Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Scope**: Per IP address

## MongoDB ObjectId Format

Valid MongoDB ObjectId:
- **Length**: 24 hexadecimal characters
- **Format**: `[0-9a-f]{24}`
- **Example**: `507f1f77bcf86cd799439011`

Invalid IDs will return 400 Bad Request.

## Best Practices

### ✅ Do

1. **Validate ID format** before making request
2. **Handle 404 errors** gracefully
3. **Cache user data** if displaying multiple times
4. **Check user.isActive** before showing content
5. **Use for public profiles** or user lookups

### ❌ Don't

1. **Don't expose user IDs** unnecessarily
2. **Don't make excessive requests** (use caching)
3. **Don't assume user exists** (always handle 404)
4. **Don't display sensitive info** from response
5. **Don't use for authentication** (use JWT instead)

## Troubleshooting

### Issue: 400 Bad Request

**Cause**: Invalid user ID format

**Solution**: Ensure ID is 24-character hex string:
```javascript
const isValidObjectId = (id) => /^[0-9a-f]{24}$/i.test(id);
```

### Issue: 404 Not Found

**Causes**:
- User doesn't exist
- User was deleted
- Wrong user ID

**Solution**: Handle gracefully:
```javascript
try {
  const user = await getUserById(id);
} catch (error) {
  if (error.response?.status === 404) {
    console.log('User not found');
  }
}
```

## Related Endpoints

- [Get Profile](/api/users/profile) - Get own profile
- [Get All Users](/api/users/list) - List all users (admin)
- [Update Profile](/api/users/update-profile) - Update own profile

## Notes

- Any authenticated user can view other users' public info
- `lastLogin` is excluded for privacy
- Deactivated users (`isActive: false`) are still returned
- Response excludes password and refresh token
- MongoDB ObjectId is case-insensitive
