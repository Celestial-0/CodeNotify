# 🔗 Integrations API Documentation

## Overview

The Integrations module manages all external service connections for CodeNotify, including WhatsApp Cloud API, email services, SMS providers, and other third-party integrations. This module provides a unified interface for sending notifications and managing external service configurations.

## Current Status

🚧 **IN DEVELOPMENT** - Module structure is in place, implementation in progress.

## Supported Integrations

| Service | Status | Purpose | Provider |
|---------|--------|---------|----------|
| **WhatsApp Cloud API** | 🚧 Planned | Contest notifications via WhatsApp | Meta (Facebook) |
| **Email Service** | 🚧 Planned | Email notifications and digests | SendGrid / Mailgun |
| **SMS Service** | 🚧 Planned | SMS notifications | Twilio / AWS SNS |
| **Push Notifications** | 📋 Future | Mobile app notifications | Firebase FCM |
| **Telegram Bot** | 📋 Future | Telegram channel notifications | Telegram Bot API |
| **Discord Bot** | 📋 Future | Discord server notifications | Discord Bot API |

## Module Structure

```
src/integrations/
├── whatsapp/
│   ├── whatsapp.service.ts        # WhatsApp Cloud API integration
│   └── whatsapp.service.spec.ts   # WhatsApp service tests
├── notifications/
│   ├── notifications.service.ts   # Unified notification service
│   └── notifications.service.spec.ts
├── email/                         # 🚧 Planned
├── sms/                          # 🚧 Planned
└── integrations.module.ts        # Module configuration
```

## Planned API Endpoints

### WhatsApp Integration
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/integrations/whatsapp/send` | Send WhatsApp message | 🚧 |
| GET | `/integrations/whatsapp/status` | Check WhatsApp API status | 🚧 |
| POST | `/integrations/whatsapp/template` | Send template message | 🚧 |
| GET | `/integrations/whatsapp/webhooks` | Handle WhatsApp webhooks | 🚧 |

### Email Integration
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/integrations/email/send` | Send email notification | 🚧 |
| POST | `/integrations/email/bulk` | Send bulk emails | 🚧 |
| GET | `/integrations/email/templates` | List email templates | 🚧 |
| GET | `/integrations/email/status` | Check email service status | 🚧 |

### SMS Integration
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/integrations/sms/send` | Send SMS notification | 🚧 |
| GET | `/integrations/sms/status` | Check SMS service status | 🚧 |
| GET | `/integrations/sms/delivery/:id` | Check SMS delivery status | 🚧 |

### Unified Notifications
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/integrations/notify` | Send multi-channel notification | 🚧 |
| GET | `/integrations/channels` | List available channels | 🚧 |
| GET | `/integrations/health` | Check all integrations health | 🚧 |

## Planned Data Models

### Notification Request
```typescript
interface NotificationRequest {
  userId: string;
  channels: NotificationChannel[];
  message: {
    title: string;
    body: string;
    template?: string;
    variables?: Record<string, any>;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduling?: {
    sendAt?: Date;
    timezone?: string;
  };
  metadata?: Record<string, any>;
}
```

### Notification Response
```typescript
interface NotificationResponse {
  id: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  channels: {
    channel: NotificationChannel;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    messageId?: string;
    error?: string;
    deliveredAt?: Date;
  }[];
  createdAt: Date;
  sentAt?: Date;
}
```

### Integration Status
```typescript
interface IntegrationStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime: number;
  errorRate: number;
  metadata?: {
    version?: string;
    region?: string;
    limits?: {
      rateLimit: number;
      remaining: number;
      resetAt: Date;
    };
  };
}
```

## WhatsApp Cloud API Integration

### Features
- Send text messages with rich formatting
- Template message support for business use
- Media message support (images, documents)
- Webhook handling for delivery status
- Rate limiting and quota management

### Configuration
```typescript
interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string; // Default: 'v18.0'
  baseUrl: string; // Default: 'https://graph.facebook.com'
}
```

