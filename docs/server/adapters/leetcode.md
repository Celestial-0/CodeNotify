# LeetCode Adapter

Platform adapter for fetching contest data from LeetCode GraphQL API.

## Overview

The LeetCode adapter integrates with LeetCode's GraphQL API to fetch Weekly and Biweekly contest information.

## Status

✅ **Enabled** - Fully implemented and active

## API Details

| Property | Value |
|----------|-------|
| **API Type** | GraphQL |
| **Endpoint** | `https://leetcode.com/graphql` |
| **Method** | POST |
| **Authentication** | None (public API) |
| **Timeout** | 15000ms |
| **Retry Attempts** | 3 |

## Location

```
Server/src/integrations/platforms/leetcode/leetcode.adapter.ts
```

## Implementation

```typescript
@Injectable()
export class LeetCodeAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.LEETCODE;
  private readonly graphqlEndpoint = PLATFORM_URLS.LEETCODE;

  constructor() {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: PLATFORM_URLS.LEETCODE,
      timeout: PLATFORM_TIMEOUTS.LEETCODE,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }
}
```

## GraphQL Schema

### Query

```graphql
query allContests {
  allContests {
    title
    titleSlug
    startTime
    duration
    originStartTime
    isVirtual
    cardImg
    description
  }
}
```

### Response Type

```typescript
interface LeetCodeContest {
  title: string;              // Contest title
  titleSlug: string;          // URL-friendly slug
  startTime: number;          // Unix timestamp
  duration: number;           // Duration in seconds
  originStartTime: number;    // Original start time
  isVirtual: boolean;         // Is virtual contest
  cardImg?: string;           // Contest image URL
  description?: string;       // Contest description
}

interface LeetCodeGraphQLResponse {
  data: {
    allContests?: LeetCodeContest[];
    topTwoContests?: LeetCodeContest[];
  };
}
```

## Contest Types

| Type | Description | Schedule |
|------|-------------|----------|
| `WEEKLY` | Weekly Contest | Sunday 2:30 AM UTC |
| `BIWEEKLY` | Biweekly Contest | Saturday 2:30 AM UTC |

**Type Detection:**
```typescript
let type: ContestType = ContestType.WEEKLY;
if (lcContest.title.toLowerCase().includes('biweekly')) {
  type = ContestType.BIWEEKLY;
} else if (lcContest.title.toLowerCase().includes('weekly')) {
  type = ContestType.WEEKLY;
}
```

## Methods

### fetchContests()

Fetch all contests from LeetCode GraphQL API.

```typescript
async fetchContests(): Promise<ContestData[]>
```

**Process:**
1. Construct GraphQL query
2. Make POST request with query
3. Validate response data
4. Transform each contest to internal format
5. Return array of ContestData

**Example Response:**
```json
{
  "data": {
    "allContests": [
      {
        "title": "Weekly Contest 380",
        "titleSlug": "weekly-contest-380",
        "startTime": 1707998400,
        "duration": 5400,
        "originStartTime": 1707998400,
        "isVirtual": false,
        "cardImg": "https://assets.leetcode.com/contest/weekly-380.png",
        "description": "Weekly Contest 380"
      }
    ]
  }
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

Transform LeetCode contest to unified format.

```typescript
transformToInternalFormat(lcContest: LeetCodeContest): ContestData
```

**Transformation Logic:**

```typescript
{
  platformId: lcContest.titleSlug,
  platform: ContestPlatform.LEETCODE,
  name: lcContest.title,
  type: this.detectType(lcContest.title),
  phase: this.determinePhase(startTime, endTime),
  startTime: new Date(lcContest.startTime * 1000),
  endTime: new Date((lcContest.startTime + lcContest.duration) * 1000),
  durationMinutes: Math.floor(lcContest.duration / 60),
  description: lcContest.description,
  websiteUrl: `https://leetcode.com/contest/${lcContest.titleSlug}`,
  isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
  platformMetadata: {
    titleSlug: lcContest.titleSlug,
    isVirtual: lcContest.isVirtual,
    cardImg: lcContest.cardImg,
    originStartTime: lcContest.originStartTime,
  },
  lastSyncedAt: new Date(),
}
```

### makeGraphQLRequest()

Custom GraphQL request handler with retry logic.

```typescript
private async makeGraphQLRequest<T>(query: string): Promise<T>
```

**Features:**
- POST request with GraphQL query
- Custom headers (Content-Type, Origin, Referer)
- Timeout handling with AbortController
- Automatic retry on failure
- Error logging

**Headers:**
```typescript
{
  'Content-Type': 'application/json',
  'User-Agent': 'CodeNotify/1.0',
  'Origin': 'https://leetcode.com',
  'Referer': 'https://leetcode.com/contest/',
}
```

## Platform Metadata

LeetCode-specific metadata stored in `platformMetadata`:

```typescript
{
  titleSlug: string;        // URL slug
  isVirtual: boolean;       // Virtual contest flag
  cardImg: string;          // Contest image URL
  originStartTime: number;  // Original start timestamp
}
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

## Example Usage

### Sync LeetCode Contests

```bash
# Manual sync (admin only)
curl -X POST http://localhost:3000/contests/sync/leetcode \
  -H "Authorization: Bearer <admin_token>"
```

### Get LeetCode Contests

