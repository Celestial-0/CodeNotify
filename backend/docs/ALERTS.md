# 🔔 Alerts API Documentation

## Overview

The Alerts module provides a comprehensive notification system for CodeNotify, managing user alert preferences, scheduling notifications, and delivering timely contest updates through various channels including WhatsApp, email, and in-app notifications.

## Current Status

🚧 **IN DEVELOPMENT** - Module structure is in place, implementation in progress.

## Core Features

### 🎯 **Smart Alert System**
- User-customizable alert preferences
- Multi-channel notification delivery
- Intelligent alert scheduling based on user preferences
- Contest-specific alert types (registration, start, end, reminders)

### ⏰ **Flexible Scheduling**
- Immediate notifications for urgent updates
- Daily digest of upcoming contests
- Weekly summary of contest schedules
- Custom timing for individual alerts

### 📱 **Multi-Channel Delivery**
- WhatsApp notifications via Cloud API
- Email notifications (planned)
- In-app notifications (planned)
- SMS notifications (planned)

## Planned API Endpoints

### Alert Management
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/alerts` | Get user's alert preferences | 🚧 |
| POST | `/alerts` | Create new alert | 🚧 |
| PUT | `/alerts/:id` | Update alert preferences | 🚧 |
| DELETE | `/alerts/:id` | Delete alert | 🚧 |
| GET | `/alerts/history` | Get alert delivery history | 🚧 |

### Alert Types
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/alerts/types` | List available alert types | 🚧 |
| POST | `/alerts/contest/:contestId` | Create contest-specific alert | 🚧 |
| GET | `/alerts/upcoming` | Get upcoming scheduled alerts | 🚧 |

### Alert Settings
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/alerts/settings` | Get global alert settings | 🚧 |
| PUT | `/alerts/settings` | Update alert settings | 🚧 |
| POST | `/alerts/test` | Send test notification | 🚧 |

## Planned Data Models

### Alert Schema
```typescript
interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  contestId?: string;
  scheduledAt: Date;
  deliveredAt?: Date;
  status: 'pending' | 'delivered' | 'failed' | 'cancelled';
  channels: NotificationChannel[];
  metadata: {
    platform?: string;
    contestName?: string;
    contestUrl?: string;
    retryCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Alert Preference Schema
```typescript
interface AlertPreference {
  id: string;
  userId: string;
  alertType: AlertType;
  isEnabled: boolean;
  channels: NotificationChannel[];
  timing: {
    immediate?: boolean;
    beforeMinutes?: number[]; // [60, 30, 10] for 1hr, 30min, 10min before
    frequency?: 'immediate' | 'daily' | 'weekly';
    timeOfDay?: string; // '09:00' for daily/weekly alerts
    dayOfWeek?: number; // 0-6 for weekly alerts
  };
  filters: {
    platforms?: string[];
    contestTypes?: string[];
    difficulty?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Alert Types
```typescript
enum AlertType {
  CONTEST_REGISTRATION_OPEN = 'contest_registration_open',
  CONTEST_REGISTRATION_CLOSING = 'contest_registration_closing',
  CONTEST_STARTING_SOON = 'contest_starting_soon',
  CONTEST_STARTED = 'contest_started',
  CONTEST_ENDING_SOON = 'contest_ending_soon',
  CONTEST_ENDED = 'contest_ended',
  DAILY_DIGEST = 'daily_digest',
  WEEKLY_SUMMARY = 'weekly_summary',
  PLATFORM_UPDATE = 'platform_update',
  SYSTEM_MAINTENANCE = 'system_maintenance'
}

enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  IN_APP = 'in_app',
  SMS = 'sms'
}
```

## Planned Features

### 🤖 **Intelligent Scheduling**
- Automatic alert creation based on contest data
- Smart timing based on user timezone
- Conflict resolution for overlapping alerts
- Batch processing for efficiency

### 🎨 **Customizable Templates**
- Pre-built message templates for different alert types
- Personalized messages with user and contest data
- Multi-language support (planned)
- Rich formatting for different channels

### 📊 **Analytics & Tracking**
- Alert delivery success rates
- User engagement metrics
- Channel performance analysis
- A/B testing for message optimization

### 🔄 **Retry & Reliability**
- Automatic retry for failed deliveries
- Fallback channels for critical alerts
- Delivery status tracking
- Error logging and monitoring

## Implementation Plan

### Phase 1: Core Alert System
- [ ] Alert data models and schemas
- [ ] Basic CRUD operations for alerts
- [ ] Alert preference management
- [ ] Database setup and migrations

### Phase 2: Scheduling Engine
- [ ] Cron-based alert scheduling
- [ ] Alert queue management
- [ ] Timing calculation algorithms
- [ ] Conflict resolution logic

### Phase 3: Notification Delivery
- [ ] WhatsApp integration
- [ ] Email service integration
- [ ] Delivery status tracking
- [ ] Retry mechanisms

### Phase 4: Advanced Features
- [ ] Template system
- [ ] Analytics and reporting
- [ ] Performance optimization
- [ ] Multi-language support

## Environment Configuration

```bash
# Alert System Configuration
ALERT_QUEUE_REDIS_URL=redis://localhost:6379
ALERT_BATCH_SIZE=100
ALERT_RETRY_ATTEMPTS=3
ALERT_RETRY_DELAY=300

# Notification Channels
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_id
EMAIL_SERVICE_API_KEY=your_email_api_key
SMS_SERVICE_API_KEY=your_sms_api_key

