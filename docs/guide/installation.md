# Installation

Complete guide to setting up CodeNotify Server for development.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | >= 18.x | Runtime environment |
| **npm** | >= 9.x | Package manager |
| **MongoDB** | >= 6.x | Database |
| **Git** | Latest | Version control |

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check MongoDB
mongod --version
# Should output: db version v6.x.x or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CodeNotify
```

### 2. Navigate to Server

```bash
cd server
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages:
- **@nestjs/core** - NestJS framework
- **@nestjs/mongoose** - MongoDB integration
- **@nestjs/jwt** - JWT authentication
- **@nestjs/schedule** - Cron jobs
- **mongoose** - MongoDB ODM
- **zod** - Schema validation
- **bcrypt** - Password hashing
- **axios** - HTTP client
- **resend** - Email service

### 4. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Whitelist your IP address

### 5. Configure Environment Variables

Create `.env` file in the `Server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/codenotify
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/codenotify

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Contest Sync Configuration
CONTEST_SYNC_ENABLED=true
CONTEST_SYNC_INTERVAL=0 */6 * * *
CONTEST_CLEANUP_ENABLED=true
CONTEST_CLEANUP_DAYS=90

# Notification Configuration
NOTIFICATIONS_ENABLED=true
NOTIFICATION_WINDOW_HOURS=24

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@codenotify.dev

# WhatsApp Configuration (Optional)
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=+1234567890
```

### 6. Verify Installation

```bash
# Build the project
npm run build

# Run tests
npm run test

# Check for linting errors
npm run lint
```

## Project Structure

```
Server/
├── src/
│   ├── auth/                 # Authentication module
│   ├── users/                # User management
│   ├── contests/             # Contest management
│   ├── notifications/        # Notification system
│   ├── integrations/         # Platform adapters
│   │   └── platforms/
│   │       ├── codeforces/
│   │       ├── leetcode/
│   │       ├── codechef/
│   │       └── atcoder/
│   ├── common/               # Shared utilities
│   ├── config/               # Configuration
│   ├── database/             # Database setup
│   └── main.ts              # Application entry
├── test/                     # E2E tests
├── .env                      # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── nest-cli.json            # NestJS config
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

This starts the server with hot-reload enabled. The API will be available at:
```
http://localhost:3000
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

Debugger will be available on port 9229.

## Verify Installation

### 1. Check Server Status

Open browser and navigate to:
```
http://localhost:3000
```

You should see the CodeNotify landing page with API status.

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/contests/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:00:00.000Z"
}
```

### 3. Check Database Connection

The server logs should show:
```
[Nest] INFO [MongooseModule] Mongoose connected successfully
[Nest] INFO [NestApplication] Nest application successfully started
```

## Common Issues

### Port Already in Use

```bash
# Error: Port 3000 is already in use

# Solution: Change PORT in .env or kill the process
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Failed

```bash
# Error: MongooseServerSelectionError

# Solutions:
# 1. Verify MongoDB is running
sudo systemctl status mongod

# 2. Check MONGODB_URI in .env
# 3. Verify network connectivity (for Atlas)
# 4. Check IP whitelist (for Atlas)
```

### Missing Dependencies

```bash
# Error: Cannot find module

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loaded

```bash
# Error: JWT_SECRET is not defined

# Solution: Verify .env file exists and is in Server directory
ls -la .env
```

## Development Tools

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Thunder Client** - API testing
- **MongoDB for VS Code** - Database management

### Useful Commands

```bash
# Format code
npm run format

# Lint and fix
npm run lint

# Run tests with coverage
npm run test:cov

# Watch mode for tests
npm run test:watch
```

## Next Steps

Now that you have CodeNotify installed:

1. **[Configuration](/guide/configuration)** - Configure advanced settings
2. **[Quick Start](/guide/quick-start)** - Make your first API request
3. **[Architecture](/guide/architecture)** - Understand the system design

## Troubleshooting

If you encounter issues:

1. Check the [Common Issues](#common-issues) section
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly set
4. Check server logs for detailed error messages
5. Consult the [API Documentation](/api/overview)

## Production Deployment

For production deployment, see:
- Docker configuration
- Environment setup
- Security checklist
- Monitoring and logging
