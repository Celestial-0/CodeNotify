# Deactivate Account

Deactivate your own user account (soft delete).

## Endpoint

```http
DELETE /users/profile
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
  "message": "Account deactivated successfully"
}
```

## Effect

- Sets `isActive` to `false`
- User cannot sign in until account is reactivated
- Account data is preserved (soft delete)
- Can be reversed using the activate endpoint

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

## Examples

### cURL

```bash
curl -X DELETE http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript (Fetch)

```javascript
const deactivateAccount = async (accessToken) => {
  const response = await fetch('http://localhost:3000/users/profile', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to deactivate account');
  }

  return await response.json();
};

// Usage
const result = await deactivateAccount(accessToken);
console.log(result.message); // "Account deactivated successfully"
```

### React Component

```typescript
import { useState } from 'react';

const DeactivateAccount = () => {
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your account?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/users/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        alert('Account deactivated successfully');
        // Redirect to login
        window.location.href = '/login';
      } else {
        alert('Failed to deactivate account');
      }
    } catch (error) {
      console.error('Deactivation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDeactivate} disabled={loading}>
      {loading ? 'Deactivating...' : 'Deactivate Account'}
    </button>
  );
};
```

### Python (Requests)

```python
import requests

def deactivate_account(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.delete(
        'http://localhost:3000/users/profile',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
result = deactivate_account(access_token)
print(result['message'])
```

## Use Cases

### Account Deletion Request

Allow users to deactivate their account from settings.

### Temporary Suspension

User can deactivate and later reactivate their account.

### Privacy Control

User wants to stop receiving notifications without deleting data.

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Delete('profile')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async deactivateAccount(
  @CurrentUser() user: UserDocument,
): Promise<{ message: string }> {
  return await this.usersService.deactivateAccount(user);
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
async deactivateAccount(user: UserDocument): Promise<{ message: string }> {
  await this.deactivateUser(user.id);
  return { message: 'Account deactivated successfully' };
}

async deactivateUser(id: string): Promise<UserDocument> {
  const user = await this.userModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  
  if (!user) {
    throw new NotFoundException('User not found');
  }
  
  return user;
}
```

## Security Considerations

### Soft Delete

- Account is not permanently deleted
- Data is preserved for potential reactivation
- User cannot sign in while deactivated

### JWT Validation

- Requires valid access token
- User identity verified from token
- Cannot deactivate other users' accounts

### Reactivation

- User can reactivate using the activate endpoint
- Requires valid credentials

## Related Endpoints

- [Activate Account](/api/users/activate) - Reactivate account
- [Delete User](/api/users/delete) - Permanent deletion (admin only)
- [Get Profile](/api/users/profile) - View account status

## Notes

- This is a **soft delete** (sets `isActive: false`)
- User cannot sign in while deactivated
- Account can be reactivated
- All user data is preserved
- Returns 200 OK (not 204 No Content)
- Refresh tokens remain in database but are invalid for deactivated users