# Scheduling
ALERT_SCHEDULER_INTERVAL=60
ALERT_CLEANUP_DAYS=30
DEFAULT_TIMEZONE=UTC
```

## Example Usage (Planned)

### Create Alert Preference
```typescript
const preference = await alertsService.createAlertPreference({
  userId: 'user123',
  alertType: AlertType.CONTEST_STARTING_SOON,
  isEnabled: true,
  channels: [NotificationChannel.WHATSAPP, NotificationChannel.EMAIL],
  timing: {
    beforeMinutes: [60, 30, 10],
    immediate: false
  },
  filters: {
    platforms: ['codeforces', 'leetcode'],
    contestTypes: ['div2', 'weekly']
  }
});
```

### Schedule Contest Alert
```typescript
const alert = await alertsService.scheduleContestAlert({
  contestId: 'contest123',
  alertType: AlertType.CONTEST_STARTING_SOON,
  scheduledAt: new Date(contestStartTime - 60 * 60 * 1000), // 1 hour before
  users: ['user1', 'user2', 'user3']
});
```

### Send Immediate Alert
```typescript
await alertsService.sendImmediateAlert({
  userId: 'user123',
  title: 'Contest Registration Open',
  message: 'Registration is now open for Codeforces Round #123',
  channels: [NotificationChannel.WHATSAPP],
  metadata: {
    contestId: 'contest123',
    contestUrl: 'https://codeforces.com/contest/123'
  }
});
```

## Alert Templates

### Contest Starting Soon
```typescript
const template = {
  whatsapp: `🏆 *{{contestName}}* starts in {{timeUntilStart}}!\n\n📅 Start: {{startTime}}\n⏱️ Duration: {{duration}}\n🔗 Join: {{contestUrl}}`,
  email: {
    subject: '🏆 {{contestName}} starts in {{timeUntilStart}}',
    html: `<h2>Contest Alert</h2><p><strong>{{contestName}}</strong> starts in {{timeUntilStart}}...</p>`
  }
};
```

### Daily Digest
```typescript
const template = {
  whatsapp: `📅 *Today's Contests*\n\n{{#contests}}🏆 {{name}} - {{startTime}}\n{{/contests}}\n\nGood luck! 🚀`,
  email: {
    subject: '📅 Your Daily Contest Digest',
    html: `<h2>Today's Contests</h2><ul>{{#contests}}<li>{{name}} - {{startTime}}</li>{{/contests}}</ul>`
  }
};
```

## Cron Job Schedules

### Alert Processing
```typescript
// Process pending alerts every minute
@Cron('0 * * * * *')
async processPendingAlerts() {
  const pendingAlerts = await this.alertsService.getPendingAlerts();
  await this.alertsService.processAlerts(pendingAlerts);
}

// Generate daily digests at 8 AM
@Cron('0 0 8 * * *')
async generateDailyDigests() {
  const users = await this.usersService.getUsersWithDailyAlerts();
  await this.alertsService.generateDailyDigests(users);
}

// Generate weekly summaries on Sunday at 8 AM
@Cron('0 0 8 * * 0')
async generateWeeklySummaries() {
  const users = await this.usersService.getUsersWithWeeklyAlerts();
  await this.alertsService.generateWeeklySummaries(users);
}
```

## Testing Strategy

### Unit Tests
- Alert creation and scheduling logic
- Template rendering and personalization
- Timing calculations and timezone handling
- Retry mechanisms and error handling

### Integration Tests
- Database operations for alerts
- External service integrations
- Cron job execution
- Queue processing

### End-to-End Tests
- Complete alert workflow
- Multi-channel delivery
- User preference handling
- Performance under load

## Error Handling

### Common Error Scenarios
- Notification delivery failures
- Invalid user preferences
- External service outages
- Template rendering errors

### Error Response Format
```json
{
  "error": "ALERT_DELIVERY_FAILED",
  "message": "Failed to deliver WhatsApp notification",
  "details": {
    "alertId": "alert123",
    "channel": "whatsapp",
    "userId": "user123",
    "retryCount": 2,
    "nextRetryAt": "2023-09-06T10:35:00.000Z"
  }
}
```

## Performance Considerations

### Queue Management
- Redis-based alert queue for scalability
- Batch processing for efficiency
- Priority queues for urgent alerts
- Rate limiting for external APIs

### Database Optimization
- Indexed queries for fast alert retrieval
- Partitioning for large alert history
- Efficient cleanup of old alerts
- Optimized user preference lookups

### Caching Strategy
- User preferences cached for quick access
- Template caching for performance
- Contest data caching to reduce API calls

## Security Considerations

### Data Protection
- Secure storage of notification credentials
- Encryption of sensitive alert data
- User consent for notification channels
- GDPR compliance for user data

### API Security
- Rate limiting for alert endpoints
- Input validation and sanitization
- Authentication for all alert operations
- Audit logging for alert activities

## Monitoring & Analytics

### Key Metrics
- Alert delivery success rate
- Average delivery time
- User engagement rates
- Channel performance comparison

### Dashboards
- Real-time alert processing status
- Delivery success/failure rates
- User preference analytics
- System performance metrics

## Future Enhancements

- **AI-Powered Personalization**: Smart alert timing based on user behavior
- **Advanced Templates**: Rich media support and interactive elements
- **Voice Notifications**: Integration with voice assistants
- **Social Media Integration**: Alerts via Twitter, Discord, Telegram
- **Mobile Push Notifications**: Native mobile app integration
- **Calendar Integration**: Automatic calendar event creation
- **Smart Batching**: Intelligent grouping of related alerts

---

**📝 Note**: This module is currently in development. The API endpoints and features described above are planned implementations. Check the project roadmap for current development status.

**🔗 Related Documentation**:
- [Authentication API](./AUTH.md)
- [Users API](./USERS.md)
- [Contests API](./CONTESTS.md)
- [Integrations API](./INTEGRATIONS.md)
