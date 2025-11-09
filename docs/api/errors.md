# Error Handling

Complete guide to error responses and handling in CodeNotify API.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | number | HTTP status code |
| `message` | string or array | Error message(s) |
| `error` | string | Error type/name |

## HTTP Status Codes

### 2xx Success

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Success with no response body |

### 4xx Client Errors

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors

| Code | Name | Description |
|------|------|-------------|
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Common Errors

### 400 Bad Request

**Cause**: Invalid request data or validation failure

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

**Solutions**:
- Check request body format
- Verify all required fields are provided
- Validate data types match schema
- Ensure values meet validation rules

### 401 Unauthorized

**Cause**: Missing or invalid JWT token

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Solutions**:
- Include `Authorization: Bearer <token>` header
- Check if access token is expired (15 min validity)
- Use refresh token to get new access token
- Sign in again if refresh token expired

### 403 Forbidden

**Cause**: Insufficient permissions (e.g., not an admin)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**Solutions**:
- Verify user has required role
- Contact admin for permission upgrade
- Use appropriate endpoint for your role

### 404 Not Found

**Cause**: Resource doesn't exist

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Solutions**:
- Verify resource ID is correct
- Check if resource was deleted
- Ensure you have access to the resource

### 409 Conflict

**Cause**: Resource already exists (duplicate)

```json
{
  "statusCode": 409,
  "message": "User with email user@example.com already exists",
  "error": "Conflict"
}
```

**Solutions**:
- Use different unique identifier
- Update existing resource instead
- Check for existing resource first

### 429 Too Many Requests

**Cause**: Rate limit exceeded

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

**Solutions**:
- Wait before retrying
- Implement exponential backoff
- Reduce request frequency
- Contact support for higher limits

### 500 Internal Server Error

**Cause**: Server-side error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Solutions**:
- Retry the request
- Check API status
- Contact support if persists
- Report the error with details

## Validation Errors

### Zod Validation

CodeNotify uses Zod for request validation. Validation errors return detailed messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be at least 8 characters",
    "name is required"
  ],
  "error": "Bad Request"
}
```

### Common Validation Rules

**Email**:
- Must be valid email format
- Example: `user@example.com`

**Password**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**MongoDB ObjectId**:
- Must be 24-character hex string
- Example: `507f1f77bcf86cd799439011`

**Enum Values**:
- Must be one of allowed values
- Case-sensitive
- Example: `platform` must be `codeforces`, `leetcode`, `codechef`, or `atcoder`

## Error Handling Best Practices

### Client-Side

```javascript
async function makeRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          console.error('Validation error:', error.message);
          break;
        case 401:
          // Refresh token and retry
          await refreshAccessToken();
          return makeRequest(url, options);
        case 403:
          console.error('Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          // Wait and retry
          await sleep(5000);
          return makeRequest(url, options);
        case 500:
          console.error('Server error, please try again');
          break;
        default:
          console.error('Unexpected error:', error);
      }
      
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Retry Logic

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await makeRequest(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await sleep(delay);
    }
  }
}
```

### Error Display

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

function displayError(error: ApiError) {
  const messages = Array.isArray(error.message) 
    ? error.message 
    : [error.message];
  
  messages.forEach(msg => {
    toast.error(msg); // Using toast notification
  });
}
```

## Debugging

### Enable Detailed Errors (Development)

In development, errors may include stack traces:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error",
  "stack": "Error: ...\n    at ..."
}
```

**Note**: Stack traces are disabled in production for security.

### Logging

All errors are logged server-side with:
- Timestamp
- Request ID
- User ID (if authenticated)
- Endpoint
- Error details

### Request ID

Include request ID in support requests for faster debugging:

```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

## Related Documentation

- [Rate Limiting](/api/rate-limiting)
- [Authentication](/api/authentication)
- [Pagination](/api/pagination)
