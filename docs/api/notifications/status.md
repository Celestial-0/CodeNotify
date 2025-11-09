# Get Service Status

Get the status of all notification services.

## Endpoint

```http
GET /notifications/status
```

**Authentication:** None (Public)

## Request Example

```bash
curl http://localhost:3000/notifications/status
```

## Response

**Status Code:** `200 OK`

```json
{
  "email": {
    "enabled": true,
    "healthy": true,
    "provider": "Resend",
    "configured": true
  },
  "whatsapp": {
    "enabled": true,
    "healthy": false,
    "provider": "Twilio",
    "configured": false,
    "error": "API key not configured"
  },
  "push": {
    "enabled": true,
    "healthy": false,
    "provider": "Firebase",
    "configured": false,
    "error": "Service not initialized"
  }
}
```

## Response Fields

### Service Status Object

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Whether service is enabled in configuration |
| `healthy` | boolean | Whether service is functioning properly |
| `provider` | string | Service provider name |
| `configured` | boolean | Whether service is properly configured |
| `error` | string | Error message if service is unhealthy (optional) |

## Service Providers

| Channel | Provider | Description |
|---------|----------|-------------|
| **Email** | Resend | Email delivery service |
| **WhatsApp** | Twilio | WhatsApp messaging service |
| **Push** | Firebase | Push notification service |

## Status Indicators

### Healthy Service
```json
{
  "email": {
    "enabled": true,
    "healthy": true,
    "provider": "Resend",
    "configured": true
  }
}
```

### Unhealthy Service
```json
{
  "whatsapp": {
    "enabled": true,
    "healthy": false,
    "provider": "Twilio",
    "configured": false,
    "error": "API key not configured"
  }
}
```

### Disabled Service
```json
{
  "push": {
    "enabled": false,
    "healthy": false,
    "provider": "Firebase",
    "configured": false
  }
}
```

## Use Cases

1. **System Monitoring**: Check notification service health
2. **Dashboard**: Display service status in admin panel
3. **Debugging**: Identify configuration issues
4. **Alerting**: Trigger alerts for unhealthy services
5. **Status Page**: Public status page for users

## Integration Example

### React Status Component
```typescript
const ServiceStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="service-status">
      {Object.entries(status).map(([service, info]) => (
        <div key={service} className="service-card">
          <h3>{service.toUpperCase()}</h3>
          <div className={`status-indicator ${info.healthy ? 'healthy' : 'unhealthy'}`}>
            {info.healthy ? '✅ Healthy' : '❌ Unhealthy'}
          </div>
          <p>Provider: {info.provider}</p>
          {info.error && <p className="error">{info.error}</p>}
        </div>
      ))}
    </div>
  );
};
```

### Vue Status Component
```typescript
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const status = ref(null);
const loading = ref(true);
let interval: NodeJS.Timeout;

const fetchStatus = async () => {
  try {
    const { data } = await useFetch('/notifications/status');
    status.value = data.value;
  } catch (error) {
    console.error('Failed to fetch status:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatus();
  interval = setInterval(fetchStatus, 30000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div v-if="!loading" class="service-status">
    <div v-for="(info, service) in status" :key="service" class="service-card">
      <h3>{{ service.toUpperCase() }}</h3>
      <div :class="['status-indicator', info.healthy ? 'healthy' : 'unhealthy']">
        {{ info.healthy ? '✅ Healthy' : '❌ Unhealthy' }}
      </div>
      <p>Provider: {{ info.provider }}</p>
      <p v-if="info.error" class="error">{{ info.error }}</p>
    </div>
  </div>
</template>
```

### Status Page HTML
```html
<!DOCTYPE html>
<html>
<head>
  <title>CodeNotify Status</title>
  <style>
    .service-card {
      border: 1px solid #ddd;
      padding: 20px;
      margin: 10px;
      border-radius: 8px;
    }
    .healthy { color: green; }
    .unhealthy { color: red; }
  </style>
</head>
<body>
  <h1>CodeNotify Service Status</h1>
  <div id="status"></div>
  
  <script>
    async function fetchStatus() {
      const response = await fetch('http://localhost:3000/notifications/status');
      const data = await response.json();
      
      const statusDiv = document.getElementById('status');
      statusDiv.innerHTML = '';
      
      for (const [service, info] of Object.entries(data)) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
          <h3>${service.toUpperCase()}</h3>
          <p class="${info.healthy ? 'healthy' : 'unhealthy'}">
            ${info.healthy ? '✅ Healthy' : '❌ Unhealthy'}
          </p>
          <p>Provider: ${info.provider}</p>
          ${info.error ? `<p style="color: red;">${info.error}</p>` : ''}
        `;
        statusDiv.appendChild(card);
      }
    }
    
    fetchStatus();
    setInterval(fetchStatus, 30000);
  </script>
</body>
</html>
```

## Monitoring Integration

### Prometheus Metrics
```typescript
import { Counter, Gauge } from 'prom-client';

const serviceHealthGauge = new Gauge({
  name: 'notification_service_health',
  help: 'Health status of notification services',
  labelNames: ['service']
});

// Update metrics based on status
async function updateMetrics() {
  const status = await fetchStatus();
  
  for (const [service, info] of Object.entries(status)) {
    serviceHealthGauge.set(
      { service },
      info.healthy ? 1 : 0
    );
  }
}
```

### Alerting
```typescript
async function checkAndAlert() {
  const status = await fetchStatus();
  
  for (const [service, info] of Object.entries(status)) {
    if (info.enabled && !info.healthy) {
      await sendAlert({
        severity: 'warning',
        service,
        message: `${service} service is unhealthy: ${info.error}`,
        timestamp: new Date()
      });
    }
  }
}
```

## Best Practices

### ✅ Do

- Monitor service status regularly
- Set up alerts for unhealthy services
- Display status on admin dashboard
- Log status changes
- Use status for health checks

### ❌ Don't

- Poll too frequently (< 10 seconds)
- Ignore unhealthy services
- Assume services are always healthy
- Skip error handling

## Troubleshooting

### Email Service Unhealthy
- Check `RESEND_API_KEY` environment variable
- Verify API key is valid
- Check Resend service status

### WhatsApp Service Unhealthy
- Check `WHATSAPP_API_KEY` environment variable
- Verify Twilio account is active
- Check phone number configuration

### Push Service Unhealthy
- Check Firebase configuration
- Verify service account credentials
- Check Firebase project status

## Related Endpoints

- [Health Check](/api/notifications/health)
- [Test Email](/api/notifications/test-email)
- [Test WhatsApp](/api/notifications/test-whatsapp)
- [Test Push](/api/notifications/test-push)
