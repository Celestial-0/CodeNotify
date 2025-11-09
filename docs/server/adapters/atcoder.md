# AtCoder Adapter

Platform adapter for fetching contest data from AtCoder Problems API (community-maintained).

## Overview

The AtCoder adapter integrates with the community-maintained AtCoder Problems API to fetch contest information including ABC, ARC, AGC, and AHC contests.

## Status

✅ **Enabled** - Fully implemented and active

## API Details

| Property | Value |
|----------|-------|
| **API Type** | REST API (Community) |
| **Endpoint** | `https://kenkoooo.com/atcoder/resources/contests.json` |
| **Method** | GET |
| **Authentication** | None (public API) |
| **Timeout** | 15000ms |
| **Retry Attempts** | 3 |

## Location

```
Server/src/integrations/platforms/atcoder/atcoder.adapter.ts
```

## Implementation

```typescript
@Injectable()
export class AtCoderAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.ATCODER;
  private readonly apiEndpoint = PLATFORM_URLS.ATCODER;

  constructor() {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: PLATFORM_URLS.ATCODER,
      timeout: PLATFORM_TIMEOUTS.ATCODER,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }
}
```

## API Response Format

### AtCoder Contest Object

```typescript
interface AtCoderContest {
  id: string;                  // Contest ID (e.g., "abc340")
  start_epoch_second: number;  // Unix timestamp
  duration_second: number;     // Duration in seconds
  title: string;               // Contest title
  rate_change: string;         // Rating range (e.g., "All", "1200 - 1999")
}
```

### API Response

Returns a JSON array of contests:

```json
[
  {
    "id": "abc340",
    "start_epoch_second": 1707998400,
    "duration_second": 6000,
    "title": "AtCoder Beginner Contest 340",
    "rate_change": "All"
  }
]
```

## Contest Types

| Type | Description | Difficulty | Rating Range |
|------|-------------|------------|--------------|
| `ABC` | Beginner Contest | BEGINNER | All |
| `ARC` | Regular Contest | MEDIUM | 1200-1999 |
| `AGC` | Grand Contest | EXPERT | 1200+ |
| `AHC` | Heuristic Contest | HARD | All |

## Type Detection

```typescript
const title = contest.title.toUpperCase();

if (title.includes('ABC') || title.includes('BEGINNER')) {
  type = ContestType.ABC;
} else if (title.includes('ARC') || title.includes('REGULAR')) {
  type = ContestType.ARC;
} else if (title.includes('AGC') || title.includes('GRAND')) {
  type = ContestType.AGC;
} else if (title.includes('AHC') || title.includes('HEURISTIC')) {
  type = ContestType.AHC;
}
```

## Methods

### fetchContests()

Fetch contests from AtCoder Problems API (filtered to last 30 days + future).

```typescript
async fetchContests(): Promise<ContestData[]>
```

**Process:**
1. Make GET request to community API
2. Validate response is array
3. Filter to last 30 days + future contests
4. Transform each contest to internal format
5. Return filtered array

**Time Filtering:**
```typescript
const thirtyDaysAgo = Date.now() / 1000 - (30 * 24 * 60 * 60);
const recentContests = contests.filter(
  contest => contest.start_epoch_second >= thirtyDaysAgo
);
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

Transform AtCoder contest to unified format.

```typescript
transformToInternalFormat(acContest: any): ContestData
```

**Transformation Logic:**

```typescript
{
  platformId: contest.id,
  platform: ContestPlatform.ATCODER,
  name: contest.title,
  type: this.detectType(contest.title),
  phase: this.determinePhase(startTime, endTime),
  startTime: new Date(contest.start_epoch_second * 1000),
  endTime: new Date((contest.start_epoch_second + contest.duration_second) * 1000),
  durationMinutes: Math.floor(contest.duration_second / 60),
  websiteUrl: `https://atcoder.jp/contests/${contest.id}`,
  difficulty: this.mapDifficulty(type),
  isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
  platformMetadata: {
    rate_change: contest.rate_change,
    contest_id: contest.id,
  },
  lastSyncedAt: new Date(),
}
```

## Platform Metadata

AtCoder-specific metadata stored in `platformMetadata`:

```typescript
{
  rate_change: string;    // Rating range affected
  contest_id: string;     // Contest ID
}
```

## Difficulty Mapping

```typescript
const difficultyMap = {
  [ContestType.ABC]: DifficultyLevel.BEGINNER,
  [ContestType.ARC]: DifficultyLevel.MEDIUM,
  [ContestType.AGC]: DifficultyLevel.EXPERT,
  [ContestType.AHC]: DifficultyLevel.HARD,
};
```

## Phase Determination

```typescript
const now = new Date();
let phase: ContestPhase;

if (startTime > now) {
  phase = ContestPhase.BEFORE;
} else if (endTime > now) {
  phase = ContestPhase.CODING;
} else {
  phase = ContestPhase.FINISHED;
}
```

## Time Filtering

Only contests from the last 30 days and future contests are fetched:

```typescript
const DAYS_FILTER = 30;
const thirtyDaysAgo = Date.now() / 1000 - (DAYS_FILTER * 24 * 60 * 60);
const recentContests = contests.filter(
  contest => contest.start_epoch_second >= thirtyDaysAgo
);
```

## Example Usage

### Sync AtCoder Contests

```bash
# Manual sync (admin only)
curl -X POST http://localhost:3000/contests/sync/atcoder \
  -H "Authorization: Bearer <admin_token>"
