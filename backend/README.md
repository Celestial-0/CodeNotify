# 🚀 CodeNotify — Smart Contest Alert System

> A comprehensive backend API built with **NestJS** and **TypeScript**, featuring complete authentication, user management, and contest notification system for competitive programming platforms.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

---

## 🧠 Overview

**CodeNotify** is a production-ready backend system that provides:

✅ **Complete Authentication System** - JWT-based auth with refresh tokens  
✅ **User Management** - Profile management with preferences  
✅ **Contest Tracking** - Support for Codeforces, LeetCode, CodeChef, AtCoder  
✅ **Smart Alerts** - Customizable notification system  
✅ **WhatsApp Integration** - Direct contest notifications  
✅ **Comprehensive Testing** - 56 test cases with full coverage  
✅ **Production Security** - bcrypt hashing, input validation, error handling  

**Key Features:**
* **Modular NestJS Architecture** with dependency injection
* **MongoDB + Mongoose** for robust data persistence
* **JWT + Passport** authentication with refresh token rotation
* **Zod Validation** for type-safe input validation
* **Cron-based Scheduling** for automated contest alerts
* **WhatsApp Cloud API** integration for notifications
* **Comprehensive Documentation** with API examples

---

## 🧩 System Architecture

```
+--------------------------------------------------------------+
|                         CodeNotify API                       |
|--------------------------------------------------------------|
|  Authentication  |  Users  |  Contests  |  Alerts  |  Integrations  |
|--------------------------------------------------------------|
|         Core Layer (Config, Logger, Utils, Constants)        |
|--------------------------------------------------------------|
|                 MongoDB (via Mongoose ORM)                   |
+--------------------------------------------------------------+
```

---

## ⚙️ Tech Stack

| Layer              | Technology | Version | Purpose |
| ------------------ | ---------- | ------- | ------- |
| **Backend Framework** | NestJS | ^11.1.6 | Modular TypeScript framework |
| **Database** | MongoDB + Mongoose | ^7.8.7 | Document database with ODM |
| **Authentication** | JWT + Passport | ^11.0.1 | Token-based authentication |
| **Validation** | Zod | ^4.1.12 | Runtime type validation |
| **Password Security** | bcrypt | ^6.0.0 | Password hashing with salt |
| **Scheduling** | @nestjs/schedule | ^6.0.1 | Cron jobs for alerts |
| **HTTP Client** | Axios | ^1.12.2 | External API requests |
| **Configuration** | @nestjs/config | ^4.0.2 | Environment management |
| **Testing** | Jest + Supertest | ^30.0.0 | Unit & integration testing |
| **Code Quality** | ESLint + Prettier | ^9.18.0 | Linting and formatting |
| **Communication** | WhatsApp Cloud API | - | Contest notifications |

---

## 🏗️ Project Modules

| Module | Status | Responsibility | Key Features |
| ------ | ------ | -------------- | ------------ |
| **Auth** | ✅ Complete | JWT authentication system | Signup, signin, signout, refresh tokens |
| **Users** | ✅ Complete | User management & profiles | Profile CRUD, preferences, account status |
| **Common** | ✅ Complete | Shared utilities & validation | Zod schemas, DTOs, decorators, pipes |
| **Config** | ✅ Complete | Environment configuration | Centralized config management |
| **Core** | ✅ Complete | Core utilities & logging | Application-wide utilities |
| **Database** | ✅ Complete | MongoDB connection & setup | Mongoose configuration |
| **Contests** | 🚧 In Progress | Contest data fetching | Codeforces, LeetCode, CodeChef APIs |
| **Alerts** | 🚧 In Progress | Notification scheduling | Cron jobs, alert triggers |
| **Integrations** | 🚧 In Progress | External service integrations | WhatsApp API, notification services |

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Celetstial-0/CodeNotify.git
cd CodeNotify/backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/codenotify

# JWT Authentication (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Contest Platform APIs (Optional)
CODEFORCES_API=https://codeforces.com/api
LEETCODE_API=https://leetcode.com/graphql

# WhatsApp Integration (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_access_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

**⚠️ Security Note:** Generate strong JWT secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Start MongoDB (if running locally)

```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod --dbpath /path/to/your/db
```

### 5️⃣ Run the application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### 6️⃣ Run tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

