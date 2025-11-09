# Contests API

Complete API reference for contest management and discovery.

## Overview

The Contests API provides endpoints for discovering, filtering, and managing competitive programming contests from multiple platforms (Codeforces, LeetCode, CodeChef, AtCoder).

## Base URL

```
http://localhost:3000/contests
```

## Supported Platforms

- **Codeforces** - Div1, Div2, Div3, Educational, Global rounds
- **LeetCode** - Weekly and Biweekly contests
- **CodeChef** - Long, Cook-Off, Lunchtime, Starters
- **AtCoder** - ABC, ARC, AGC, AHC contests

## Authentication

Most read endpoints are **public**. Admin operations (create, update, delete, sync) require JWT authentication with admin role.

```http
Authorization: Bearer <admin_access_token>
```

## Endpoints Summary

### Contest Discovery (Public)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contests` | GET | List all contests with pagination |
| `/contests/:id` | GET | Get contest by ID |
| `/contests/upcoming` | GET | Get upcoming contests |
| `/contests/running` | GET | Get currently running contests |
| `/contests/finished` | GET | Get finished contests |
| `/contests/platform/:platform` | GET | Filter by platform |
| `/contests/search` | GET | Search contests by name/description |
| `/contests/difficulty/:level` | GET | Filter by difficulty |
| `/contests/type/:type` | GET | Filter by contest type |

### Analytics (Public)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contests/stats` | GET | Overall contest statistics |
| `/contests/stats/:platform` | GET | Platform-specific statistics |

### Admin Operations (Protected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contests` | POST | Create contest |
| `/contests/:id` | PATCH | Update contest |
| `/contests/:id` | DELETE | Delete contest |
| `/contests/bulk` | POST | Bulk create contests |
| `/contests/sync/:platform` | POST | Sync platform contests |
| `/contests/sync/all` | POST | Sync all platforms |

### System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contests/health` | GET | Health check |

## Quick Examples

### Get Upcoming Contests

```bash
curl http://localhost:3000/contests/upcoming
```

### Search Contests

```bash
curl "http://localhost:3000/contests/search?q=codeforces"
```

### Filter by Platform

```bash
curl http://localhost:3000/contests/platform/leetcode
```

### Get Contest Statistics

```bash
curl http://localhost:3000/contests/stats
```

## Response Format

### Contest Object

```typescript
{
  id: string;                      // MongoDB ObjectId
  platformId: string;              // Platform-specific ID
  name: string;                    // Contest name
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  phase: string;                   // Contest status
  type: string;                    // Contest type
  startTime: string;               // ISO 8601 timestamp
  endTime: string;                 // ISO 8601 timestamp
  durationMinutes: number;         // Duration in minutes
  description?: string;            // Contest description
  websiteUrl?: string;             // Contest URL
  registrationUrl?: string;        // Registration URL
  difficulty?: string;             // BEGINNER | EASY | MEDIUM | HARD | EXPERT
  participantCount?: number;       // Number of participants
  problemCount?: number;           // Number of problems
  platformMetadata: object;        // Platform-specific data
  isActive: boolean;               // Active status
  createdAt: string;               // Creation timestamp
  updatedAt: string;               // Last update timestamp
}
```

### Paginated Response

```typescript
{
  data: Contest[];                 // Array of contests
  pagination: {
    total: number;                 // Total count
    limit: number;                 // Items per page
    offset: number;                // Skip count
    hasNext: boolean;              // Has next page
    hasPrev: boolean;              // Has previous page
  }
}
```

## Query Parameters

### Pagination

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Items per page (1-100) |
| `offset` | number | 0 | Number of items to skip |

### Filtering

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | Filter by platform |
| `phase` | string | Filter by phase |
| `type` | string | Filter by contest type |
| `difficulty` | string | Filter by difficulty |
| `startDate` | date | Filter by start date (>=) |
| `endDate` | date | Filter by end date (<=) |

### Sorting

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | string | startTime | Sort field (startTime, endTime, name, participantCount) |
| `sortOrder` | string | asc | Sort order (asc, desc) |

## Enums

### Platform

- `codeforces`
- `leetcode`
- `codechef`
- `atcoder`

### Phase

- `BEFORE`, `CODING`, `FINISHED` (Codeforces)
- `UPCOMING`, `RUNNING`, `ENDED` (LeetCode)
- `NOT_STARTED`, `STARTED`, `COMPLETED` (CodeChef)

### Contest Type

- **Codeforces**: `CF`, `IOI`, `ICPC`
- **LeetCode**: `WEEKLY`, `BIWEEKLY`
- **CodeChef**: `LONG`, `COOK_OFF`, `LUNCH_TIME`, `STARTERS`
- **AtCoder**: `ABC`, `ARC`, `AGC`, `AHC`

### Difficulty

- `BEGINNER` - Beginner-friendly
- `EASY` - Easy level
- `MEDIUM` - Medium difficulty
- `HARD` - Hard difficulty
- `EXPERT` - Expert level

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Search query parameter \"q\" is required",
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Contest with ID 507f1f77bcf86cd799439011 not found",
  "error": "Not Found"
}
```

### 403 Forbidden (Admin endpoints)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public read | 100 requests | 15 minutes |
| Admin operations | 1000 requests | 15 minutes |

## Related Documentation

- [List Contests](/api/contests/list) - Paginated list
- [Get Contest](/api/contests/get-by-id) - Get by ID
- [Upcoming Contests](/api/contests/upcoming) - Upcoming only
- [Search](/api/contests/search) - Full-text search
- [Statistics](/api/contests/stats) - Analytics
- [Sync Contests](/api/contests/sync) - Admin sync
- [Contests Module](/server/modules/contests) - Server docs

## Scheduled Jobs

### Contest Synchronization
- **Schedule**: Every 6 hours (CRON: `0 */6 * * *`)
- **Job Name**: `sync-all-contests`
- **Timezone**: UTC
- **Function**: Syncs contests from all enabled platforms
- **Configurable**: `CONTEST_SYNC_ENABLED` (default: true)

### Contest Cleanup
- **Schedule**: Daily at 2 AM UTC (CRON: `0 2 * * *`)
- **Job Name**: `cleanup-old-contests`
- **Function**: Deletes old finished contests
- **Retention**: Configurable via `CONTEST_CLEANUP_DAYS` (default: 90 days)
- **Configurable**: `CONTEST_CLEANUP_ENABLED` (default: true)

### Notification Check
- **Schedule**: Every 30 minutes (CRON: `*/30 * * * *`)
- **Job Name**: `check-upcoming-contests`
- **Timezone**: UTC
- **Function**: Checks for upcoming contests and triggers notifications
- **Window**: Configurable via `NOTIFICATION_WINDOW_HOURS` (default: 24 hours)
- **Configurable**: `NOTIFICATIONS_ENABLED` (default: true)

## Notes

- Contests are automatically synced every 6 hours via scheduled job
- Old contests (>90 days) are cleaned up daily at 2 AM UTC
- Notifications checked every 30 minutes for upcoming contests
- Platform metadata varies by platform
- Virtual fields (isUpcoming, isRunning, isFinished) computed on-the-fly
- All scheduled jobs can be enabled/disabled via environment configuration
