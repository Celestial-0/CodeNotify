# Activate Account

Reactivate a previously deactivated account.

## Endpoint

```http
PUT /users/activate
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
  "message": "Account activated successfully"
}
```

## Effect

- Sets `isActive` to `true`
- User can sign in again
- Restores full account access

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
curl -X PUT http://localhost:3000/users/activate \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript (Fetch)

```javascript
const activateAccount = async (accessToken) => {
  const response = await fetch('http://localhost:3000/users/activate', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to activate account');
  }

  return await response.json();
};

// Usage
const result = await activateAccount(accessToken);
console.log(result.message); // "Account activated successfully"
```

### React Component

```typescript
import { useState } from 'react';

const ActivateAccount = () => {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/users/activate', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        alert('Account activated successfully');
        window.location.reload();
      } else {
        alert('Failed to activate account');
      }
    } catch (error) {
      console.error('Activation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleActivate} disabled={loading}>
      {loading ? 'Activating...' : 'Activate Account'}
    </button>
  );
};
```

### Python (Requests)

```python
import requests

def activate_account(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.put(
        'http://localhost:3000/users/activate',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
result = activate_account(access_token)
print(result['message'])
```

## Use Cases

### Account Recovery

User wants to restore a previously deactivated account.

### Reactivation After Suspension

User can reactivate after temporary deactivation.

### Account Restoration

Restore full access after deactivation.

## Implementation Details

### Controller Method

**File**: `server/src/users/users.controller.ts`

```typescript
@Put('activate')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async activateAccount(
  @CurrentUser() user: UserDocument,
): Promise<{ message: string }> {
  return this.usersService.activateAccount(user);
}
```

### Service Method

**File**: `server/src/users/users.service.ts`

```typescript
activateAccount(user: UserDocument): { message: string } {
  this.activateUser(user.id);
  return { message: 'Account activated successfully' };
}

async activateUser(id: string): Promise<UserDocument> {
  const user = await this.userModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );
  
  if (!user) {
    throw new NotFoundException('User not found');
  }
  
  return user;
}
```

## Security Considerations

### JWT Required

- Requires valid access token
- User can only activate their own account
- Cannot activate other users' accounts

### Account Status

- Changes `isActive` from `false` to `true`
- Immediate effect on authentication

## Related Endpoints

- [Deactivate Account](/api/users/deactivate) - Deactivate account
- [Get Profile](/api/users/profile) - Check account status

## Notes

- Reverses deactivation
- Returns 200 OK
- User can sign in immediately after activation
- No data loss during deactivation/activation cycle