---

## 🧱 NestJS Module Generation Commands

```bash
# Core layer
nest g module core
nest g service core/logger
nest g module config

# Auth
nest g module auth
nest g service auth
nest g controller auth

# Users
nest g module users
nest g service users
nest g controller users

# Contests
nest g module contests
nest g service contests
nest g controller contests

# Alerts
nest g module alerts
nest g service alerts
nest g controller alerts

# Integrations
nest g module integrations
nest g service integrations/whatsapp
nest g service integrations/notifications

# Database
nest g module database

# Common utilities
nest g module common
```

---

## 🗺️ Development Status

### ✅ **Phase 1 — Core Foundation (COMPLETED)**

* ✅ Initialize NestJS project with TypeScript
* ✅ Setup ESLint, Prettier, and Jest testing
* ✅ Create comprehensive module scaffolding
* ✅ Configure Mongoose and environment variables
* ✅ Implement centralized configuration management

### ✅ **Phase 2 — Authentication System (COMPLETED)**

* ✅ Complete JWT-based authentication with Passport
* ✅ User registration and login endpoints
* ✅ Refresh token rotation system
* ✅ Password hashing with bcrypt (12 salt rounds)
* ✅ Input validation with Zod schemas
* ✅ Comprehensive test coverage (25+ test cases)

### ✅ **Phase 3 — User Management (COMPLETED)**

* ✅ User profile management system
* ✅ User preferences and platform selection
* ✅ Account activation/deactivation
* ✅ Protected route implementation
* ✅ Complete CRUD operations with validation
* ✅ Comprehensive test coverage (32+ test cases)

### 🚧 **Phase 4 — Contest Integration (IN PROGRESS)**

* ✅ Contest module structure
* 🚧 Codeforces API integration
* 🚧 LeetCode API integration
* 🚧 CodeChef and AtCoder support
* 🚧 Contest data storage and caching

### 🚧 **Phase 5 — Alert System (IN PROGRESS)**

* ✅ Alert module structure
* 🚧 Cron-based scheduling system
* 🚧 User preference-based filtering
* 🚧 Alert trigger logic
* 🚧 Notification queue management

### 🚧 **Phase 6 — WhatsApp Integration (IN PROGRESS)**

* ✅ Integration module structure
* 🚧 WhatsApp Cloud API connection
* 🚧 Message template system
* 🚧 Notification dispatch service
* 🚧 Delivery status tracking

### 📋 **Phase 7 — Production Deployment (PLANNED)**

* 📋 Docker containerization
* 📋 CI/CD pipeline setup
* 📋 Environment-specific configurations
* 📋 Production deployment (AWS/Railway/Render)
* 📋 Monitoring and logging setup

---

## 🧩 Project Structure

```
CodeNotify/backend/
├── 📁 src/
│   ├── 📁 auth/                    # ✅ Authentication system
│   │   ├── guards/                 # JWT authentication guards
│   │   ├── strategies/             # Passport JWT strategy
│   │   ├── auth.controller.ts      # Auth endpoints
│   │   ├── auth.service.ts         # Auth business logic
│   │   └── auth.module.ts          # Auth module config
│   ├── 📁 users/                   # ✅ User management
│   │   ├── schemas/                # MongoDB user schema
│   │   ├── users.controller.ts     # User endpoints
│   │   ├── users.service.ts        # User business logic
│   │   └── users.module.ts         # Users module config
│   ├── 📁 common/                  # ✅ Shared utilities
│   │   ├── dto/                    # Data transfer objects
│   │   ├── decorators/             # Custom decorators
│   │   ├── pipes/                  # Validation pipes
│   │   └── interfaces/             # TypeScript interfaces
│   ├── 📁 contests/                # 🚧 Contest management
│   ├── 📁 alerts/                  # 🚧 Alert system
│   ├── 📁 integrations/            # 🚧 External APIs
│   │   ├── whatsapp/               # WhatsApp service
│   │   └── notifications/          # Notification service
│   ├── 📁 config/                  # ✅ Configuration
│   ├── 📁 core/                    # ✅ Core utilities
│   ├── 📁 database/                # ✅ Database config
│   ├── app.module.ts               # Main app module
│   ├── main.ts                     # Application entry point
│   └── test-setup.ts               # Test configuration
├── 📁 test/                        # End-to-end tests
├── 📁 docs/                        # 📚 Documentation
│   ├── AUTH.md                     # Authentication API docs
│   └── USERS.md                    # Users API docs
├── .env.example                    # Environment template
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── nest-cli.json                   # NestJS CLI config
└── README.md                       # This file
```

