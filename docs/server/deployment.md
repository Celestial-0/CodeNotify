# Deployment Guide

Complete guide for deploying CodeNotify Server to production environments.

## Overview

CodeNotify can be deployed using various methods including Docker, cloud platforms, or traditional VPS hosting. This guide covers best practices for production deployment.

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **MongoDB**: 6.x or higher
- **Memory**: Minimum 512MB RAM (2GB recommended)
- **Storage**: 10GB minimum
- **Network**: HTTPS/SSL certificate required

### Required Services

1. **MongoDB Database**
   - MongoDB Atlas (recommended)
   - Self-hosted MongoDB
   - MongoDB Docker container

2. **Email Service**
   - Resend API key
   - Alternative: SendGrid, AWS SES

3. **WhatsApp** (Optional)
   - Meta Cloud API credentials
   - Business account verification

## Deployment Methods

### 1. Docker Deployment

See [Docker Configuration](/server/deployment/docker) for containerized deployment.

### 2. Cloud Platforms

#### Vercel / Netlify (Not Recommended)
- These platforms are designed for frontend/serverless
- Not suitable for long-running Node.js applications

#### Railway / Render (Recommended)
- Easy deployment from GitHub
- Automatic HTTPS
- Environment variable management
- Database hosting available

#### AWS / Google Cloud / Azure
- Full control over infrastructure
- Scalable and reliable
- Requires more setup

### 3. VPS Deployment

Traditional server deployment using PM2 process manager.

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/codenotify?retryWrites=true&w=majority

# JWT Secrets (MUST be strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-random

# Token Expiry
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# WhatsApp (Optional)
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=error
```

### Security Checklist

- [ ] Use strong random JWT secrets (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific origins
- [ ] Set secure MongoDB connection string
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable rate limiting
- [ ] Set production logging level
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords

## Build Process

### 1. Install Dependencies

```bash
npm ci --production
```

### 2. Build Application

```bash
npm run build
```

### 3. Verify Build

```bash
ls -la dist/
```

## VPS Deployment with PM2

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'codenotify-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 3. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 4. PM2 Commands

```bash
# View logs
pm2 logs codenotify-api

# Monitor
pm2 monit

# Restart
pm2 restart codenotify-api

# Stop
pm2 stop codenotify-api

# Delete
pm2 delete codenotify-api

# List all processes
pm2 list
```

## Nginx Reverse Proxy

### Configuration

Create `/etc/nginx/sites-available/codenotify`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # Logging
    access_log /var/log/nginx/codenotify-access.log;
    error_log /var/log/nginx/codenotify-error.log;
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/codenotify /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create cluster at https://cloud.mongodb.com
2. Configure network access (whitelist IP or allow all)
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in environment variables

### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt install mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strongPassword",
  roles: ["root"]
})

# Create application database and user
use codenotify
db.createUser({
  user: "codenotify_user",
  pwd: "strongPassword",
  roles: ["readWrite"]
})
```

## Monitoring & Logging

### Application Logs

```bash
# PM2 logs
pm2 logs codenotify-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/codenotify-access.log
sudo tail -f /var/log/nginx/codenotify-error.log
```

### Health Checks

```bash
# API health check
curl https://api.yourdomain.com/

# Contests health check
curl https://api.yourdomain.com/contests/health

# Notifications health check
curl https://api.yourdomain.com/notifications/health
```

### Monitoring Tools

- **PM2 Plus**: Application monitoring
- **New Relic**: APM and monitoring
- **Datadog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

## Backup Strategy

### Database Backups

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Nginx or cloud load balancer
2. **Multiple Instances**: PM2 cluster mode or multiple servers
3. **Database Replication**: MongoDB replica sets
4. **Caching**: Redis for session/data caching

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database indexes
- Enable compression

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process |
| MongoDB connection failed | Check connection string and network access |
| PM2 process crashes | Check logs with `pm2 logs` |
| High memory usage | Restart with `pm2 restart` or increase limit |
| SSL certificate error | Renew with `certbot renew` |

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=production LOG_LEVEL=debug pm2 restart codenotify-api
```

## Performance Optimization

### 1. Enable Compression

```typescript
// main.ts
import compression from 'compression';
app.use(compression());
```

### 2. Database Indexes

Ensure all indexes are created (see [Database Indexes](/server/database/indexes))

### 3. Caching

Implement Redis caching for frequent queries

### 4. CDN

Use CDN for static assets if applicable

## Security Hardening

### 1. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

### 3. Security Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Rollback Strategy

### 1. Keep Previous Build

```bash
# Before deploying new version
cp -r dist dist.backup
```

### 2. Quick Rollback

```bash
# Restore previous version
rm -rf dist
mv dist.backup dist

# Restart application
pm2 restart codenotify-api
```

## Related Documentation

- [Docker Deployment](/server/deployment/docker)
- [System Architecture](/server/architecture)
- [Environment Configuration](/guide/configuration)
- [Database Design](/server/database)
