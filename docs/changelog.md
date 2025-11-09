# Changelog

All notable changes to CodeNotify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-02-15

### Added

#### Multi-Platform Support
- ✅ Codeforces integration with REST API
- ✅ LeetCode integration with GraphQL API
- ✅ CodeChef integration with REST API
- ✅ AtCoder integration with community API
- ✅ Unified contest data format across all platforms

#### Contest Management
- ✅ Full CRUD operations for contests
- ✅ Advanced search with full-text indexing
- ✅ Filter by platform, difficulty, type, and status
- ✅ Contest statistics and analytics
- ✅ Platform-specific statistics
- ✅ Bulk contest operations
- ✅ Health check endpoint

#### Automated Synchronization
- ✅ Scheduled contest sync every 6 hours
- ✅ Automatic cleanup of old contests (90 days)
- ✅ Manual sync triggers for admins
- ✅ Platform-specific sync endpoints
- ✅ Sync all platforms endpoint

#### Notification System
- ✅ Email notifications via Resend
- ✅ Customizable notification preferences
- ✅ Multi-platform notification support
- ✅ Configurable notification timing (1-168 hours before)
- ✅ Automatic notification scheduling (every 30 minutes)

#### User Management
- ✅ User registration and authentication
- ✅ JWT-based authentication (15min access, 7day refresh)
- ✅ Role-based access control (user/admin)
- ✅ User profile management
- ✅ Account activation/deactivation
- ✅ Admin user management

#### Documentation
- ✅ Comprehensive API documentation
- ✅ Server architecture documentation
- ✅ Getting started guides
- ✅ Core concepts guides
- ✅ Platform integration guides
- ✅ VitePress documentation site

#### Developer Experience
- ✅ TypeScript for type safety
- ✅ Zod schema validation
- ✅ Comprehensive error handling
- ✅ Rate limiting
- ✅ Pagination support
- ✅ MongoDB indexes for performance

### Technical Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6.x with Mongoose
- **Authentication**: Passport JWT
- **Validation**: Zod
- **Scheduling**: @nestjs/schedule
- **Email**: Resend
- **Documentation**: VitePress

### API Endpoints

#### Authentication (7 endpoints)
- POST `/auth/signup` - User registration
- POST `/auth/signin` - User login
- POST `/auth/refresh` - Refresh access token
- POST `/auth/signout` - User logout
- GET `/auth/validate` - Validate token
- POST `/auth/forgot-password` - Password reset request
- POST `/auth/reset-password` - Reset password

#### Users (8 endpoints)
- GET `/users` - List all users (admin)
- GET `/users/profile` - Get current user profile
- PUT `/users/profile` - Update profile
- GET `/users/:id` - Get user by ID
- DELETE `/users/profile` - Deactivate account
- PUT `/users/activate` - Activate account
- PATCH `/users/:id/role` - Update user role (admin)
- DELETE `/users/:id` - Delete user (admin)

#### Contests (19 endpoints)
- GET `/contests` - List all contests
- GET `/contests/:id` - Get contest by ID
- POST `/contests` - Create contest (admin)
- PATCH `/contests/:id` - Update contest (admin)
- DELETE `/contests/:id` - Delete contest (admin)
- GET `/contests/upcoming` - Get upcoming contests
- GET `/contests/running` - Get running contests
- GET `/contests/finished` - Get finished contests
- GET `/contests/search` - Search contests
- GET `/contests/platform/:platform` - Filter by platform
- GET `/contests/difficulty/:level` - Filter by difficulty
- GET `/contests/type/:type` - Filter by type
- GET `/contests/stats` - Get statistics
- GET `/contests/stats/:platform` - Get platform stats
- POST `/contests/sync/:platform` - Sync platform (admin)
- POST `/contests/sync/all` - Sync all platforms (admin)
- POST `/contests/bulk` - Bulk create (admin)
- GET `/contests/health` - Health check

### Breaking Changes

None (initial release)

### Security

- Bcrypt password hashing with salt rounds
- JWT token-based authentication
- Role-based access control
- Input validation with Zod
- Rate limiting on all endpoints
- CORS configuration
- Environment variable validation

### Performance

- MongoDB compound indexes
- Full-text search indexes
- Connection pooling
- Pagination support
- Efficient query optimization

## [Unreleased]

### Planned Features

#### Notifications
- WhatsApp notifications via Twilio
- Push notifications via Firebase
- Telegram bot integration
- Discord webhook integration
- SMS notifications

#### Contest Features
- Contest reminders
- Contest calendar export (iCal)
- Contest recommendations
- Contest history tracking
- Contest difficulty ratings

#### User Features
- Social login (Google, GitHub)
- Two-factor authentication
- Email verification
- Password strength meter
- Profile customization

#### Analytics
- User activity tracking
- Contest participation stats
- Platform popularity metrics
- Notification effectiveness

#### Admin Features
- Admin dashboard
- User management UI
- Contest moderation
- System monitoring
- Audit logs

### Known Issues

- None reported

## Version History

- **v0.0.1** (2025-02-15) - Initial release

## Migration Guide

### From v0.x to v0.0.1

Not applicable (initial release)

## Support

For questions or issues:
- GitHub Issues: https://github.com/Celestial-0/codenotify/issues
- Documentation: https://codenotify.dev/

## Contributors

- Celestial-0 - Initial work

## License

This project is licensed under the MIT License - see the LICENSE file for details.
