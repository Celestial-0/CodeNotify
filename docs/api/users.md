# Users API

Complete API reference for user management endpoints.

## Overview

The Users API provides endpoints for managing user profiles, preferences, and account settings. Most endpoints require authentication via JWT tokens.

## Base URL

```
http://localhost:3000/users
```

## Authentication

All endpoints except public routes require a valid JWT access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get User Profile

Get the authenticated user's profile information.

**Endpoint**: `GET /users/profile`  
**Access**: Protected (JWT required)

#### Request

No request body required. User is extracted from JWT token.

#### Response (200 OK)

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

[Full Documentation →](/api/users/profile)

---

### 2. Update User Profile

Update the authenticated user's profile information and preferences.

**Endpoint**: `PUT /users/profile`  
**Access**: Protected (JWT required)

#### Request Body

```json
{
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

#### Response (200 OK)

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

[Full Documentation →](/api/users/update-profile)

---

### 3. Get User by ID

Get a specific user's public information by their ID.

**Endpoint**: `GET /users/:id`  
**Access**: Protected (JWT required)

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User's MongoDB ObjectId |

#### Response (200 OK)

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

[Full Documentation →](/api/users/get-by-id)

---

### 4. Get All Users (Admin)

Get a paginated list of all users. Admin only.

**Endpoint**: `GET /users`  
**Access**: Admin only

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Number of users per page |
| `offset` | number | No | 0 | Number of users to skip |

#### Response (200 OK)

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
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

[Full Documentation →](/api/users/list)

---

### 5. Deactivate Account

Deactivate the authenticated user's account. Account can be reactivated later.

**Endpoint**: `DELETE /users/profile`  
**Access**: Protected (JWT required)

#### Response (200 OK)

```json
{
  "message": "Account deactivated successfully"
}
```

[Full Documentation →](/api/users/deactivate)

---

### 6. Activate Account

Reactivate a previously deactivated account.

**Endpoint**: `PUT /users/activate`  
**Access**: Protected (JWT required)

#### Response (200 OK)

```json
{
  "message": "Account activated successfully"
}
```

[Full Documentation →](/api/users/activate)

---

### 7. Update User Role (Admin)

Update a user's role. Admin only.

**Endpoint**: `PATCH /users/:id/role`  
**Access**: Admin only

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User's MongoDB ObjectId |

#### Request Body

```json
{
  "role": "admin"
}
```

#### Response (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "message": "User role updated to admin successfully"
}
```

[Full Documentation →](/api/users/update-role)

---

### 8. Delete User (Admin)

Permanently delete a user. Admin only.

**Endpoint**: `DELETE /users/:id`  
**Access**: Admin only

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User's MongoDB ObjectId |

#### Response (200 OK)

```json
{
  "message": "User deleted successfully"
}
```

[Full Documentation →](/api/users/delete)

---

## User Preferences

### Structure

```typescript
interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
  notificationChannels: {
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  notifyBefore: number; // Hours before contest (1-168)
}
```

### Default Preferences

```json
{
  "platforms": ["codeforces", "leetcode"],
  "alertFrequency": "immediate",
  "contestTypes": [],
  "notificationChannels": {
    "whatsapp": true,
    "email": true,
    "push": false
  },
  "notifyBefore": 24
}
```

### Platforms

- `codeforces` - Codeforces contests
- `leetcode` - LeetCode contests
- `codechef` - CodeChef contests
- `atcoder` - AtCoder contests

### Alert Frequency

- `immediate` - Get notified as soon as contest is announced
- `daily` - Get daily digest of upcoming contests
- `weekly` - Get weekly digest of upcoming contests

### Notification Channels

- `whatsapp` - WhatsApp notifications
- `email` - Email notifications
- `push` - Push notifications (mobile/web)

### Notify Before

Number of hours before contest start to send notification (1-168 hours, i.e., 1 hour to 7 days).

## Error Responses

### 400 Bad Request

Invalid request body or validation failure.

```json
{
  "statusCode": 400,
  "message": [
    "Name must be at least 2 characters long",
    "notifyBefore must be between 1 and 168"
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

### 403 Forbidden

Insufficient permissions (e.g., non-admin trying to access admin endpoint).

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

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /users/profile` | 100 requests | 15 minutes |
| `PUT /users/profile` | 20 requests | 15 minutes |
| `GET /users/:id` | 100 requests | 15 minutes |
| `GET /users` (admin) | 1000 requests | 15 minutes |
| `DELETE /users/profile` | 5 requests | 1 hour |
| `PUT /users/activate` | 10 requests | 1 hour |

## Examples

### Get Profile

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>"
```

### Update Profile

```bash
curl -X PUT http://localhost:3000/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "preferences": {
      "platforms": ["codeforces", "leetcode", "codechef"],
      "alertFrequency": "daily"
    }
  }'
```

### Get All Users (Admin)

```bash
curl -X GET "http://localhost:3000/users?limit=20&offset=0" \
  -H "Authorization: Bearer <admin_access_token>"
```

### Update User Role (Admin)

```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

## Related Documentation

- [Get Profile](/api/users/profile) - Get user profile
- [Update Profile](/api/users/update-profile) - Update profile
- [Get User by ID](/api/users/get-by-id) - Get user by ID
- [List All Users](/api/users/list) - Get all users (admin)
- [Deactivate Account](/api/users/deactivate) - Deactivate account
- [Activate Account](/api/users/activate) - Activate account
- [Update Role](/api/users/update-role) - Update user role (admin)
- [Delete User](/api/users/delete) - Delete user (admin)
- [Authentication](/api/authentication) - Authentication guide
- [Users Module](/server/modules/users) - Server implementation
