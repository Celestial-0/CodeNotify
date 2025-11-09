# Introduction

Welcome to CodeNotify - a comprehensive contest notification system for competitive programming platforms.

## What is CodeNotify?

CodeNotify is a Server API service that aggregates competitive programming contests from multiple platforms and provides intelligent notifications to help programmers never miss a contest.

### Supported Platforms

- **Codeforces** - Div1, Div2, Div3, Educational, Global rounds
- **LeetCode** - Weekly and Biweekly contests
- **CodeChef** - Long Challenge, Cook-Off, Lunchtime, Starters
- **AtCoder** - ABC, ARC, AGC, AHC contests

## Key Features

### 🎯 Multi-Platform Contest Aggregation
- Automatic synchronization every 6 hours
- Unified contest data format
- Real-time contest status tracking
- Historical contest data

### 🔔 Smart Notifications
- Multi-channel support (Email, WhatsApp, Push)
- Customizable notification timing (1-168 hours before)
- Platform and contest type preferences
- Automatic notification scheduling

### 🔐 Secure Authentication
- JWT-based authentication
- Refresh token mechanism (7-day validity)
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt

### 📊 Advanced Features
- Full-text search across contests
- Filter by platform, difficulty, type, status
- Contest analytics and statistics
- Pagination and sorting
- Admin dashboard capabilities

## Technology Stack

### Server Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database with Mongoose ODM
- **Zod** - Schema validation

### Key Libraries
- **Passport JWT** - Authentication strategy
- **Axios** - HTTP client for platform APIs
- **@nestjs/schedule** - Cron jobs for sync
- **Resend** - Email notifications

## Architecture Highlights

### Modular Design
- **Auth Module** - Authentication and authorization
- **Users Module** - User management and preferences
- **Contests Module** - Contest CRUD and filtering
- **Notifications Module** - Multi-channel notifications
- **Platforms Module** - Platform adapter registry

### Design Patterns
- **Adapter Pattern** - Platform integrations
- **Dependency Injection** - Loose coupling
- **Repository Pattern** - Data access layer
- **Guard Pattern** - Route protection

## API Overview

### Base URL
```
http://localhost:3000
```

### Main Endpoints
- `/auth/*` - Authentication (signup, signin, refresh, signout)
- `/users/*` - User management and profiles
- `/contests/*` - Contest discovery and management
- `/notifications/*` - Notification preferences

### Authentication
Most endpoints require JWT access token:
```http
Authorization: Bearer <access_token>
```

## Use Cases

### For Developers
- Never miss important contests
- Track contests across multiple platforms
- Customize notification preferences
- Access historical contest data

### For Admins
- Manage users and roles
- Monitor platform sync status
- Manually trigger contest synchronization
- View system analytics

## Getting Started

1. **[Installation](/guide/installation)** - Set up the development environment
2. **[Configuration](/guide/configuration)** - Configure environment variables
3. **[Quick Start](/guide/quick-start)** - Run your first API request
4. **[API Overview](/api/overview)** - Explore available endpoints

## Documentation Structure

### Guides
- Getting Started - Installation and setup
- Core Concepts - Architecture and patterns
- Advanced Topics - Deployment and scaling

### API Reference
- Authentication endpoints
- User management endpoints
- Contest endpoints
- Notification endpoints

### Server Documentation
- Module architecture
- Database schemas
- Service implementations
- Security and guards

## Community & Support

### Resources
- GitHub Repository
- API Documentation
- Server Architecture Docs

### Contributing
Contributions are welcome! Please follow the contribution guidelines.

## Next Steps

Ready to get started? Head over to the [Installation Guide](/guide/installation) to set up your development environment.
