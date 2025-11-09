# CodeNotify 🔔

**Smart Contest Alert System** - Never miss a competitive programming contest again.

Get personalized notifications from **Codeforces**, **LeetCode**, **CodeChef**, and **AtCoder** with multi-channel delivery (Email, WhatsApp, Push).

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with refresh token rotation (15min access + 7 days refresh)
- 🌐 **Multi-Platform Integration** - Unified adapter pattern for 4 major competitive programming platforms
- 🔔 **Multi-Channel Notifications** - Email (Resend), WhatsApp (Cloud API), and Push notifications
- ⚡ **Automated Scheduling** - Contest sync every 6 hours, notifications every 30 minutes
- 🎯 **Advanced Filtering** - Full-text search, platform/phase/type/difficulty filters with pagination
- 🏗️ **Modular Architecture** - NestJS modules with dependency injection following SOLID principles
- 📊 **Analytics & Statistics** - Global and platform-specific contest analytics
- ✅ **Type-Safe Validation** - Zod schemas with TypeScript type inference
- 🔒 **Enterprise Security** - JWT guards, RBAC, CORS, environment management
- 🗄️ **Optimized Database** - MongoDB with compound indexes and aggregation pipelines

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- MongoDB 7.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Celestial-0/CodeNotify.git
cd CodeNotify

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

---

## 🛠️ Tech Stack

### Backend
- **NestJS 11** - Backend framework with TypeScript 5.9
- **MongoDB** - NoSQL database with Mongoose ODM
- **Passport JWT** - Authentication with bcrypt
- **Zod** - Runtime validation & type safety

### Platform Integrations
- **Codeforces** - REST API integration
- **LeetCode** - GraphQL API integration
- **CodeChef** - REST API integration
- **AtCoder** - Community API integration

### Notification Services
- **Resend** - Email notifications
- **WhatsApp** - Cloud API messaging
- **Push** - Mobile push alerts

---

## 📡 API Endpoints

CodeNotify provides a comprehensive REST API with **40+ endpoints**:

### Authentication (6 endpoints)
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Authenticate user
- `POST /auth/refresh` - Get new access token
- `POST /auth/signout` - Invalidate tokens
- `GET /auth/me` - Get current user profile
- `POST /auth/verify-email` - Verify email address

### Users (8 endpoints)
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/preferences` - Get notification preferences
- `PATCH /users/preferences` - Update notification preferences
- `GET /users/platforms` - Get selected platforms
- `PATCH /users/platforms` - Update platform preferences
- `DELETE /users/account` - Delete user account
- `GET /users/stats` - Get user statistics

### Contests (18 endpoints)
- `GET /contests` - List all contests (paginated)
- `GET /contests/:id` - Get contest by ID
- `GET /contests/platform/:platform` - Filter by platform
- `GET /contests/upcoming` - Get upcoming contests
- `GET /contests/running` - Get running contests
- `GET /contests/finished` - Get finished contests
- `GET /contests/search` - Search contests
- `GET /contests/difficulty/:level` - Filter by difficulty
- `GET /contests/type/:type` - Filter by contest type
- `GET /contests/stats` - Get global statistics
- `GET /contests/stats/:platform` - Get platform statistics
- `POST /contests/sync/:platform` - Sync platform contests (admin)
- `POST /contests/sync/all` - Sync all platforms (admin)
- `GET /contests/health` - Health check

### Notifications (8 endpoints)
- `GET /notifications` - List user notifications
- `GET /notifications/:id` - Get notification by ID
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/test` - Send test notification
- `GET /notifications/stats` - Get notification statistics
- `GET /notifications/history` - Get notification history

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────┐
│           API Gateway (NestJS)              │
├─────────────┬──────────────┬────────────────┤
│ Auth Module │ Users Module │ Contests Module│
└─────────────┴──────────────┴────────┬───────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            ┌───────▼────────┐ ┌─────▼──────┐ ┌───────▼────────┐
            │   Codeforces   │ │  LeetCode  │ │   CodeChef     │
            │   Adapter      │ │  Adapter   │ │   Adapter      │
            └────────────────┘ └────────────┘ └────────┬───────┘
                                                       │
                                              ┌────────▼────────┐
                                              │    AtCoder      │
                                              │    Adapter      │
                                              └─────────────────┘
                    ┌─────────────────────────────────┐
                    │      Scheduler Service          │
                    │  (Contest Sync + Notifications) │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │    Notifications Module         │
                    ├──────────┬──────────┬───────────┤
                    │  Email   │ WhatsApp │   Push    │
                    └──────────┴──────────┴───────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │         MongoDB                 │
                    │ (Users, Contests, Notifications)│
                    └─────────────────────────────────┘
```

### Key Design Patterns
- **Adapter Pattern** - Unified interface for multiple contest platforms
- **Dependency Injection** - NestJS IoC container for loose coupling
- **Repository Pattern** - Data access abstraction with Mongoose
- **Strategy Pattern** - Multi-channel notification delivery
- **Scheduler Pattern** - Cron-based automated tasks

---

## 📚 Documentation

Comprehensive documentation is available at [https://celestial-0.github.io/CodeNotify/](https://celestial-0.github.io/CodeNotify/)

- **[Getting Started Guide](docs/guide/introduction.md)** - Learn about CodeNotify's features
- **[API Reference](docs/api/overview.md)** - Complete REST API documentation
- **[Backend Architecture](docs/backend/architecture.md)** - System design and module structure
- **[Platform Adapters](docs/backend/adapters.md)** - Integration with contest platforms
- **[Database Design](docs/backend/database.md)** - MongoDB schemas and optimization

---

## 🔧 Configuration

Create a `.env.local` file in the `backend` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/codenotify

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@codenotify.dev

# WhatsApp (Cloud API)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Push Notifications
PUSH_NOTIFICATION_KEY=your-push-key
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📦 Project Structure

```
CodeNotify/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── contests/          # Contest management
│   │   ├── notifications/     # Multi-channel notifications
│   │   ├── integrations/      # Platform adapters
│   │   │   ├── platforms/     # Base adapter & registry
│   │   │   ├── codeforces/    # Codeforces adapter
│   │   │   ├── leetcode/      # LeetCode adapter
│   │   │   ├── codechef/      # CodeChef adapter
│   │   │   └── atcoder/       # AtCoder adapter
│   │   ├── common/            # Shared utilities
│   │   └── config/            # Configuration
│   ├── test/                  # E2E tests
│   └── package.json
├── docs/                      # VitePress documentation
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yash Kumar Singh**
- Email: yashkumarsingh@ieee.com
- GitHub: [@Celestial-0](https://github.com/Celestial-0)

---

## 🙏 Acknowledgments

- Built with ❤️ for competitive programmers worldwide
- Powered by [NestJS](https://nestjs.com/), [MongoDB](https://www.mongodb.com/), and [TypeScript](https://www.typescriptlang.org/)
- Contest data from [Codeforces](https://codeforces.com/), [LeetCode](https://leetcode.com/), [CodeChef](https://www.codechef.com/), and [AtCoder](https://atcoder.jp/)

---

<div align="center">

**[Documentation](https://celestial-0.github.io/CodeNotify/)** • **[API Reference](https://celestial-0.github.io/CodeNotify/api/overview)** • **[Report Bug](https://github.com/Celestial-0/CodeNotify/issues)** • **[Request Feature](https://github.com/Celestial-0/CodeNotify/issues)**

</div>
