# Update User Role (Admin)

Update a user's role. Admin only.

## Endpoint

```http
PATCH /users/:id/role
```

## Authentication

**Required**: JWT access token with **admin** role

```http
Authorization: Bearer <admin_access_token>
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User's MongoDB ObjectId |

## Request Body

```json
{
  "role": "admin"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | New role ('user' or 'admin') |

### Valid Roles

- `user` - Regular user (default)
- `admin` - Administrator with elevated privileges

## Response

### Success (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "message": "User role updated to admin successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique identifier |
| `email` | string | User's email |
| `name` | string | User's name |
| `role` | string | Updated role |
| `message` | string | Success message |

## Error Responses

### 400 Bad Request

Invalid role value.

```json
{
  "statusCode": 400,
  "message": ["role must be one of: user, admin"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

Missing or invalid token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

Not an admin user.

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
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
# Promote user to admin
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'

# Demote admin to user
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "user"}'
```

### JavaScript (Fetch)

```javascript
const updateUserRole = async (userId, role, adminToken) => {
  const response = await fetch(`http://localhost:3000/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role })
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  return await response.json();
};

// Usage
const result = await updateUserRole('507f1f77bcf86cd799439011', 'admin', adminToken);
console.log(result.message);
```

### React Admin Panel

```typescript
import { useState } from 'react';

const UserRoleManager = ({ userId, currentRole }) => {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole) => {
    if (!confirm(`Change role to ${newRole}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const data = await response.json();
        setRole(newRole);
        alert(data.message);
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Role update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Current Role: {role}</p>
      <select 
        value={role} 
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={loading}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
};
```

### Python (Requests)

```python
import requests

def update_user_role(user_id, role, admin_token):
    headers = {
        'Authorization': f'Bearer {admin_token}',
        'Content-Type': 'application/json'
    }
    
    data = {'role': role}
    
    response = requests.patch(
        f'http://localhost:3000/users/{user_id}/role',
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
result = update_user_role('507f1f77bcf86cd799439011', 'admin', admin_token)
print(result['message'])
```

## Use Cases

### Promote to Admin

Grant admin privileges to a trusted user.

### Demote from Admin

Remove admin privileges from a user.

### Role Management

Manage user permissions in admin panel.

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Patch(':id/role')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@HttpCode(HttpStatus.OK)
async updateUserRole(
  @Param() params: UpdateUserRoleDto,
  @Body() body: UpdateUserRoleBodyDto,
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  message: string;
}> {
  const user = await this.usersService.updateUserRole(params.id, body.role);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    message: `User role updated to ${body.role} successfully`,
  };
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<UserDocument> {
  const user = await this.userModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}
```

### Validation

**File**: `server/src/common/dto/user.dto.ts`

```typescript
export const UpdateUserRoleBodySchema = z.object({
  role: z.enum(['user', 'admin']),
});
```

## Security Considerations

### Admin Only

- Requires admin role
- Protected by RolesGuard
- Regular users get 403 Forbidden

### Role Values

- Only 'user' and 'admin' allowed
- Validated with Zod enum
- Invalid values return 400 Bad Request

### Self-Modification

- Admins can change their own role
- Be careful not to remove all admins

## Best Practices

### ✅ Do

1. **Verify admin count** before demoting
2. **Log role changes** for audit trail
3. **Notify user** of role change
4. **Require confirmation** in UI
5. **Check permissions** after role change

### ❌ Don't

1. **Don't remove last admin**
2. **Don't allow self-demotion** without confirmation
3. **Don't expose role change** to regular users
4. **Don't skip validation**

## Related Endpoints

- [Get User by ID](/api/users/get-by-id) - View user details
- [List All Users](/api/users/list) - List users with roles
- [Delete User](/api/users/delete) - Delete user (admin)

## Notes

- **Admin only** operation
- Returns 200 OK
- Role change is immediate
- User's JWT token remains valid but permissions change
- User may need to refresh token to see new permissions