```

### Get AtCoder Contests

```bash
# Get all AtCoder contests
curl http://localhost:3000/contests/platform/atcoder \
  -H "Authorization: Bearer <token>"
```

## Error Handling

### API Errors

```typescript
if (!Array.isArray(contests)) {
  this.logger.warn('Invalid response from AtCoder API');
  return [];
}
```

### Network Errors

Handled by `BasePlatformAdapter` with automatic retry (3 attempts).

## Testing

```typescript
describe('AtCoderAdapter', () => {
  let adapter: AtCoderAdapter;

  beforeEach(() => {
    adapter = new AtCoderAdapter();
  });

  it('should detect ABC contest type', () => {
    const contest = {
      id: 'abc340',
      start_epoch_second: 1707998400,
      duration_second: 6000,
      title: 'AtCoder Beginner Contest 340',
      rate_change: 'All',
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.type).toBe(ContestType.ABC);
    expect(result.difficulty).toBe(DifficultyLevel.BEGINNER);
  });

  it('should detect AGC contest type', () => {
    const contest = {
      id: 'agc070',
      start_epoch_second: 1707998400,
      duration_second: 7200,
      title: 'AtCoder Grand Contest 070',
      rate_change: '1200+',
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.type).toBe(ContestType.AGC);
    expect(result.difficulty).toBe(DifficultyLevel.EXPERT);
  });

  it('should filter to recent contests', async () => {
    const contests = await adapter.fetchContests();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    contests.forEach(contest => {
      expect(contest.startTime.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo);
    });
  });

  it('should include rate_change metadata', () => {
    const contest = {
      id: 'arc170',
      start_epoch_second: 1707998400,
      duration_second: 7200,
      title: 'AtCoder Regular Contest 170',
      rate_change: '1200 - 1999',
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.platformMetadata).toEqual({
      rate_change: '1200 - 1999',
      contest_id: 'arc170',
    });
  });
});
```

## Configuration

### Environment Variables

```bash
# AtCoder API URL (community API)
ATCODER_API_URL=https://kenkoooo.com/atcoder/resources/contests.json

# Timeout in milliseconds
ATCODER_TIMEOUT=15000

# Enable/disable adapter
ATCODER_ENABLED=true

# Days to filter (past contests)
ATCODER_DAYS_FILTER=30
```

## Rate Limiting

AtCoder Problems API (community):
- **Limit**: Not strictly enforced
- **Handling**: Built-in retry with exponential backoff
- **Recommendation**: Sync every 6 hours (scheduled)
- **Note**: Community-maintained, may have downtime

## Best Practices

### ✅ Do

1. **Filter by time** - Only fetch recent + future contests
2. **Check rate_change** - Store rating range metadata
3. **Use contest IDs** - More stable than titles
4. **Handle API downtime** - Community API may be unavailable
5. **Map difficulty** - Use type-based difficulty mapping

### ❌ Don't

1. **Don't fetch all contests** - Too much historical data
2. **Don't ignore array validation** - API returns array directly
3. **Don't hardcode time filters** - Use constants
4. **Don't sync continuously** - Use scheduled jobs (6 hours)
5. **Don't rely solely on this API** - Have fallback plan

## Contest Schedule

### ABC (Beginner Contest)
- **Frequency**: Weekly (Saturday/Sunday)
- **Duration**: 100 minutes
- **Difficulty**: Beginner-friendly
- **Rating**: All

### ARC (Regular Contest)
- **Frequency**: Bi-weekly
- **Duration**: 120 minutes
- **Difficulty**: Medium
- **Rating**: 1200-1999

### AGC (Grand Contest)
- **Frequency**: Monthly
- **Duration**: 120-150 minutes
- **Difficulty**: Expert
- **Rating**: 1200+

### AHC (Heuristic Contest)
- **Frequency**: Occasional
- **Duration**: 4-10 hours
- **Difficulty**: Hard
- **Rating**: All

## API Notes

### Community API

The AtCoder Problems API is community-maintained by [kenkoooo](https://github.com/kenkoooo/AtCoderProblems):

- **Reliability**: Generally stable but not official
- **Updates**: Updated regularly
- **Data**: Comprehensive contest history
- **Alternatives**: Official AtCoder API (requires authentication)

### Official API

AtCoder has an official API but requires authentication:
- **URL**: `https://atcoder.jp/contests`
- **Auth**: Required
- **Use Case**: For official integrations

## Monitoring

### Health Check

```bash
curl http://localhost:3000/contests/health
```

### Sync Logs

```
[AtCoderAdapter] Fetching contests from AtCoder
[AtCoderAdapter] Successfully fetched 25 contests from AtCoder
[ContestsService] Syncing atcoder: 4 new, 6 updated, 0 failed
```

## Troubleshooting

### API Unavailable

**Symptoms:** Timeout or connection errors

**Solutions:**
1. Check community API status
2. Verify network connectivity
3. Consider fallback to cached data
4. Increase timeout if needed

### Invalid Response

**Symptoms:** Empty array or non-array response

**Solutions:**
1. Log raw response for debugging
2. Verify API endpoint URL
3. Check API documentation for changes
4. Implement response validation

## Related Documentation

- [Base Adapter](/server/adapters/base)
- [Platform Interface](/server/adapters#platform-interface)
- [Contest Schema](/server/database/contest)
- [Sync Endpoints](/api/contests/sync)
- [AtCoder Problems API](https://github.com/kenkoooo/AtCoderProblems)
