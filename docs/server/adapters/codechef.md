# CodeChef Adapter

Platform adapter for fetching contest data from CodeChef REST API.

## Overview

The CodeChef adapter integrates with CodeChef's public API to fetch contest information including STARTERS, COOK-OFF, LUNCHTIME, and LONG challenges.

## Status

✅ **Enabled** - Fully implemented and active

## API Details

| Property | Value |
|----------|-------|
| **API Type** | REST API |
| **Endpoint** | `https://www.codechef.com/api/list/contests/all` |
| **Method** | GET |
| **Authentication** | None (public API) |
| **Timeout** | 15000ms |
| **Retry Attempts** | 3 |

## Location

```
Server/src/integrations/platforms/codechef/codechef.adapter.ts
```

## Implementation

```typescript
@Injectable()
export class CodeChefAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.CODECHEF;
  private readonly apiEndpoint = PLATFORM_URLS.CODECHEF;

  constructor() {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: PLATFORM_URLS.CODECHEF,
      timeout: PLATFORM_TIMEOUTS.CODECHEF,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }
}
```

## API Response Format

### CodeChef Contest Object

```typescript
interface CodeChefContest {
  contest_code: string;           // Contest code (e.g., "START120")
  contest_name: string;           // Contest name
  contest_start_date: string;     // Start date string
  contest_end_date: string;       // End date string
  contest_start_date_iso: string; // ISO format start
  contest_end_date_iso: string;   // ISO format end
  contest_duration: string;       // Duration in minutes
  distinct_users: number;         // Participant count
  contest_type?: string;          // Contest type
}
```

### API Response

```typescript
interface CodeChefApiResponse {
  status: string;                      // "success" or "error"
  present_contests?: CodeChefContest[]; // Running contests
  future_contests?: CodeChefContest[];  // Upcoming contests
  past_contests?: CodeChefContest[];    // Past contests
}
```

## Contest Types

| Type | Description | Duration | Difficulty |
|------|-------------|----------|------------|
| `STARTERS` | Beginner-friendly | 2 hours | BEGINNER |
| `LUNCH_TIME` | Lunchtime contest | 3 hours | MEDIUM |
| `COOK_OFF` | Cook-Off contest | 2.5 hours | MEDIUM |
| `LONG` | Long Challenge | 10 days | HARD |

## Type Detection

```typescript
const name = contest.contest_name.toLowerCase();
const code = contest.contest_code.toLowerCase();

if (name.includes('starters') || code.includes('start')) {
  type = ContestType.STARTERS;
} else if (name.includes('lunchtime') || code.includes('ltime')) {
  type = ContestType.LUNCH_TIME;
} else if (name.includes('cookoff') || code.includes('cook')) {
  type = ContestType.COOK_OFF;
} else if (name.includes('long')) {
  type = ContestType.LONG;
}
```

## Methods

### fetchContests()

Fetch all contests from CodeChef API (present, future, past).

```typescript
async fetchContests(): Promise<ContestData[]>
```

**Process:**
1. Make GET request to API endpoint
2. Validate response status is "success"
3. Process present contests (running)
4. Process future contests (upcoming)
5. Process past contests (limited to 20 recent)
6. Transform all to internal format
7. Return combined array

**Example Response:**
```json
{
  "status": "success",
  "present_contests": [],
  "future_contests": [
    {
      "contest_code": "START120",
      "contest_name": "Starters 120",
      "contest_start_date_iso": "2024-02-15T14:30:00+05:30",
      "contest_end_date_iso": "2024-02-15T16:30:00+05:30",
      "contest_duration": "120",
      "distinct_users": 0
    }
  ],
  "past_contests": [...]
}
```

### fetchUpcomingContests()

Fetch only upcoming contests.

```typescript
async fetchUpcomingContests(): Promise<ContestData[]>
```

### fetchRunningContests()

Fetch only running contests.

```typescript
async fetchRunningContests(): Promise<ContestData[]>
```

### transformToInternalFormat()

Transform CodeChef contest to unified format.

```typescript
transformToInternalFormat(data: any): ContestData
```

**Transformation Logic:**

```typescript
{
  platformId: ccContest.contest_code,
  platform: ContestPlatform.CODECHEF,
  name: ccContest.contest_name,
  type: this.detectType(ccContest),
  phase: this.determinePhase(category, startTime, endTime),
  startTime: new Date(ccContest.contest_start_date_iso),
  endTime: new Date(ccContest.contest_end_date_iso),
  durationMinutes: this.calculateDuration(startTime, endTime),
  websiteUrl: `https://www.codechef.com/${ccContest.contest_code}`,
  participantCount: ccContest.distinct_users || 0,
  difficulty: this.mapDifficulty(type),
  isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
  platformMetadata: {
    contest_code: ccContest.contest_code,
    contest_type: ccContest.contest_type,
    distinct_users: ccContest.distinct_users,
  },
  lastSyncedAt: new Date(),
}
```

## Platform Metadata

CodeChef-specific metadata stored in `platformMetadata`:

```typescript
{
  contest_code: string;      // Contest code
  contest_type: string;      // Contest type
  distinct_users: number;    // Participant count
}
```

## Difficulty Mapping

```typescript
const difficultyMap = {
  [ContestType.STARTERS]: DifficultyLevel.BEGINNER,
  [ContestType.LUNCH_TIME]: DifficultyLevel.MEDIUM,
  [ContestType.COOK_OFF]: DifficultyLevel.MEDIUM,
  [ContestType.LONG]: DifficultyLevel.HARD,
};
```

## Phase Determination

```typescript
let phase: ContestPhase;