```bash
# Get all LeetCode contests
curl http://localhost:3000/contests/platform/leetcode \
  -H "Authorization: Bearer <token>"
```

### GraphQL Query Example

```bash
curl -X POST https://leetcode.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { allContests { title titleSlug startTime duration } }"
  }'
```

## Error Handling

### GraphQL Errors

```typescript
if (!response.data?.allContests) {
  this.logger.warn('No contests found in LeetCode response');
  return [];
}
```

### Network Errors

Handled by custom `makeGraphQLRequest()` with automatic retry (3 attempts).

### Timeout

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(
  () => controller.abort(),
  this.config.timeout
);

// ... fetch with signal
if (error.name === 'AbortError') {
  throw new Error('LeetCode GraphQL request timed out');
}
```

## Testing

```typescript
describe('LeetCodeAdapter', () => {
  let adapter: LeetCodeAdapter;

  beforeEach(() => {
    adapter = new LeetCodeAdapter();
  });

  it('should fetch contests via GraphQL', async () => {
    const contests = await adapter.fetchContests();
    expect(contests).toBeDefined();
    expect(Array.isArray(contests)).toBe(true);
  });

  it('should detect contest type from title', () => {
    const weeklyContest = {
      title: 'Weekly Contest 380',
      titleSlug: 'weekly-contest-380',
      startTime: 1707998400,
      duration: 5400,
      originStartTime: 1707998400,
      isVirtual: false,
    };

    const result = adapter.transformToInternalFormat(weeklyContest);
    expect(result.type).toBe(ContestType.WEEKLY);
  });

  it('should handle biweekly contests', () => {
    const biweeklyContest = {
      title: 'Biweekly Contest 120',
      titleSlug: 'biweekly-contest-120',
      startTime: 1707998400,
      duration: 5400,
      originStartTime: 1707998400,
      isVirtual: false,
    };

    const result = adapter.transformToInternalFormat(biweeklyContest);
    expect(result.type).toBe(ContestType.BIWEEKLY);
  });

  it('should include platform metadata', () => {
    const contest = {
      title: 'Weekly Contest 380',
      titleSlug: 'weekly-contest-380',
      startTime: 1707998400,
      duration: 5400,
      originStartTime: 1707998400,
      isVirtual: false,
      cardImg: 'https://assets.leetcode.com/contest.png',
    };

    const result = adapter.transformToInternalFormat(contest);
    expect(result.platformMetadata).toEqual({
      titleSlug: 'weekly-contest-380',
      isVirtual: false,
      cardImg: 'https://assets.leetcode.com/contest.png',
      originStartTime: 1707998400,
    });
  });
});
```

## Configuration

### Environment Variables

```bash
# LeetCode GraphQL URL (optional, uses default)
LEETCODE_API_URL=https://leetcode.com/graphql

# Timeout in milliseconds
LEETCODE_TIMEOUT=15000

# Enable/disable adapter
LEETCODE_ENABLED=true
```

## Rate Limiting

LeetCode GraphQL API considerations:
- **Limit**: Not publicly documented
- **Handling**: Built-in retry with exponential backoff
- **Recommendation**: Sync every 6 hours (scheduled)
- **Headers**: Include Origin and Referer for better reliability

## Best Practices

### ✅ Do

1. **Use GraphQL queries** - More efficient than REST
2. **Include proper headers** - Origin, Referer, Content-Type
3. **Handle virtual contests** - Check `isVirtual` flag
4. **Use titleSlug as ID** - More stable than numeric IDs
5. **Cache contest images** - Store `cardImg` URLs
6. **Respect API limits** - Don't query too frequently

### ❌ Don't

1. **Don't skip headers** - May cause request failures
2. **Don't ignore isVirtual** - Virtual contests have different rules
3. **Don't hardcode queries** - Use constants or variables
4. **Don't sync continuously** - Use scheduled jobs (6 hours)
5. **Don't ignore timeout** - GraphQL can be slow

## Contest Schedule

### Weekly Contest
- **Day**: Sunday
- **Time**: 2:30 AM UTC
- **Duration**: 90 minutes (5400 seconds)
- **Problems**: 4 problems

### Biweekly Contest
- **Day**: Saturday (every 2 weeks)
- **Time**: 2:30 AM UTC
- **Duration**: 90 minutes (5400 seconds)
- **Problems**: 4 problems

## Monitoring

### Health Check

```bash
curl http://localhost:3000/contests/health
```

### Sync Logs

```
[LeetCodeAdapter] Fetching contests from LeetCode GraphQL API
[LeetCodeAdapter] Successfully fetched 45 contests from LeetCode
[ContestsService] Syncing leetcode: 2 new, 8 updated, 0 failed
```

## Troubleshooting

### GraphQL Request Fails

**Symptoms:** Timeout or 403 errors

**Solutions:**
1. Check headers (Origin, Referer)
2. Verify network connectivity
3. Check LeetCode API status
4. Increase timeout if needed

### No Contests Returned

**Symptoms:** Empty array response

**Solutions:**
1. Verify GraphQL query syntax
2. Check response structure
3. Log raw response for debugging
4. Verify API endpoint URL

## Related Documentation

- [Base Adapter](/server/adapters/base)
- [Platform Interface](/server/adapters#platform-interface)
- [Contest Schema](/server/database/contest)
- [Sync Endpoints](/api/contests/sync)
- [LeetCode API](https://leetcode.com/graphql)
