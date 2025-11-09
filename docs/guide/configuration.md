# Configuration

Complete guide to configuring CodeNotify Server.

## Environment Variables

All configuration is done through environment variables in the `.env` file.

### Server Configuration

```bash
# Server port (default: 3000)
PORT=3000

# Environment mode
NODE_ENV=development  # development | production | test
```

### Database Configuration

```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/codenotify

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codenotify?retryWrites=true&w=majority
```

**Options**:
- Local MongoDB: `mongodb://localhost:27017/codenotify`
- Docker MongoDB: `mongodb://mongo:27017/codenotify`
- MongoDB Atlas: Use connection string from Atlas dashboard

### JWT Configuration

```bash
# Access token secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Access token expiration
JWT_EXPIRES_IN=15m  # 15 minutes

# Refresh token secret (different from JWT_SECRET!)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long

# Refresh token expiration
JWT_REFRESH_EXPIRES_IN=7d  # 7 days
```

**Security Best Practices**:
- Use strong, random secrets (min 32 characters)
- Different secrets for access and refresh tokens
- Never commit secrets to version control
- Rotate secrets periodically in production

### Contest Sync Configuration

```bash
# Enable/disable automatic contest synchronization
CONTEST_SYNC_ENABLED=true

# Sync interval (cron expression)
# Default: Every 6 hours
CONTEST_SYNC_INTERVAL=0 */6 * * *

# Enable/disable automatic cleanup of old contests
CONTEST_CLEANUP_ENABLED=true

# Days to keep finished contests
CONTEST_CLEANUP_DAYS=90
```

**Cron Expression Examples**:
- `0 */6 * * *` - Every 6 hours
- `0 */12 * * *` - Every 12 hours
- `0 0 * * *` - Daily at midnight
- `0 */1 * * *` - Every hour

### Notification Configuration

```bash
# Enable/disable notifications
NOTIFICATIONS_ENABLED=true

# Notification window in hours
# Contests starting within this window will trigger notifications
NOTIFICATION_WINDOW_HOURS=24

# Email configuration (using Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@codenotify.dev

# WhatsApp configuration (optional)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=+1234567890
```

### Platform Adapter Configuration

```bash
# Enable/disable specific platforms
CODEFORCES_ENABLED=true
LEETCODE_ENABLED=true
CODECHEF_ENABLED=true
ATCODER_ENABLED=true

# API timeouts (milliseconds)
PLATFORM_TIMEOUT=15000

# Retry attempts for failed requests
PLATFORM_RETRY_ATTEMPTS=3
```

## Configuration File

### config/configuration.ts

NestJS configuration module loads environment variables:

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codenotify',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  scheduler: {
    contestSyncEnabled: process.env.CONTEST_SYNC_ENABLED === 'true',
    contestSyncInterval: process.env.CONTEST_SYNC_INTERVAL || '0 */6 * * *',
    contestCleanupEnabled: process.env.CONTEST_CLEANUP_ENABLED === 'true',
    contestCleanupDays: parseInt(process.env.CONTEST_CLEANUP_DAYS, 10) || 90,
  },
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    windowHours: parseInt(process.env.NOTIFICATION_WINDOW_HOURS, 10) || 24,
  },
});
```

## Development vs Production

### Development Configuration

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/codenotify-dev

# Use shorter expiration for testing
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Enable all features
CONTEST_SYNC_ENABLED=true
NOTIFICATIONS_ENABLED=true

# More frequent sync for testing
CONTEST_SYNC_INTERVAL=0 */1 * * *  # Every hour
```

### Production Configuration

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codenotify

# Production secrets (use strong random strings)
JWT_SECRET=<generated-secret-min-32-chars>
JWT_REFRESH_SECRET=<different-generated-secret-min-32-chars>

# Standard expiration
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Enable production features
CONTEST_SYNC_ENABLED=true
NOTIFICATIONS_ENABLED=true

# Standard sync interval
CONTEST_SYNC_INTERVAL=0 */6 * * *

# Cleanup old contests
CONTEST_CLEANUP_ENABLED=true
CONTEST_CLEANUP_DAYS=90

