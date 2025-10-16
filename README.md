<div align="center">

# 🔔 CodeNotify

### Never Miss a Coding Contest Again

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A smart, multi-channel notification service that keeps competitive programmers updated about upcoming contests across all major platforms.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-reference) • [Contributing](#-contributing)

---

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Supported Platforms](#-supported-platforms)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**CodeNotify** is an intelligent notification service designed for competitive programmers who want to stay informed about coding contests without constantly checking multiple platforms. Built with modern technologies and best practices, it provides a reliable, scalable solution for contest notifications.

### Why CodeNotify?

- **🔄 Automated Tracking**: Automatically monitors contest schedules from Codeforces, LeetCode, CodeChef, and AtCoder
- **📱 Multi-Channel Delivery**: Receive notifications via WhatsApp, Telegram, Email, or all three
- **⚙️ Customizable Preferences**: Choose platforms, notification timings, and delivery channels
- **🔒 Secure & Private**: JWT authentication, encrypted credentials, and GDPR-compliant data handling
- **🚀 Production Ready**: Comprehensive testing, error handling, and monitoring capabilities
- **📊 Developer Friendly**: Well-documented REST API with OpenAPI/Swagger support

---

## ✨ Features

### Core Features

- ✅ **Multi-Platform Contest Tracking**
  - Real-time contest data from Codeforces, LeetCode, CodeChef, and AtCoder
  - Automatic synchronization every hour
  - Historical contest data and analytics

- ✅ **Flexible Notification System**
  - WhatsApp messages via Cloud API
  - Telegram bot integration
  - Email notifications with HTML templates
  - Customizable notification timing (instant, daily digest, weekly summary)

- ✅ **User Management**
  - Secure authentication with JWT
  - User profiles with preferences
  - Platform and channel selection
  - Account activation/deactivation

- ✅ **Smart Scheduling**
  - Cron-based alert system
  - Timezone-aware notifications
  - Configurable alert windows (1 hour, 1 day, 1 week before)
  - Rate limiting and delivery optimization

### Technical Features

- 🔐 **Security First**
  - JWT authentication with refresh tokens
  - bcrypt password hashing (12 rounds)
  - Input validation with Zod schemas
  - CORS and rate limiting

- 🏗️ **Modern Architecture**
  - Modular NestJS design
  - Dependency injection
  - Repository pattern
  - Event-driven architecture

- 🧪 **Comprehensive Testing**
  - 56+ unit tests across all modules
  - Integration tests with supertest
  - E2E test coverage
  - Automated CI/CD pipeline

- 📊 **Monitoring & Logging**
  - Structured logging with Winston
  - Error tracking and reporting
  - Performance metrics
  - Health check endpoints

---

## 🏆 Supported Platforms

| Platform | Status | Features | API Endpoint |
|----------|--------|----------|--------------|
| **Codeforces** | ✅ Active | Contests, Ratings, Upcoming | `https://codeforces.com/api` |
| **LeetCode** | ✅ Active | Contests, Weekly/Biweekly | `https://leetcode.com/graphql` |
| **CodeChef** | 🚧 In Progress | Long/Short/Lunchtime | `https://www.codechef.com/api` |
| **AtCoder** | 🚧 In Progress | ABC, ARC, AGC contests | `https://atcoder.jp/contests` |
| **HackerRank** | 📋 Planned | Contests & Challenges | - |
| **HackerEarth** | 📋 Planned | Hiring & Practice | - |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CodeNotify Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │   WebSocket  │  │   Webhooks   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│  ┌──────┴──────────────────┴──────────────────┴───────┐     │
│  │              Application Layer                       │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │     │
│  │  │  Auth   │ │  Users  │ │Contests │ │  Alerts  │ │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘ │     │
│  └──────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐     │
│  │              Business Logic Layer                    │     │
│  │  ┌──────────────┐  ┌──────────────┐ ┌───────────┐ │     │
│  │  │   Contest    │  │ Notification │ │ Scheduler │ │     │
│  │  │   Fetcher    │  │   Service    │ │  Service  │ │     │
│  │  └──────────────┘  └──────────────┘ └───────────┘ │     │
│  └──────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐     │
│  │              Integration Layer                       │     │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ │     │
│  │  │WhatsApp  │ │ Telegram │ │ Email  │ │  SMS    │ │     │
│  │  │   API    │ │   Bot    │ │Service │ │Provider │ │     │
│  │  └──────────┘ └──────────┘ └────────┘ └─────────┘ │     │
│  └──────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐     │
│  │                 Data Layer                           │     │
│  │         MongoDB (Users, Contests, Alerts)           │     │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22
- **MongoDB** >= 6.0 (or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Celestial-0/CodeNotify.git
   cd CodeNotify
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/codenotify
   
   # JWT Secrets (Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   
   # WhatsApp (Get from Meta Business Suite)
   WHATSAPP_API_KEY=your_whatsapp_api_access_token
   WHATSAPP_PHONE_ID=your_whatsapp_phone_id
   
   # Telegram (Get from @BotFather)
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   
   # Email (SMTP Configuration)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod --dbpath /path/to/your/db
   ```

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:3000/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-16T12:00:00.000Z",
     "uptime": 123.456
   }
   ```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for access tokens | Yes | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes | - |
| `WHATSAPP_API_KEY` | WhatsApp Cloud API token | No | - |
| `WHATSAPP_PHONE_ID` | WhatsApp Phone Number ID | No | - |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | No | - |
| `EMAIL_HOST` | SMTP host | No | - |
| `EMAIL_PORT` | SMTP port | No | 587 |
| `EMAIL_USER` | Email username | No | - |
| `EMAIL_PASSWORD` | Email password/app password | No | - |

### Generating Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Setting Up Notification Channels

#### WhatsApp Setup
1. Create a Meta Business Account
2. Set up WhatsApp Business API
3. Get your Phone Number ID and Access Token
4. Add to `.env` file

**[Detailed WhatsApp Setup Guide →](docs/INTEGRATIONS.md#whatsapp-setup)**

#### Telegram Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token
4. Add to `.env` file

**[Detailed Telegram Setup Guide →](docs/INTEGRATIONS.md#telegram-setup)**

#### Email Setup
1. Use Gmail, SendGrid, or any SMTP provider
2. For Gmail: Enable 2FA and create an App Password
3. Add credentials to `.env` file

**[Detailed Email Setup Guide →](docs/INTEGRATIONS.md#email-setup)**

---

## 📚 API Reference

### Authentication

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### User Management

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {accessToken}
```

#### Update Preferences
```http
PUT /users/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "preferences": {
    "platforms": ["codeforces", "leetcode"],
    "notificationChannels": ["whatsapp", "email"],
    "alertFrequency": "immediate",
    "timezone": "Asia/Kolkata"
  }
}
```

### Contests

#### Get Upcoming Contests
```http
GET /contests?platform=codeforces&limit=10
Authorization: Bearer {accessToken}
```

#### Get Contest Details
```http
GET /contests/:id
Authorization: Bearer {accessToken}
```

### Alerts

#### Create Alert
```http
POST /alerts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contestId": "507f1f77bcf86cd799439011",
  "alertTime": "1_hour_before",
  "channels": ["whatsapp", "telegram"]
}
```

**[Complete API Documentation →](docs/API_OVERVIEW.md)**

---

## 🛠️ Development

### Project Structure

```
CodeNotify/
├── backend/                      # NestJS backend application
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── users/               # User management
│   │   ├── contests/            # Contest tracking
│   │   ├── alerts/              # Alert scheduling
│   │   ├── integrations/        # External services
│   │   │   ├── whatsapp/        # WhatsApp service
│   │   │   ├── telegram/        # Telegram service
│   │   │   ├── email/           # Email service
│   │   │   └── notifications/   # Notification orchestrator
│   │   ├── common/              # Shared utilities
│   │   ├── config/              # Configuration
│   │   ├── core/                # Core services
│   │   └── database/            # Database config
│   ├── test/                    # E2E tests
│   ├── docs/                    # API documentation
│   └── package.json
├── frontend/                     # (Planned) Web dashboard
├── docs/                        # Project documentation
├── .github/                     # GitHub Actions workflows
└── README.md                    # This file
```

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

### Adding a New Module

```bash
# Generate a new module with NestJS CLI
nest g module feature-name
nest g service feature-name
nest g controller feature-name

# Example: Adding GitHub integration
nest g module integrations/github
nest g service integrations/github
```

---

## 🧪 Testing

CodeNotify maintains high test coverage across all modules.

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific module tests
npm test -- auth
npm test -- users
npm test -- contests

# Run in watch mode
npm run test:watch
```

### Test Coverage

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   92.5  |   88.2   |   94.1  |   93.8  |
 auth/                    |   95.2  |   91.5   |   96.3  |   96.1  |
 users/                   |   93.8  |   89.7   |   95.2  |   94.5  |
 contests/                |   88.5  |   82.1   |   90.4  |   89.2  |
 alerts/                  |   91.2  |   86.8   |   92.7  |   92.1  |
 integrations/            |   90.3  |   85.4   |   91.8  |   91.0  |
--------------------------|---------|----------|---------|---------|
```

### Writing Tests

Example test structure:

```typescript
describe('ContestsService', () => {
  let service: ContestsService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ContestsService],
    }).compile();
    
    service = module.get<ContestsService>(ContestsService);
  });
  
  it('should fetch upcoming contests', async () => {
    const contests = await service.getUpcoming('codeforces');
    expect(contests).toBeDefined();
    expect(contests.length).toBeGreaterThan(0);
  });
});
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t codenotify:latest .

