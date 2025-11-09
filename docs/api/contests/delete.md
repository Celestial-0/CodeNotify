# Delete Contest (Admin)

Permanently delete a contest from the database.

## Endpoint

```http
DELETE /contests/:id
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
| `id` | string | Yes | Contest MongoDB ObjectId |

## Response

### Success (204 No Content)

No response body. Contest successfully deleted.

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Contest with ID 507f1f77bcf86cd799439011 not found"
}
```

## Examples

### cURL

```bash
curl -X DELETE http://localhost:3000/contests/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <admin_token>"
```

### JavaScript

```javascript
const deleteContest = async (id, adminToken) => {
  const response = await fetch(`http://localhost:3000/contests/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete contest');
  }

  // 204 No Content - success
  return true;
};

// Usage
await deleteContest('507f1f77bcf86cd799439011', adminToken);
console.log('Contest deleted successfully');
```

## Notes

- **Admin only**
- **Permanent deletion** - Cannot be undone
- Returns 204 No Content on success
- Consider using `isActive: false` instead for soft delete