# Production email
RESEND_API_KEY=<your-production-key>
EMAIL_FROM=noreply@yourdomain.com
```

## Scheduled Jobs

### Contest Synchronization

**Schedule**: Every 6 hours (configurable)
**Function**: Syncs contests from all enabled platforms
**Configuration**:
```bash
CONTEST_SYNC_ENABLED=true
CONTEST_SYNC_INTERVAL=0 */6 * * *
```

**Disable**:
```bash
CONTEST_SYNC_ENABLED=false
```

### Contest Cleanup

**Schedule**: Daily at 2 AM UTC
**Function**: Deletes contests older than specified days
**Configuration**:
```bash
CONTEST_CLEANUP_ENABLED=true
CONTEST_CLEANUP_DAYS=90
```

**Disable**:
```bash
CONTEST_CLEANUP_ENABLED=false
```

### Notification Check

**Schedule**: Every 30 minutes
**Function**: Checks for upcoming contests and sends notifications
**Configuration**:
```bash
NOTIFICATIONS_ENABLED=true
NOTIFICATION_WINDOW_HOURS=24
```

**Disable**:
```bash
NOTIFICATIONS_ENABLED=false
```

## Database Configuration

### MongoDB Options

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: process.env.MONGODB_URI,
    retryWrites: true,
    w: 'majority',
    // Connection pool
    maxPoolSize: 10,
    minPoolSize: 5,
    // Timeouts
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }),
});
```

### Indexes

Indexes are automatically created on application start:
- Contest: platform, startTime, phase, platformId+platform (unique)
- User: email (unique), role, isActive

## Email Configuration

### Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Get API key from dashboard
3. Verify domain (for production)
4. Add to `.env`:

```bash
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Email Templates

Emails are sent for:
- Contest notifications (upcoming contests)
- Account verification (optional)
- Password reset (optional)

## Security Configuration

### CORS

Configure allowed origins in `main.ts`:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

### Rate Limiting

Configure rate limits per endpoint:

```typescript
@Throttle(100, 60)  // 100 requests per 60 seconds
```

### Helmet

Security headers are enabled by default:

```typescript
app.use(helmet());
```

## Logging

### Log Levels

```bash
# Log level: error | warn | log | debug | verbose
LOG_LEVEL=log
```

### Custom Logger

```typescript
const logger = new Logger('ModuleName');
logger.log('Info message');
logger.error('Error message', trace);
logger.warn('Warning message');
logger.debug('Debug message');
```

## Performance Tuning

### Connection Pool

```bash
# MongoDB connection pool size
MONGODB_POOL_SIZE=10
```

### Cache Configuration

```bash
# Enable caching
CACHE_ENABLED=true

# Cache TTL (seconds)
CACHE_TTL=300  # 5 minutes
```

## Monitoring

### Health Checks

```bash
# Enable health check endpoint
HEALTH_CHECK_ENABLED=true
```

Access at: `GET /contests/health`

### Metrics

```bash
# Enable metrics collection
METRICS_ENABLED=true
```

## Environment-Specific Files

### .env.development

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/codenotify-dev
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
```

### .env.production

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-production-secret>
JWT_REFRESH_SECRET=<strong-production-refresh-secret>
```

### .env.test

```bash
NODE_ENV=test
PORT=3001
MONGODB_URI=mongodb://localhost:27017/codenotify-test
JWT_SECRET=test-secret
JWT_REFRESH_SECRET=test-refresh-secret
```

## Validation

Environment variables are validated on startup:

```typescript
// Required variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## Best Practices

### ✅ Do

1. **Use strong secrets** (min 32 characters)
2. **Different secrets** for access and refresh tokens
3. **Never commit** `.env` to version control
4. **Use environment-specific** files
5. **Validate** required variables on startup
6. **Rotate secrets** periodically
7. **Use MongoDB Atlas** for production
8. **Enable all security** features in production

### ❌ Don't

1. **Don't use default** secrets in production
2. **Don't share** secrets across environments
3. **Don't commit** `.env` files
4. **Don't use weak** passwords
5. **Don't disable** security features
6. **Don't use same secret** for JWT and refresh

## Troubleshooting

### Missing Environment Variables

```bash
# Error: JWT_SECRET is not defined

# Solution: Check .env file exists
ls -la .env

# Verify variable is set
cat .env | grep JWT_SECRET
```

### MongoDB Connection Failed

```bash
# Error: MongooseServerSelectionError

# Solutions:
# 1. Check MongoDB is running
sudo systemctl status mongod

# 2. Verify MONGODB_URI
echo $MONGODB_URI

# 3. Test connection
mongosh $MONGODB_URI
```

### Invalid Cron Expression

```bash
# Error: Invalid cron expression

# Solution: Validate cron expression
# Use: https://crontab.guru/
```

## Next Steps

- [Quick Start](/guide/quick-start) - Make your first API request
- [Architecture](/guide/architecture) - Understand the system
- [Authentication](/guide/authentication) - Deep dive into auth
