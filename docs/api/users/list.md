# Get All Users (Admin)

Get a paginated list of all users. Admin only.

## Endpoint

```http
GET /users
```

## Authentication

**Required**: Yes (JWT access token with admin role)

```http
Authorization: Bearer <admin_access_token>
```

## Access Control

- **Role Required**: `admin`
- **Guard**: `JwtAuthGuard` + `RolesGuard`
- Regular users will receive 403 Forbidden

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Number of users per page (max 100) |
| `offset` | number | No | 0 | Number of users to skip |

### Example URLs

```
GET /users
GET /users?limit=50
GET /users?limit=20&offset=40
```

## Response

### Success (200 OK)

```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "user1@example.com",
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
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "preferences": {
        "platforms": ["codeforces", "leetcode", "codechef", "atcoder"],
        "alertFrequency": "immediate",
        "contestTypes": [],
        "notificationChannels": {
          "whatsapp": true,
          "email": true,
          "push": true
        },
        "notifyBefore": 24
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `users` | array | Array of user objects |
| `users[].id` | string | User's unique identifier |
| `users[].email` | string | User's email address |
| `users[].name` | string | User's full name |
| `users[].phoneNumber` | string | User's phone number (optional) |
| `users[].role` | string | User role ('user' or 'admin') |
| `users[].preferences` | object | User's notification preferences |
| `users[].isActive` | boolean | Account active status |
| `users[].createdAt` | string | Account creation timestamp |
| `users[].updatedAt` | string | Last update timestamp |
| `total` | number | Total number of users in database |
| `limit` | number | Number of users per page (from request) |
| `offset` | number | Number of users skipped (from request) |

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

### 403 Forbidden

User is not an admin.

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

## Examples

### Get First Page

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <admin_access_token>"
```

### Get with Pagination

```bash
curl -X GET "http://localhost:3000/users?limit=50&offset=0" \
  -H "Authorization: Bearer <admin_access_token>"
```

### JavaScript (Fetch)

```javascript
const getAllUsers = async (limit = 20, offset = 0) => {
  const response = await fetch(
    `http://localhost:3000/users?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${adminAccessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
};

// Usage
const { users, total, limit, offset } = await getAllUsers(20, 0);
console.log(`Showing ${users.length} of ${total} users`);
```

### React Component with Pagination

```typescript
import { useState, useEffect } from 'react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/users?limit=${limit}&offset=${page * limit}`,
          {
            headers: {
              'Authorization': `Bearer ${adminAccessToken}`
            }
          }
        );
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1>Users ({total})</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### Python (Requests)

```python
import requests

def get_all_users(admin_token, limit=20, offset=0):
    headers = {
        'Authorization': f'Bearer {admin_token}'
    }
    
    params = {
        'limit': limit,
        'offset': offset
    }
    
    response = requests.get(
        'http://localhost:3000/users',
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 403:
        raise Exception('Admin access required')
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
data = get_all_users(admin_token, limit=50, offset=0)
print(f"Total users: {data['total']}")
for user in data['users']:
    print(f"{user['name']} ({user['email']}) - {user['role']}")
```

## Pagination

### Calculate Pages

```javascript
const limit = 20;
const totalPages = Math.ceil(total / limit);
const currentPage = Math.floor(offset / limit) + 1;
```

### Navigate Pages

```javascript
// First page
const firstPage = { limit: 20, offset: 0 };

// Next page
const nextPage = { limit: 20, offset: offset + limit };

// Previous page
const prevPage = { limit: 20, offset: Math.max(0, offset - limit) };

// Last page
const lastPage = { limit: 20, offset: Math.floor(total / limit) * limit };

// Specific page (1-indexed)
const goToPage = (pageNum) => ({
  limit: 20,
  offset: (pageNum - 1) * limit
});
```

### Fetch All Users (Multiple Requests)

```javascript
const fetchAllUsers = async () => {
  const allUsers = [];
  const limit = 100; // Max per request
  let offset = 0;
  let total = 0;

  do {
    const response = await fetch(
      `/users?limit=${limit}&offset=${offset}`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    const data = await response.json();
    
    allUsers.push(...data.users);
    total = data.total;
    offset += limit;
  } while (offset < total);

  return allUsers;
};
```

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@HttpCode(HttpStatus.OK)
async getAllUsers(@Query() query: GetAllUsersDto): Promise<{
  users: Array<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: string;
    preferences: UserPreferences;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  limit: number;
  offset: number;
}> {
  const { users, total } = await this.usersService.getAllUsersWithPagination(
    query.limit,
    query.offset,
  );

  return {
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      preferences: user.preferences,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
    total,
    limit: query.limit,
    offset: query.offset,
  };
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async getAllUsersWithPagination(
  limit: number,
  offset: number,
): Promise<{ users: UserDocument[]; total: number }> {
  const [users, total] = await Promise.all([
    this.userModel
      .find()
      .select('-password -refreshToken')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    this.userModel.countDocuments().exec(),
  ]);

  return { users, total };
}
```

### Validation Schema

**File**: `server/src/common/dto/user.dto.ts`

```typescript
export const GetAllUsersSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
});
```

## Sorting

Users are sorted by **creation date (newest first)**.

```typescript
.sort({ createdAt: -1 })
```

## Security Considerations

### Admin-Only Access

- Requires `admin` role in JWT token
- Regular users receive 403 Forbidden
- Role is checked by `RolesGuard`

### Data Exclusions

Sensitive fields are excluded:
- `password` (hashed password)
- `refreshToken` (hashed refresh token)

### Rate Limiting

- **Limit**: 1000 requests per 15 minutes (admin)
- **Scope**: Per IP address
- Higher limit for admin operations

## Use Cases

### Admin Dashboard

Display all users with pagination, filtering, and actions.

### User Management

View, edit, and manage user accounts.

### Analytics

Count users by role, active status, or registration date.

### Export Users

Fetch all users for CSV export or backup.

## Best Practices

### ✅ Do

1. **Use pagination** (don't fetch all at once)
2. **Cache results** for better performance
3. **Handle 403 errors** (check admin role)
4. **Show loading states** during fetch
5. **Display total count** for user reference

### ❌ Don't

1. **Don't fetch without pagination** (performance issue)
2. **Don't expose admin endpoint** to regular users
3. **Don't ignore rate limits**
4. **Don't display sensitive data** (password, tokens)
5. **Don't make excessive requests**

## Related Endpoints

- [Get User by ID](/api/users/get-by-id) - Get specific user
- [Update User Role](/api/users/update-role) - Change user role (admin)
- [Delete User](/api/users/delete) - Delete user (admin)

## Notes

- Returns all users (active and inactive)
- Sorted by creation date (newest first)
- Password and refresh token are excluded
- Default limit is 20 users per page
- Total count includes all users in database
