# Rate Limiting

API rate limiting and throttling policies.

## Overview

CodeNotify implements rate limiting to ensure fair usage and protect against abuse. Rate limits are applied per IP address and per user.

## Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707998400
```

### Header Descriptions

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

## Default Limits

### Global Limits (All Endpoints)

| Tier | Limit | Window |
|------|-------|--------|
| Short | 100 requests | 1 second |
| Medium | 1000 requests | 1 minute |
| Long | 10000 requests | 15 minutes |

### Specific Endpoint Overrides

#### Authentication

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/signup` | 50 requests | 1 minute |
| `/auth/signin` | 100 requests | 1 minute |

#### Admin Operations

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/contests/sync/all` | 100 requests | 1 hour |
| `/contests/sync/:platform` | 100 requests | 1 hour |
| `/contests/bulk` | 50 requests | 1 hour |

## Rate Limit Exceeded

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

### Response Headers

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707998400
Retry-After: 900
```

## Handling Rate Limits

### Check Remaining Requests

```javascript
async function makeRequest(url, options) {
  const response = await fetch(url, options);
  
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  console.log(`Rate limit: ${remaining}/${limit}`);
  console.log(`Resets at: ${new Date(reset * 1000)}`);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    throw new Error('Rate limit exceeded');
  }
  
  return response.json();
}
```

### Exponential Backoff

```javascript
async function makeRequestWithBackoff(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await makeRequest(url, options);
    } catch (error) {
      if (error.message === 'Rate limit exceeded') {
        if (i === maxRetries - 1) throw error;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### Respect Retry-After

```javascript
async function makeRequestWithRetryAfter(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    
    console.log(`Waiting ${retryAfter} seconds before retry...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    // Retry request
    return makeRequestWithRetryAfter(url, options);
  }
  
  return response.json();
}
```

## Best Practices

### ✅ Do

1. **Check rate limit headers** before making requests
2. **Implement exponential backoff** for retries
3. **Respect Retry-After** header
4. **Cache responses** when possible
5. **Batch requests** to reduce API calls
6. **Use webhooks** instead of polling

### ❌ Don't

1. **Don't ignore 429 responses**
2. **Don't retry immediately** after rate limit
3. **Don't make unnecessary requests**
4. **Don't poll frequently** (use reasonable intervals)
5. **Don't create multiple API keys** to bypass limits

## Optimization Strategies

### Caching

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(url) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await makeRequest(url);
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}
```

### Request Batching

```javascript
class RequestBatcher {
  constructor(batchSize = 10, delay = 1000) {
    this.queue = [];
    this.batchSize = batchSize;
    this.delay = delay;
  }
  
  async add(request) {
    this.queue.push(request);
    
    if (this.queue.length >= this.batchSize) {
      await this.flush();
    }
  }
  
  async flush() {
    const batch = this.queue.splice(0, this.batchSize);
    await Promise.all(batch.map(req => makeRequest(req.url, req.options)));
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }
}
```

### Polling with Backoff

```javascript
async function pollWithBackoff(url, interval = 5000, maxInterval = 60000) {
  let currentInterval = interval;
  
  while (true) {
    try {
      const data = await makeRequest(url);
      
      // Reset interval on success
      currentInterval = interval;
      
      // Process data
      processData(data);
      
    } catch (error) {
      if (error.message === 'Rate limit exceeded') {
        // Increase interval
        currentInterval = Math.min(currentInterval * 2, maxInterval);
        console.log(`Rate limited. Increasing interval to ${currentInterval}ms`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, currentInterval));
  }
}
```

## Increasing Limits

### Contact Support

For higher rate limits:
1. Contact support with your use case
2. Provide expected request volume
3. Explain why higher limits are needed

### Enterprise Plans

Enterprise customers can request:
- Custom rate limits
- Dedicated infrastructure
- Priority support
- SLA guarantees

## Monitoring

### Track Usage

```javascript
class RateLimitMonitor {
  constructor() {
    this.requests = [];
  }
  
  recordRequest(response) {
    this.requests.push({
      timestamp: Date.now(),
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset')
    });
  }
  
  getStats() {
    const now = Date.now();
    const recent = this.requests.filter(r => now - r.timestamp < 900000); // 15 min
    
    return {
      totalRequests: recent.length,
      averageRemaining: recent.reduce((sum, r) => sum + parseInt(r.remaining), 0) / recent.length,
      lowestRemaining: Math.min(...recent.map(r => parseInt(r.remaining)))
    };
  }
}
```

## Related Documentation

- [Error Handling](/api/errors)
- [Authentication](/api/authentication)
- [API Overview](/api/overview)
