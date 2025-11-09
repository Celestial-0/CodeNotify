# 🚀 CodeNotify — Smart Contest Alert System

> A production-ready server API built with **NestJS** and **TypeScript**, featuring complete authentication, multi-platform contest tracking, and intelligent notification system for competitive programming enthusiasts.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Database Schema](#-database-schema)
- [Platform Integrations](#-platform-integrations)
- [Notification System](#-notification-system)
- [Authentication Flow](#-authentication-flow)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🧠 Overview

**CodeNotify** aggregates competitive programming contests from multiple platforms and delivers personalized notifications to users based on their preferences.

### Core Capabilities

✅ **JWT Authentication** - Secure signin/register with access & refresh tokens  
✅ **Multi-Platform Support** - Codeforces, LeetCode, CodeChef, AtCoder  
✅ **Smart Scheduling** - Automated contest syncing every 6 hours  
✅ **Flexible Notifications** - Email, WhatsApp, Push notifications  
✅ **User Preferences** - Customizable platform, timing, and channel settings  
✅ **RESTful API** - Complete CRUD operations with validation  
✅ **Production Ready** - Comprehensive error handling, logging, and testing

---

## 🏗️ Architecture

**Modular NestJS architecture** with clear separation of concerns:

- **Auth Module** - JWT authentication with refresh token rotation
- **Users Module** - Profile and preference management
- **Contests Module** - Multi-platform contest aggregation
- **Integrations Module** - Platform adapters (Codeforces, LeetCode, CodeChef, AtCoder)
- **Notifications Module** - Multi-channel notification system
- **Scheduler** - Automated cron jobs for syncing and alerts

**Design Patterns:** Adapter, Factory, Repository, Strategy, Dependency Injection

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | NestJS 11, TypeScript 5.9, Node.js |
| **Database** | MongoDB, Mongoose 7.8 |
| **Authentication** | Passport JWT, bcrypt |
| **Validation** | Zod 4.1, nestjs-zod |
| **HTTP Client** | Axios 1.12 |
| **Scheduling** | @nestjs/schedule (Cron) |
| **Notifications** | Resend (Email), WhatsApp Cloud API |
| **Testing** | Jest 30, Supertest |

---

## ✨ Features

### Authentication
- Email/password registration with bcrypt hashing
- JWT access tokens (15 min) + refresh tokens (7 days)
- Automatic token refresh without re-signin
- Role-based access control (User/Admin)

### Contest Management
- Multi-platform sync from 4 platforms
- CRUD operations with Zod validation
- Advanced filtering (platform, phase, type, difficulty)
- Full-text search and pagination
- Platform-wise analytics

### Platform Integrations
- **Codeforces** - REST API (CF, IOI, ICPC contests)
- **LeetCode** - GraphQL API (Weekly, Biweekly contests)
- **CodeChef** - REST API (Long, Cook-Off, Lunch Time, Starters)
- **AtCoder** - Community API (ABC, ARC, AGC, AHC contests)

### Notification System
- Multi-channel support (Email, WhatsApp, Push)
- User preference-based filtering
- Customizable timing (1-168 hours before contest)
- Automated scheduling (every 30 minutes)
- Duplicate prevention

---

## 📁 Project Structure

```
server/
├── src/
│   ├── auth/              # Authentication (JWT, guards, strategies)
│   ├── users/             # User management & preferences
│   ├── contests/          # Contest CRUD & scheduling
│   ├── integrations/      # Platform adapters & WhatsApp
│   │   └── platforms/     # Codeforces, LeetCode, CodeChef, AtCoder
│   ├── notifications/     # Multi-channel notification system
│   ├── common/            # Shared utilities & decorators
│   ├── config/            # Environment configuration
│   ├── database/          # MongoDB connection
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── .env.example           # Environment template
└── package.json           # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start MongoDB (if local)
mongod

# Run development server
npm run start:dev

# Access API at http://localhost:3000
```

### Quick Commands

```bash
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run start:prod     # Production mode
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run lint           # Lint code
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/signin` | POST | signinand get tokens |
| `/auth/refresh-token` | POST | Refresh access token |
| `/auth/logout` | POST | Logout and invalidate tokens |

### Users

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/users/profile` | GET | ✅ | Get user profile |
| `/users/profile` | PATCH | ✅ | Update profile |
| `/users/preferences` | PATCH | ✅ | Update preferences |

### Contests

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/contests` | GET | ❌ | Get all contests (paginated) |
| `/contests/:id` | GET | ✅ | Get contest by ID |
| `/contests/upcoming` | GET | ❌ | Get upcoming contests |
| `/contests/running` | GET | ❌ | Get running contests |
| `/contests/platform/:platform` | GET | ❌ | Get contests by platform |
| `/contests/search` | GET | ❌ | Search contests |
| `/contests/stats` | GET | ❌ | Get statistics |
| `/contests/sync/:platform` | POST | 🔒 Admin | Sync platform contests |

### Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/notifications` | GET | ✅ | Get user notifications |
| `/notifications/:id/read` | PATCH | ✅ | Mark as read |
| `/notifications/:id` | DELETE | ✅ | Delete notification |

**Legend:** ✅ User Auth Required | 🔒 Admin Auth Required | ❌ Public

---

## ⚙️ Environment Configuration

Key environment variables (see `.env.example` for full list):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/codenotify

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Contest Sync
CONTEST_SYNC_ENABLED=true
CONTEST_SYNC_INTERVAL=0 */6 * * *  # Every 6 hours

# Notifications
NOTIFICATIONS_ENABLED=true
NOTIFICATION_WINDOW_HOURS=24

# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=CodeNotify <noreply@yourdomain.com>

# WhatsApp Cloud API
WHATSAPP_API_KEY=your_access_token
WHATSAPP_PHONE_ID=your_phone_id
```

---

## 🗄️ Database Schema

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  phoneNumber?: string
  role: 'user' | 'admin'
  preferences: {
    platforms: string[]
    notificationChannels: { email, whatsapp, push }
    notifyBefore: number (hours)
  }
  refreshToken?: string
  lastLogin?: Date
}
```

### Contest
```typescript
{
  platformId: string (unique per platform)
  name: string
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder'
  phase: 'BEFORE' | 'CODING' | 'FINISHED' | ...
  type: 'CF' | 'WEEKLY' | 'LONG' | 'ABC' | ...
  startTime: Date
  endTime: Date
  durationMinutes: number
  difficulty?: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  platformMetadata: object
  isNotified: boolean
}
```

---

## 🔌 Platform Integrations

All adapters implement the `PlatformAdapter` interface with unified methods:

| Platform | API Type | Status | Contest Types |
|----------|----------|--------|---------------|
| **Codeforces** | REST | ✅ Enabled | CF, IOI, ICPC |
| **LeetCode** | GraphQL | ✅ Enabled | Weekly, Biweekly |
| **CodeChef** | REST | ✅ Enabled | Long, Cook-Off, Lunch Time, Starters |
| **AtCoder** | REST | ✅ Enabled | ABC, ARC, AGC, AHC |

**Sync Schedule:** Every 6 hours (configurable via cron)

---

## 🔔 Notification System

### Flow
1. Scheduler runs every 30 minutes
2. Fetches upcoming contests within notification window
3. Filters by user preferences (platforms, types, timing)
4. Sends via selected channels (Email, WhatsApp, Push)
5. Marks contests as notified to prevent duplicates

### User Preferences
- **Platforms:** Select which platforms to track
- **Timing:** 1-168 hours before contest starts
- **Channels:** Enable/disable Email, WhatsApp, Push

---

## 🔐 Authentication Flow

### Token Strategy
- **Access Token:** 15 minutes (short-lived for security)
- **Refresh Token:** 7 days (long-lived for UX)

### Refresh Mechanism
- `/refresh-token` generates **new access token** only
- Returns **same refresh token** (not regenerated)
- Users stay logged in for 7 days without re-entering credentials

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

**Coverage:** Auth (100%), Users (100%), Contests (95%), Notifications (90%)

---

## 🚢 Deployment

### Production Checklist
- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Use MongoDB Atlas or production database
- [ ] Configure CORS for frontend domain
- [ ] Set up Resend API for emails
- [ ] Configure WhatsApp Business API
- [ ] Enable HTTPS/SSL
- [ ] Set `NODE_ENV=production`
- [ ] Configure logging and monitoring
- [ ] Set up backup strategy

### Build & Deploy
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```bash
docker build -t codenotify-server .
docker run -p 3000:3000 --env-file .env.local codenotify-server
```

---

## 📖 Documentation

For detailed documentation, visit our [VitePress documentation site](#) (coming soon).

Topics covered:
- Complete API reference
- Architecture deep-dive
- Platform integration guides
- Deployment strategies
- Contributing guidelines

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the UNLICENSED License.

---

## 👥 Authors

Built with ❤️ by the CodeNotify team

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Codeforces API](https://codeforces.com/apiHelp)
- [LeetCode GraphQL](https://leetcode.com/graphql)
- [CodeChef API](https://www.codechef.com/api)
- [AtCoder Problems API](https://kenkoooo.com/atcoder/)
- [Resend](https://resend.com/) - Email service
- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)
