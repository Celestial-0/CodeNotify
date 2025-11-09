# Delete User (Admin)

Permanently delete a user from the database. Admin only.

## Endpoint

```http
DELETE /users/:id
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

## Response

### Success (200 OK)

```json
{
  "message": "User deleted successfully"
}
```

## Effect

- **Permanent deletion** from database
- Cannot be undone
- All user data is removed
- User cannot sign in

## Error Responses

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
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <admin_token>"
```

### JavaScript (Fetch)

```javascript
const deleteUser = async (userId, adminToken) => {
  const response = await fetch(`http://localhost:3000/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }

  return await response.json();
};

// Usage
const result = await deleteUser('507f1f77bcf86cd799439011', adminToken);
console.log(result.message); // "User deleted successfully"
```

### React Admin Panel

```typescript
import { useState } from 'react';

const DeleteUserButton = ({ userId, userName }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        alert('User deleted successfully');
        window.location.reload();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn-danger"
    >
      {loading ? 'Deleting...' : 'Delete User'}
    </button>
  );
};
```

### Python (Requests)

```python
import requests

def delete_user(user_id, admin_token):
    headers = {
        'Authorization': f'Bearer {admin_token}'
    }
    
    response = requests.delete(
        f'http://localhost:3000/users/{user_id}',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise Exception('User not found')
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
result = delete_user('507f1f77bcf86cd799439011', admin_token)
print(result['message'])
```

## Use Cases

### Remove Spam Accounts

Delete fake or spam user accounts.

### GDPR Compliance

Permanently remove user data upon request.

### Account Cleanup

Remove inactive or problematic accounts.

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@HttpCode(HttpStatus.OK)
async deleteUser(
  @Param() params: DeleteUserDto,
): Promise<{ message: string }> {
  await this.usersService.deleteUserById(params.id);
  return { message: 'User deleted successfully' };
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async deleteUserById(userId: string): Promise<void> {
  const result = await this.userModel.findByIdAndDelete(userId);
  
  if (!result) {
    throw new NotFoundException('User not found');
  }
}
```

### Validation

**File**: `server/src/common/dto/user.dto.ts`

```typescript
export const DeleteUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});
```

## Security Considerations

### Admin Only

- Requires admin role
- Protected by JwtAuthGuard + RolesGuard
- Regular users get 403 Forbidden

### Permanent Deletion

- **Hard delete** from database
- Cannot be recovered
- All user data removed

### Self-Deletion

- Admins can delete their own account
- Be careful not to remove all admins

## Alternative: Soft Delete

Consider using [Deactivate Account](/api/users/deactivate) instead for:
- Reversible deletion
- Data preservation
- Compliance requirements

## Best Practices

### ✅ Do

1. **Require confirmation** in UI
2. **Log deletion** for audit trail
3. **Check admin count** before deleting
4. **Backup data** before deletion
5. **Notify user** if required by policy

### ❌ Don't

1. **Don't delete without confirmation**
2. **Don't delete last admin**
3. **Don't expose to regular users**
4. **Don't skip validation**
5. **Don't delete without audit log**

## Comparison: Delete vs Deactivate

| Feature | Delete | Deactivate |
|---------|--------|------------|
| Reversible | ❌ No | ✅ Yes |
| Data preserved | ❌ No | ✅ Yes |
| Can sign in | ❌ No | ❌ No |
| Admin only | ✅ Yes | ❌ No |
| HTTP Method | DELETE | DELETE |
| Endpoint | `/users/:id` | `/users/profile` |

## Related Endpoints

- [Deactivate Account](/api/users/deactivate) - Soft delete (reversible)
- [Get User by ID](/api/users/get-by-id) - View user before deletion
- [List All Users](/api/users/list) - Find users to delete

## Notes

- **Admin only** operation
- **Permanent deletion** - cannot be undone
- Returns 200 OK (not 204 No Content)
- User's refresh tokens are also removed
- Consider soft delete (deactivate) for most use cases
- Hard delete should be used sparingly