### Message Templates
```typescript
// Contest Alert Template
const contestAlertTemplate = {
  name: 'contest_alert',
  language: { code: 'en' },
  components: [
    {
      type: 'header',
      parameters: [{ type: 'text', text: '{{contestName}}' }]
    },
    {
      type: 'body',
      parameters: [
        { type: 'text', text: '{{timeUntilStart}}' },
        { type: 'text', text: '{{platform}}' },
        { type: 'text', text: '{{duration}}' }
      ]
    },
    {
      type: 'button',
      sub_type: 'url',
      parameters: [{ type: 'text', text: '{{contestId}}' }]
    }
  ]
};
```

### Usage Examples
```typescript
// Send simple text message
await whatsappService.sendTextMessage({
  to: '+1234567890',
  message: '🏆 Codeforces Round #123 starts in 1 hour!'
});

// Send template message
await whatsappService.sendTemplateMessage({
  to: '+1234567890',
  template: 'contest_alert',
  variables: {
    contestName: 'Codeforces Round #123',
    timeUntilStart: '1 hour',
    platform: 'Codeforces',
    duration: '2 hours',
    contestId: '123'
  }
});
```

## Email Integration

### Features
- HTML and plain text email support
- Template-based email composition
- Bulk email sending with personalization
- Email tracking and analytics
- Bounce and complaint handling

### Configuration
```typescript
interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  trackingEnabled: boolean;
}
```

### Email Templates
```typescript
// Daily Digest Template
const dailyDigestTemplate = {
  subject: '📅 Your Daily Contest Digest - {{date}}',
  html: `
    <h2>Today's Contests</h2>
    {{#contests}}
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
      <h3>🏆 {{name}}</h3>
      <p><strong>Platform:</strong> {{platform}}</p>
      <p><strong>Start Time:</strong> {{startTime}}</p>
      <p><strong>Duration:</strong> {{duration}}</p>
      <a href="{{url}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Join Contest</a>
    </div>
    {{/contests}}
  `,
  text: `Today's Contests\n\n{{#contests}}🏆 {{name}}\nPlatform: {{platform}}\nStart: {{startTime}}\nDuration: {{duration}}\nURL: {{url}}\n\n{{/contests}}`
};
```

## SMS Integration

### Features
- Short message sending for urgent alerts
- International number support
- Delivery status tracking
- Cost optimization and routing

### Configuration
```typescript
interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'messagebird';
  accountSid: string;
  authToken: string;
  fromNumber: string;
  webhookUrl?: string;
}
```

### Usage Examples
```typescript
// Send urgent contest alert
await smsService.sendSMS({
  to: '+1234567890',
  message: '🚨 URGENT: Codeforces Round #123 registration closes in 10 minutes! Register now: cf.com/contest/123'
});
```

## Unified Notification Service

### Multi-Channel Messaging
```typescript
// Send notification across multiple channels
await notificationsService.sendNotification({
  userId: 'user123',
  channels: ['whatsapp', 'email'],
  message: {
    title: 'Contest Starting Soon',
    body: 'Codeforces Round #123 starts in 30 minutes',
    template: 'contest_starting_soon',
    variables: {
      contestName: 'Codeforces Round #123',
      timeUntilStart: '30 minutes',
      contestUrl: 'https://codeforces.com/contest/123'
    }
  },
  priority: 'high'
});
```

### Channel Fallback
```typescript
// Automatic fallback to secondary channels
const config = {
  primaryChannel: 'whatsapp',
  fallbackChannels: ['email', 'sms'],
  fallbackDelay: 300, // 5 minutes
  maxRetries: 3
};
```

## Implementation Plan

### Phase 1: WhatsApp Integration
- [ ] WhatsApp Cloud API service implementation
- [ ] Message sending functionality
- [ ] Template message support
- [ ] Webhook handling for delivery status
- [ ] Rate limiting and error handling

### Phase 2: Email Integration
- [ ] Email service provider integration
- [ ] Template system implementation
- [ ] Bulk email functionality
- [ ] Email tracking and analytics
- [ ] Bounce and complaint handling

### Phase 3: SMS Integration
- [ ] SMS provider integration
- [ ] International number support
- [ ] Delivery tracking
- [ ] Cost optimization

### Phase 4: Unified Service
- [ ] Multi-channel notification service
- [ ] Channel fallback mechanisms
- [ ] Priority-based routing
- [ ] Analytics and reporting

## Environment Configuration

```bash
# WhatsApp Cloud API
WHATSAPP_API_KEY=your_whatsapp_access_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_API_VERSION=v18.0

