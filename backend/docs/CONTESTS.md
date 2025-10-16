# 🏆 Contests API Documentation

## Overview

The Contests module is designed to fetch, store, and manage competitive programming contest data from multiple platforms including Codeforces, LeetCode, CodeChef, and AtCoder. This module provides a unified interface for accessing contest information across different platforms.

## Current Status

🚧 **IN DEVELOPMENT** - Module structure is in place, implementation in progress.

## Supported Platforms

| Platform | Status | API Endpoint | Features |
|----------|--------|--------------|----------|
| **Codeforces** | 🚧 Planned | `https://codeforces.com/api` | Upcoming contests, contest details, ratings |
| **LeetCode** | 🚧 Planned | `https://leetcode.com/graphql` | Weekly/biweekly contests, contest history |
| **CodeChef** | 🚧 Planned | `https://www.codechef.com/api` | Long/short contests, ratings |
| **AtCoder** | 🚧 Planned | `https://atcoder.jp/api` | Regular contests, beginner contests |

## Planned API Endpoints

### Contest Listing
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/contests` | List all upcoming contests | 🚧 |
| GET | `/contests/upcoming` | Get contests in next 7 days | 🚧 |
| GET | `/contests/platform/:platform` | Get contests by platform | 🚧 |
| GET | `/contests/today` | Get contests happening today | 🚧 |

### Contest Details
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/contests/:id` | Get specific contest details | 🚧 |
| GET | `/contests/:id/problems` | Get contest problems | 🚧 |
| GET | `/contests/:id/standings` | Get contest standings | 🚧 |

### Platform Management
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/contests/platforms` | List supported platforms | 🚧 |
| GET | `/contests/platforms/:platform/status` | Check platform API status | 🚧 |

## Planned Data Models

### Contest Schema
```typescript
interface Contest {
  id: string;
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: string; // 'div1', 'div2', 'weekly', 'biweekly', etc.
  url: string;
  registrationUrl?: string;
  isRegistrationOpen: boolean;
  participants?: number;
  problems?: ContestProblem[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Contest Problem Schema
```typescript
interface ContestProblem {
  id: string;
  contestId: string;
  name: string;
  index: string; // 'A', 'B', 'C', etc.
  points?: number;
  difficulty?: number;
  tags: string[];
  url: string;
  solvedCount?: number;
}
```

## Planned Features

### 🔄 **Data Synchronization**
- Automated contest data fetching via cron jobs
- Real-time updates for contest status changes
- Intelligent caching to reduce API calls
- Data validation and normalization

### 🔍 **Contest Discovery**
- Filter contests by platform, difficulty, type
- Search contests by name or tags
- Get personalized contest recommendations
- Track contest registration deadlines

### 📊 **Analytics & Insights**
- Contest participation statistics
- Platform-wise contest distribution
- Contest difficulty trends
- User participation history

### 🔔 **Integration with Alerts**
- Automatic alert creation for upcoming contests
- Contest reminder notifications
- Registration deadline alerts
- Contest start/end notifications

## Implementation Plan

### Phase 1: Core Infrastructure
- [ ] Contest data models and schemas
- [ ] Database setup with MongoDB collections
- [ ] Basic CRUD operations for contests
- [ ] Contest validation and sanitization

### Phase 2: Platform Integration
- [ ] Codeforces API integration
- [ ] LeetCode GraphQL integration
- [ ] CodeChef API integration
- [ ] AtCoder API integration

### Phase 3: Data Management
- [ ] Automated data fetching with cron jobs
- [ ] Data caching and optimization
- [ ] Error handling and retry mechanisms
- [ ] Data consistency checks

### Phase 4: Advanced Features
- [ ] Contest filtering and search
- [ ] Contest recommendations
- [ ] Analytics and reporting
- [ ] Performance optimization

## Environment Configuration

```bash
# Contest Platform APIs
CODEFORCES_API=https://codeforces.com/api
LEETCODE_API=https://leetcode.com/graphql
CODECHEF_API=https://www.codechef.com/api
ATCODER_API=https://atcoder.jp/api

# API Rate Limiting
CONTEST_API_RATE_LIMIT=100
CONTEST_CACHE_TTL=300

# Data Sync Settings
CONTEST_SYNC_INTERVAL=3600
CONTEST_CLEANUP_DAYS=30
```

## Example Usage (Planned)

### Fetch Upcoming Contests
```typescript
// Get all upcoming contests
const contests = await contestsService.getUpcomingContests();

// Get contests for specific platform
const codeforcesContests = await contestsService.getContestsByPlatform('codeforces');

// Get contests happening today
const todayContests = await contestsService.getTodayContests();
```

### Contest Filtering
```typescript
// Filter contests by multiple criteria
const filteredContests = await contestsService.filterContests({
  platforms: ['codeforces', 'leetcode'],
  difficulty: 'intermediate',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
  types: ['div2', 'weekly']
});
```

### Contest Details
```typescript
// Get detailed contest information
const contest = await contestsService.getContestById('contest_id');

// Get contest problems
const problems = await contestsService.getContestProblems('contest_id');
```

## Testing Strategy

### Unit Tests
- Contest service methods
- Data validation and transformation
- API integration functions
- Error handling scenarios

### Integration Tests
- External API connectivity
- Database operations
- Cron job execution
- Cache functionality

### End-to-End Tests
- Complete contest data flow
- API endpoint responses
- Data consistency across platforms

## Error Handling

### Common Error Scenarios
- External API failures or timeouts
- Invalid contest data format
- Network connectivity issues
- Rate limiting from external APIs

### Error Response Format
```json
{
  "error": "CONTEST_API_ERROR",
  "message": "Failed to fetch contests from Codeforces",
  "details": {
    "platform": "codeforces",
    "timestamp": "2023-09-06T10:30:00.000Z",
    "retryAfter": 300
  }
}
```

## Performance Considerations

### Caching Strategy
- Contest data cached for 5 minutes
- Platform status cached for 1 hour
- Historical data cached for 24 hours

### Rate Limiting
- Respect external API rate limits
- Implement exponential backoff
- Queue requests during high traffic

### Database Optimization
- Indexed queries for fast lookups
- Pagination for large result sets
- Efficient data aggregation

## Security Considerations

### API Security
- Secure API key storage
- Request validation and sanitization
- Protection against API abuse

### Data Privacy
- No personal user data in contest information
- Secure handling of external API responses
- Audit logging for data access

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live contest updates
- **Contest Analytics**: Advanced statistics and insights
- **Custom Contests**: Support for custom/private contests
- **Contest Reminders**: Integration with calendar applications
- **Mobile API**: Optimized endpoints for mobile applications
- **Contest Predictions**: AI-powered contest difficulty predictions

---

**📝 Note**: This module is currently in development. The API endpoints and features described above are planned implementations. Check the project roadmap for current development status.

**🔗 Related Documentation**:
- [Authentication API](./AUTH.md)
- [Users API](./USERS.md)
- [Alerts API](./ALERTS.md)
- [Integrations API](./INTEGRATIONS.md)
