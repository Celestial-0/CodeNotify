# 👤 Users API Documentation

## Overview

The Users API provides comprehensive user management functionality for CodeNotify, including profile management, user lookup, and account status control. All endpoints require JWT authentication via Bearer token.

## Base URL

```
/users
```

## Authentication

All endpoints require authentication using JWT Bearer tokens:

```
Authorization: Bearer <access_token>
```

## API Endpoints

| Method | Endpoint | Description | Status Code | Response Type |
|--------|----------|-------------|-------------|---------------|
| GET | `/users/profile` | Get current user profile | 200 | User Profile |
| PUT | `/users/profile` | Update current user profile | 200 | Updated Profile |
| GET | `/users/:id` | Get user by ID | 200 | User Profile |
| DELETE | `/users/profile` | Deactivate current user account | 200 | Success Message |
| PUT | `/users/activate` | Activate current user account | 200 | Success Message |

## Data Models

### User Profile Response

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

### User Preferences

```typescript
interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
}
```

### Update User DTO

```typescript
interface UpdateUserDto {
  name?: string;
  phoneNumber?: string;
  preferences?: {
    platforms?: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
    alertFrequency?: 'immediate' | 'daily' | 'weekly';
    contestTypes?: string[];
  };
}
```

## Validation Schemas

### Update User Schema

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phoneNumber: z.string().optional(),
  preferences: z.object({
    platforms: z.array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder'])).optional(),
    alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
    contestTypes: z.array(z.string()).optional(),
  }).optional(),
});
```

### Get User By ID Schema

```typescript
export const GetUserByIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});
```

## Endpoint Details

### 1. Get Current User Profile

**GET** `/users/profile`

Retrieves the profile information for the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "alertFrequency": "immediate",
    "contestTypes": ["div2", "div1"]
  },
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T15:45:00.000Z",
  "lastLogin": "2023-09-06T15:45:00.000Z"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Update Current User Profile

**PUT** `/users/profile`

Updates the profile information for the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phoneNumber": "+1987654321",
  "preferences": {
    "platforms": ["leetcode", "codechef", "atcoder"],
    "alertFrequency": "daily",
    "contestTypes": ["weekly", "biweekly"]
  }
}
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "name": "Jane Doe",
  "phoneNumber": "+1987654321",
  "preferences": {
    "platforms": ["leetcode", "codechef", "atcoder"],
    "alertFrequency": "daily",
    "contestTypes": ["weekly", "biweekly"]
  }
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "preferences": {
      "platforms": ["leetcode", "codechef"],
      "alertFrequency": "daily"
    }
  }'
```

---

### 3. Get User By ID

**GET** `/users/:id`

Retrieves profile information for a specific user by their ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): The unique identifier of the user

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "alertFrequency": "immediate",
    "contestTypes": []
  },
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3000/users/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Deactivate Account

**DELETE** `/users/profile`

Deactivates the current user's account. The user will no longer be able to authenticate until the account is reactivated.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Account deactivated successfully"
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Activate Account

**PUT** `/users/activate`

Activates the current user's account if it was previously deactivated.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Account activated successfully"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/users/activate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Responses

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid input data or validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Account deactivated or insufficient permissions |
| 404 | Not Found | User not found |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters long"
    }
  ]
}
```

### Validation Errors

**Invalid Name (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters long"
    }
  ]
}
```

**Invalid Platform (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "preferences.platforms",
      "message": "Invalid platform. Must be one of: codeforces, leetcode, codechef, atcoder"
    }
  ]
}
```

**User Not Found (404):**
```json
{
  "message": "User not found"
}
```

**Unauthorized (401):**
```json
{
  "message": "Unauthorized"
}
```

## Usage Examples

### JavaScript/TypeScript Client

```typescript
class UsersAPI {
  private baseURL = 'http://localhost:3000';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Update current user profile
  async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Get user by ID
  async getUserById(id: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Deactivate account
  async deactivateAccount(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Activate account
  async activateAccount(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/users/activate`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

// Usage example
const usersAPI = new UsersAPI('your-jwt-token');

// Get profile
const profile = await usersAPI.getProfile();
console.log('User profile:', profile);

// Update profile
const updatedProfile = await usersAPI.updateProfile({
  name: 'New Name',
  preferences: {
    platforms: ['leetcode', 'codeforces'],
    alertFrequency: 'daily'
  }
});
console.log('Updated profile:', updatedProfile);
```

### Python Client

```python
import requests
import json

class UsersAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_profile(self):
        """Get current user profile"""
        response = requests.get(f'{self.base_url}/users/profile', headers=self.headers)
        return response.json()
    
    def update_profile(self, data):
        """Update current user profile"""
        response = requests.put(
            f'{self.base_url}/users/profile',
            headers=self.headers,
            data=json.dumps(data)
        )
        return response.json()
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        response = requests.get(f'{self.base_url}/users/{user_id}', headers=self.headers)
        return response.json()
    
    def deactivate_account(self):
        """Deactivate current account"""
        response = requests.delete(f'{self.base_url}/users/profile', headers=self.headers)
        return response.json()
    
    def activate_account(self):
        """Activate current account"""
        response = requests.put(f'{self.base_url}/users/activate', headers=self.headers)
        return response.json()

# Usage example
users_api = UsersAPI('http://localhost:3000', 'your-jwt-token')

# Get profile
profile = users_api.get_profile()
print('User profile:', profile)

# Update profile
updated_profile = users_api.update_profile({
    'name': 'New Name',
    'preferences': {
        'platforms': ['leetcode', 'codeforces'],
        'alertFrequency': 'daily'
    }
})
print('Updated profile:', updated_profile)
```

## Security Considerations

### Authentication
- All endpoints require valid JWT authentication
- Tokens must be included in the `Authorization` header as `Bearer <token>`
- Expired tokens will result in 401 Unauthorized responses

### Data Privacy
- Users can only access and modify their own profile data
- The `/users/:id` endpoint allows viewing other users' public profile information
- Sensitive data like passwords and refresh tokens are never exposed

### Input Validation
- All input data is validated using Zod schemas
- Invalid data results in 400 Bad Request with detailed error messages
- SQL injection and XSS protection through proper input sanitization

### Rate Limiting
Consider implementing rate limiting for profile update operations to prevent abuse.

## Testing

### Unit Tests
The Users controller and service include comprehensive unit tests covering:
- Profile retrieval and updates
- User lookup by ID
- Account activation/deactivation
- Input validation
- Error handling

### Integration Tests
End-to-end tests verify:
- Authentication flow
- Database operations
- API response formats
- Error scenarios

### Running Tests
```bash
# Run all user-related tests
npm test -- users

# Run with coverage
npm run test:cov -- users

# Watch mode for development
npm run test:watch -- users
```

## Related Documentation

- [Authentication API](./AUTH.md) - For user authentication and JWT token management
- [Database Schema](../src/users/schemas/user.schema.ts) - MongoDB user schema definition
- [DTOs and Validation](../src/common/dto/user.dto.ts) - Request/response data structures

---

**✅ Users API is fully documented and ready for integration!**