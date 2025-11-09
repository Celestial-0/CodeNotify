# Health Check

Perform health check on all notification services.

## Endpoint

```http
GET /notifications/health
```

**Authentication:** None (Public)

## Request Example

```bash
curl http://localhost:3000/notifications/health
```

## Response

**Status Code:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2024-02-16T14:30:00.000Z",
  "services": {
    "email": {
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2024-02-16T14:30:00.000Z"
    },
    "whatsapp": {
      "status": "unhealthy",
      "error": "Connection timeout",
      "responseTime": 5000,
      "lastCheck": "2024-02-16T14:30:00.000Z"
    },
    "push": {
      "status": "degraded",
      "warning": "High latency detected",
      "responseTime": 1200,
      "lastCheck": "2024-02-16T14:30:00.000Z"
    }
  },
  "overallHealth": "degraded"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall system health: `healthy`, `degraded`, `unhealthy` |
| `timestamp` | string | Health check timestamp |
| `services` | object | Per-service health details |
| `overallHealth` | string | Aggregated health status |

### Service Health

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Service status: `healthy`, `degraded`, `unhealthy` |
| `responseTime` | number | Response time in milliseconds |
| `lastCheck` | string | Last health check timestamp |
| `error` | string | Error message (if unhealthy) |
| `warning` | string | Warning message (if degraded) |

## Health Status Levels

| Status | Description | Action Required |
|--------|-------------|-----------------|
| `healthy` | All services operational | None |
| `degraded` | Some services slow or partially functional | Monitor |
| `unhealthy` | One or more services down | Immediate action |

## Use Cases

1. **Load Balancer**: Health check endpoint for load balancers
2. **Monitoring**: Automated health monitoring
3. **Alerting**: Trigger alerts on unhealthy status
4. **Debugging**: Identify service issues
5. **Uptime Monitoring**: Track service availability

## Integration Example

### Kubernetes Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /notifications/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Docker Compose Health Check
```yaml
services:
  api:
    image: codenotify-api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/notifications/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Monitoring Script
```typescript
async function monitorHealth() {
  const response = await fetch('http://localhost:3000/notifications/health');
  const health = await response.json();
  
  if (health.overallHealth === 'unhealthy') {
    await sendAlert('Critical: Notification services unhealthy');
  } else if (health.overallHealth === 'degraded') {
    await sendWarning('Warning: Notification services degraded');
  }
  
  // Log metrics
  logger.info('Health check', {
    status: health.overallHealth,
    services: health.services
  });
}

setInterval(monitorHealth, 60000); // Check every minute
```

## Best Practices

### ✅ Do

- Use for automated monitoring
- Set up alerts for unhealthy status
- Monitor response times
- Check regularly (every 30-60 seconds)

### ❌ Don't

- Poll too frequently (< 10 seconds)
- Ignore degraded status
- Use as primary monitoring solution

## Related Endpoints

- [Service Status](/api/notifications/status)
- [Notification Stats](/api/notifications/stats)
