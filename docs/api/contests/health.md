# Contest Service Health Check

Check if the contests service is operational.

## Endpoint

```http
GET /contests/health
```

## Authentication

**Not required** - Public endpoint

## Response

### Success (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:30:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Service status ("ok") |
| `timestamp` | string | Current server time (ISO 8601) |

## Examples

### cURL

```bash
curl http://localhost:3000/contests/health
```

### JavaScript

```javascript
const checkHealth = async () => {
  const response = await fetch('http://localhost:3000/contests/health');
  const data = await response.json();
  return data.status === 'ok';
};

// Usage
const isHealthy = await checkHealth();
console.log(`Service is ${isHealthy ? 'healthy' : 'down'}`);
```

### Health Monitoring

```javascript
const monitorHealth = async () => {
  setInterval(async () => {
    try {
      const response = await fetch('/contests/health');
      const data = await response.json();
      
      if (data.status !== 'ok') {
        console.error('Service unhealthy!');
        // Alert admin
      }
    } catch (error) {
      console.error('Health check failed:', error);
      // Alert admin
    }
  }, 60000); // Check every minute
};
```

## Use Cases

### Service Monitoring

Monitor service availability in production.

### Load Balancer Health Check

Configure load balancers to use this endpoint.

### Uptime Monitoring

Integrate with uptime monitoring services (Pingdom, UptimeRobot, etc.).

## Notes

- Public endpoint (no authentication)
- Always returns 200 OK if service is running
- Lightweight check (no database queries)
- Useful for monitoring and load balancing