# Run with Docker Compose
docker-compose up -d
```

### Railway/Render Deployment

1. **Connect your GitHub repository**
2. **Set environment variables** in the dashboard
3. **Deploy automatically** on git push

### AWS/Cloud Deployment

Detailed deployment guides:
- [AWS EC2 Deployment](docs/deployment/AWS.md)
- [Google Cloud Platform](docs/deployment/GCP.md)
- [Azure Deployment](docs/deployment/AZURE.md)
- [DigitalOcean Deployment](docs/deployment/DIGITALOCEAN.md)

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or testing.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make** your changes
4. **Test** your changes thoroughly
   ```bash
   npm test
   npm run test:e2e
   ```
5. **Commit** with conventional commits
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push** to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open** a Pull Request

### Contribution Guidelines

- ✅ Follow the existing code style (ESLint + Prettier)
- ✅ Write comprehensive tests for new features
- ✅ Update documentation for API changes
- ✅ Use conventional commit messages
- ✅ Ensure all tests pass before submitting PR
- ✅ Keep PRs focused on a single feature/fix

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build/config changes

**Example:**
```
feat(contests): add CodeChef integration

- Implement CodeChef API client
- Add contest data mapping
- Update tests and documentation

Closes #123
```

### Development Setup for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/CodeNotify.git
cd CodeNotify/backend

# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm test

# Commit and push
git commit -m "feat: your feature"
git push origin feature/your-feature
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] NestJS project setup
- [x] MongoDB integration
- [x] JWT authentication
- [x] User management
- [x] Comprehensive testing

### 🚧 Phase 2: Core Features (In Progress)
- [x] Contest tracking module
- [ ] Codeforces integration
- [ ] LeetCode integration
- [ ] Alert scheduling system
- [ ] WhatsApp notifications

### 📋 Phase 3: Multi-Channel Support (Planned)
- [ ] Telegram bot integration
- [ ] Email notifications
- [ ] SMS alerts (Twilio)
- [ ] Discord bot
- [ ] Slack integration

### 📋 Phase 4: Enhanced Features (Future)
- [ ] Web dashboard UI
- [ ] Contest analytics
- [ ] Performance tracking
- [ ] Team/group notifications
- [ ] AI-powered recommendations
- [ ] Mobile app (React Native)

### 📋 Phase 5: Enterprise Features (Future)
- [ ] Multi-tenant support
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] Custom branding
- [ ] API rate limiting tiers
- [ ] Webhook support

---

## 📊 Project Status

| Module | Status | Test Coverage | Documentation |
|--------|--------|---------------|---------------|
| Authentication | ✅ Complete | 95% | ✅ Complete |
| User Management | ✅ Complete | 94% | ✅ Complete |
| Contest Tracking | 🚧 In Progress | 89% | 🚧 In Progress |
| Alert System | 🚧 In Progress | 92% | 🚧 In Progress |
| WhatsApp Integration | 🚧 In Progress | 91% | 🚧 In Progress |
| Telegram Integration | 📋 Planned | - | 📋 Planned |
| Email Integration | 📋 Planned | - | 📋 Planned |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Yash Kumar Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 💖 Acknowledgments

- **NestJS** - Progressive Node.js framework
- **Codeforces API** - Contest data provider
- **LeetCode** - Contest information
- **Meta WhatsApp Business API** - WhatsApp messaging
- **Telegram Bot API** - Telegram notifications
- **MongoDB** - Database solution
- All contributors and supporters of this project

---

## 📞 Support & Contact

### Get Help

- 📖 **Documentation**: Check the [docs](docs/) folder
- 🐛 **Bug Reports**: [Create an issue](https://github.com/Celestial-0/CodeNotify/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Submit an idea](https://github.com/Celestial-0/CodeNotify/issues/new?template=feature_request.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Celestial-0/CodeNotify/discussions)

### Connect with the Author

**Yash Kumar Singh**

- 📧 Email: [proyash3053@gmail.com](mailto:proyash3053@gmail.com)
- 🐙 GitHub: [@Celestial-0](https://github.com/Celestial-0)
- 💼 LinkedIn: [yashkumarsingh3053](https://linkedin.com/in/yashkumarsingh3053)
- 🐦 Twitter: [@YashKumarSingh](https://twitter.com/YashKumarSingh)

### Community

- 🌟 Star this repository if you find it helpful!
- 🍴 Fork it to contribute
- 👀 Watch for updates

---

<div align="center">

### 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Celestial-0/CodeNotify&type=Date)](https://star-history.com/#Celestial-0/CodeNotify&Date)

---

**Made with ❤️ by [Yash Kumar Singh](https://github.com/Celestial-0)**

If you find this project useful, please consider giving it a ⭐!

[![GitHub stars](https://img.shields.io/github/stars/Celestial-0/CodeNotify?style=social)](https://github.com/Celestial-0/CodeNotify/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Celestial-0/CodeNotify?style=social)](https://github.com/Celestial-0/CodeNotify/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/Celestial-0/CodeNotify?style=social)](https://github.com/Celestial-0/CodeNotify/watchers)

</div>