---

## 🤝 Contribution Guide

1. Fork the repo
2. Create a feature branch (`feature/new-module`)
3. Commit your changes
4. Open a Pull Request

---

## 📚 API Documentation

### 🔐 Authentication API
**Complete JWT-based authentication system**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/auth/signup` | POST | User registration | ✅ |
| `/auth/signin` | POST | User login | ✅ |
| `/auth/signout` | POST | User logout | ✅ |
| `/auth/refresh` | POST | Refresh access token | ✅ |

📖 **[View Complete Auth Documentation →](docs/AUTH.md)**

### 👤 Users API
**Comprehensive user management system**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/users/profile` | GET | Get user profile | ✅ |
| `/users/profile` | PUT | Update user profile | ✅ |
| `/users/:id` | GET | Get user by ID | ✅ |
| `/users/profile` | DELETE | Deactivate account | ✅ |
| `/users/activate` | PUT | Activate account | ✅ |

📖 **[View Complete Users Documentation →](docs/USERS.md)**

### 🏆 Contests API (Coming Soon)
**Contest tracking and management**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/contests` | GET | List upcoming contests | 🚧 |
| `/contests/:id` | GET | Get contest details | 🚧 |
| `/contests/platforms` | GET | Supported platforms | 🚧 |

### 🔔 Alerts API (Coming Soon)
**Smart notification system**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/alerts` | GET | User's alert preferences | 🚧 |
| `/alerts` | POST | Create alert | 🚧 |
| `/alerts/:id` | DELETE | Delete alert | 🚧 |

### 🔗 Quick API Testing

```bash
# Test authentication
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test protected route
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Current Features

### ✅ **Authentication & Security**
- Complete JWT authentication with refresh tokens
- bcrypt password hashing (12 salt rounds)
- Input validation with Zod schemas
- Protected routes with guards
- Comprehensive error handling

### ✅ **User Management**
- User registration and profile management
- Customizable contest preferences
- Platform selection (Codeforces, LeetCode, CodeChef, AtCoder)
- Alert frequency settings (immediate, daily, weekly)
- Account activation/deactivation

### ✅ **Development & Testing**
- 56 comprehensive test cases across 12 test suites
- Full TypeScript support with strict typing
- ESLint and Prettier configuration
- Modular NestJS architecture
- Environment-based configuration

## 💡 Upcoming Features

### 🚧 **Contest Integration**
- Real-time contest data from multiple platforms
- Contest filtering and search
- Historical contest data
- Contest difficulty ratings

### 🚧 **Smart Alerts**
- Customizable notification timing
- WhatsApp integration for instant alerts
- Email notification support
- Contest reminders and updates

### 📋 **Future Enhancements**
- Web dashboard for subscription management
- Telegram and Discord bot integration
- AI-powered contest recommendations
- Contest performance tracking
- Team and group notifications
- Mobile app support

---

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:cov

# Run specific module tests
npm test -- auth
npm test -- users

# Watch mode for development
npm run test:watch
```

**Test Coverage:**
- **AuthService**: 13 test cases
- **AuthController**: 8 test cases  
- **UsersService**: 18 test cases
- **UsersController**: 14 test cases
- **Other Modules**: 3 test cases
- **Total**: 56 test cases across 12 test suites with comprehensive coverage

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** discussions

## 🧑‍💻 Author

**Yash Kumar Singh**  
📧 [proyash3053@gmail.com](mailto:proyash3053@gmail.com)  
🌐 [GitHub](https://github.com/YashKumarSingh3053)  
💼 [LinkedIn](https://linkedin.com/in/yashkumarsingh3053)  

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/YashKumarSingh3053/CodeNotify?style=social)](https://github.com/YashKumarSingh3053/CodeNotify)
[![GitHub forks](https://img.shields.io/github/forks/YashKumarSingh3053/CodeNotify?style=social)](https://github.com/YashKumarSingh3053/CodeNotify)

</div>