# Email Service (SendGrid example)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM_ADDRESS=noreply@codenotify.com
EMAIL_FROM_NAME=CodeNotify
EMAIL_TRACKING_ENABLED=true

# SMS Service (Twilio example)
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your_twilio_account_sid
SMS_AUTH_TOKEN=your_twilio_auth_token
SMS_FROM_NUMBER=+1234567890

# Integration Settings
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=300
NOTIFICATION_TIMEOUT=30000
```

## Webhook Handling

### WhatsApp Webhooks
```typescript
@Post('whatsapp/webhook')
async handleWhatsAppWebhook(@Body() payload: any) {
  // Verify webhook signature
  const isValid = this.whatsappService.verifyWebhook(payload);
  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // Process delivery status updates
  await this.whatsappService.processWebhookPayload(payload);
  
  return { status: 'ok' };
}
```

### Email Webhooks
```typescript
@Post('email/webhook')
async handleEmailWebhook(@Body() payload: any) {
  // Process email events (delivered, bounced, clicked, etc.)
  await this.emailService.processWebhookPayload(payload);
  
  return { status: 'ok' };
}
```

## Error Handling

### Common Error Scenarios
- API rate limiting
- Invalid recipient numbers/emails
- Service outages
- Authentication failures
- Message content violations

### Error Response Format
```json
{
  "error": "INTEGRATION_ERROR",
  "message": "Failed to send WhatsApp message",
  "details": {
    "service": "whatsapp",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 300,
    "messageId": "msg_123"
  }
}
```

## Rate Limiting & Quotas

### WhatsApp Limits
- 1000 messages per day (free tier)
- 80 messages per second
- Template message approval required

### Email Limits
- Varies by provider
- SendGrid: 100 emails/day (free), unlimited (paid)
- Mailgun: 10,000 emails/month (free)

### SMS Limits
- Varies by provider and region
- Twilio: Pay-per-message pricing
- AWS SNS: $0.0075 per SMS (US)

## Monitoring & Analytics

### Key Metrics
- Message delivery success rate
- Average delivery time
- Cost per message by channel
- Error rates by integration

### Health Checks
```typescript
@Get('health')
async getIntegrationsHealth() {
  return {
    whatsapp: await this.whatsappService.healthCheck(),
    email: await this.emailService.healthCheck(),
    sms: await this.smsService.healthCheck(),
    overall: 'healthy' | 'degraded' | 'down'
  };
}
```

## Security Considerations

### API Security
- Secure storage of API keys and tokens
- Webhook signature verification
- Rate limiting protection
- Input validation and sanitization

### Data Privacy
- GDPR compliance for user data
- Opt-out mechanisms for all channels
- Secure handling of personal information
- Audit logging for all communications

## Testing Strategy

### Unit Tests
- Individual service functionality
- Message formatting and validation
- Error handling scenarios
- Rate limiting logic

### Integration Tests
- External API connectivity
- Webhook processing
- End-to-end message delivery
- Fallback mechanisms

### Load Testing
- High-volume message sending
- Concurrent request handling
- Rate limit behavior
- System performance under stress

## Future Enhancements

- **Advanced Analytics**: Detailed engagement metrics and insights
- **A/B Testing**: Message optimization and testing framework
- **Rich Media Support**: Images, videos, and interactive content
- **Chatbot Integration**: Two-way communication capabilities
- **Voice Notifications**: Integration with voice calling services
- **Social Media Integration**: Twitter, LinkedIn, Discord notifications
- **Calendar Integration**: Automatic calendar event creation
- **Mobile Push Notifications**: Native mobile app support

---

**📝 Note**: This module is currently in development. The API endpoints and features described above are planned implementations. Check the project roadmap for current development status.

**🔗 Related Documentation**:
- [Authentication API](./AUTH.md)
- [Users API](./USERS.md)
- [Contests API](./CONTESTS.md)
- [Alerts API](./ALERTS.md)