if (category === 'future' || startTime > now) {
  phase = ContestPhase.BEFORE;
} else if (category === 'present' || (startTime <= now && endTime > now)) {
  phase = ContestPhase.CODING;
} else {
  phase = ContestPhase.FINISHED;
}
```

## Past Contest Limit

Only recent past contests are fetched to reduce data volume:

```typescript
const recentPast = response.past_contests.slice(0, 20); // Limit to 20
```

## Example Usage

### Sync CodeChef Contests

```bash
# Manual sync (admin only)
curl -X POST http://localhost:3000/contests/sync/codechef \
  -H "Authorization: Bearer <admin_token>"
```

### Get CodeChef Contests

```bash
# Get all CodeChef contests
curl http://localhost:3000/contests/platform/codechef \
  -H "Authorization: Bearer <token>"
```

## Error Handling

### API Errors

```typescript
if (response.status !== 'success') {
  this.logger.warn('CodeChef API returned non-success status');
  return [];
}
```

### Network Errors

Handled by `BasePlatformAdapter` with automatic retry (3 attempts).

## Testing

```typescript
describe('CodeChefAdapter', () => {
  let adapter: CodeChefAdapter;

  beforeEach(() => {
    adapter = new CodeChefAdapter();
  });

  it('should detect STARTERS contest type', () => {
    const contest = {
      contest_code: 'START120',
      contest_name: 'Starters 120',
      contest_start_date_iso: '2024-02-15T14:30:00+05:30',
      contest_end_date_iso: '2024-02-15T16:30:00+05:30',
      contest_duration: '120',
      distinct_users: 1500,
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.type).toBe(ContestType.STARTERS);
    expect(result.difficulty).toBe(DifficultyLevel.BEGINNER);
  });

  it('should detect LONG contest type', () => {
    const contest = {
      contest_code: 'LONG2024',
      contest_name: 'February Long Challenge 2024',
      contest_start_date_iso: '2024-02-01T15:00:00+05:30',
      contest_end_date_iso: '2024-02-11T15:00:00+05:30',
      contest_duration: '14400',
      distinct_users: 5000,
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.type).toBe(ContestType.LONG);
    expect(result.difficulty).toBe(DifficultyLevel.HARD);
  });

  it('should limit past contests', async () => {
    // Mock response with many past contests
    const contests = await adapter.fetchContests();
    const pastContests = contests.filter(c => c.phase === ContestPhase.FINISHED);
    expect(pastContests.length).toBeLessThanOrEqual(20);
  });
});
```

## Configuration

### Environment Variables

```bash
# CodeChef API URL (optional, uses default)
CODECHEF_API_URL=https://www.codechef.com/api/list/contests/all

# Timeout in milliseconds
CODECHEF_TIMEOUT=15000

# Enable/disable adapter
CODECHEF_ENABLED=true

# Past contest limit
CODECHEF_PAST_LIMIT=20
```

## Rate Limiting

CodeChef API considerations:
- **Limit**: Not publicly documented
- **Handling**: Built-in retry with exponential backoff
- **Recommendation**: Sync every 6 hours (scheduled)

## Best Practices

### ✅ Do

1. **Limit past contests** - Only fetch recent ones (20)
2. **Check contest categories** - Process present, future, past separately
3. **Map difficulty** - Use type-based difficulty mapping
4. **Track participants** - Store `distinct_users` count
5. **Use contest codes** - More stable than names

### ❌ Don't

1. **Don't fetch all past contests** - Too much data
2. **Don't ignore status** - Check `status === "success"`
3. **Don't hardcode types** - Use detection logic
4. **Don't sync continuously** - Use scheduled jobs (6 hours)
5. **Don't skip validation** - Verify ISO date formats

## Contest Schedule

### Starters
- **Frequency**: Weekly (Wednesday)
- **Duration**: 2 hours
- **Difficulty**: Beginner-friendly

### Lunchtime
- **Frequency**: Monthly
- **Duration**: 3 hours
- **Difficulty**: Medium

### Cook-Off
- **Frequency**: Monthly
- **Duration**: 2.5 hours
- **Difficulty**: Medium

### Long Challenge
- **Frequency**: Monthly
- **Duration**: 10 days
- **Difficulty**: Hard

## Monitoring

### Health Check

```bash
curl http://localhost:3000/contests/health
```

### Sync Logs

```
[CodeChefAdapter] Fetching contests from CodeChef API
[CodeChefAdapter] Successfully fetched 35 contests from CodeChef
[ContestsService] Syncing codechef: 3 new, 5 updated, 0 failed
```

## Related Documentation

- [Base Adapter](/server/adapters/base)
- [Platform Interface](/server/adapters#platform-interface)
- [Contest Schema](/server/database/contest)
- [Sync Endpoints](/api/contests/sync)
