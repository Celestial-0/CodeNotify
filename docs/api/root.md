# Root API Endpoint

Welcome page for the CodeNotify API.

## Overview

The root endpoint provides a user-friendly HTML landing page that displays API status and available endpoints.

## Endpoint

```http
GET /
```

**Authentication:** None (Public)

## Response

Returns an HTML page with:
- API status indicator
- List of available contest endpoints
- Supported platforms (Codeforces, LeetCode, CodeChef, AtCoder)
- Modern gradient UI with purple theme

**Content-Type:** `text/html`

## Example

```bash
curl http://localhost:3000/
```

**Response:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>CodeNotify API</title>
  <style>
    /* Modern gradient UI with purple theme */
  </style>
</head>
<body>
  <div class="container">
    <h1>CodeNotify API</h1>
    <div class="status">Status: ✅ Active</div>
    <!-- API endpoints and platform information -->
  </div>
</body>
</html>
```

## Features

- **Visual Interface**: User-friendly HTML page instead of plain text
- **API Status**: Real-time API health indicator
- **Endpoint List**: Quick reference to available endpoints
- **Platform Info**: Supported competitive programming platforms
- **Modern Design**: Gradient UI with responsive layout

## Use Cases

1. **Quick Reference**: View available endpoints without documentation
2. **Health Check**: Verify API is running
3. **Platform Discovery**: See which platforms are supported
4. **API Explorer**: Starting point for API exploration

## Related Endpoints

- [API Overview](/api/overview)
- [Authentication](/api/authentication)
- [Contests](/api/contests)
- [Users](/api/users)
- [Notifications](/api/notifications)
