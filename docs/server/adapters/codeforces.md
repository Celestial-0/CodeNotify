# Codeforces Adapter

Platform adapter for fetching contest data from Codeforces REST API.

## Overview

The Codeforces adapter integrates with the official Codeforces API to fetch contest information including divisions, phases, and metadata.

## Status

✅ **Enabled** - Fully implemented and active

## API Details

| Property | Value |
|----------|-------|
| **API Type** | REST API |
| **Endpoint** | `https://codeforces.com/api/contest.list` |
| **Method** | GET |
| **Authentication** | None (public API) |
| **Timeout** | 15000ms |
| **Retry Attempts** | 3 |

## Location

```
Server/src/integrations/platforms/codeforces/codeforces.adapter.ts
```

## Implementation

```typescript
@Injectable()
export class CodeforcesAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.CODEFORCES;
  private readonly apiBaseUrl = PLATFORM_URLS.CODEFORCES;

  constructor(private readonly configService: ConfigService) {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: PLATFORM_URLS.CODEFORCES,
      timeout: PLATFORM_TIMEOUTS.CODEFORCES,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }
}
```

## API Response Format

### Codeforces Contest Object

```typescript
interface CodeforcesContest {
  id: number;                    // Contest ID
  name: string;                  // Contest name
  type: string;                  // CF, ICPC, IOI
  phase: string;                 // BEFORE, CODING, FINISHED, etc.
  frozen: boolean;               // Is scoreboard frozen
  durationSeconds: number;       // Contest duration
  startTimeSeconds?: number;     // Unix timestamp
  relativeTimeSeconds?: number;  // Relative time
}
```

### API Response

```typescript
interface CodeforcesApiResponse {
  status: string;                // "OK" or "FAILED"
  result: CodeforcesContest[];   // Array of contests
}
```

## Contest Types

| Type | Description | Example |
|------|-------------|---------|
| `CF` | Codeforces Round | Codeforces Round #900 (Div. 2) |
| `IOI` | IOI-style contest | IOI-style contest |
| `ICPC` | ICPC-style contest | ICPC Regional Contest |

## Contest Phases

| Phase | Description |
|-------|-------------|
| `BEFORE` | Contest not started |
| `CODING` | Contest in progress |
| `PENDING_SYSTEM_TEST` | Waiting for system testing |
| `SYSTEM_TEST` | System testing in progress |
| `FINISHED` | Contest completed |

## Methods

### fetchContests()

Fetch all contests from Codeforces API.

```typescript
async fetchContests(): Promise<ContestData[]>
```

**Process:**
1. Make GET request to `/api/contest.list`
2. Validate response status is "OK"
3. Transform each contest to internal format
4. Return array of ContestData

**Example Response:**
```json
{
  "status": "OK",
  "result": [
    {
      "id": 1900,
      "name": "Codeforces Round #900 (Div. 2)",
      "type": "CF",
      "phase": "BEFORE",
      "frozen": false,
      "durationSeconds": 7200,
      "startTimeSeconds": 1707998400
    }
  ]
}
```

### fetchUpcomingContests()

Fetch only upcoming contests (phase = BEFORE).

```typescript
async fetchUpcomingContests(): Promise<ContestData[]>
```

### fetchRunningContests()

Fetch only running contests (phase = CODING).

```typescript
async fetchRunningContests(): Promise<ContestData[]>
```

### transformToInternalFormat()

Transform Codeforces contest to unified format.

```typescript
transformToInternalFormat(cfContest: CodeforcesContest): ContestData
```

**Transformation Logic:**

```typescript
{
  platformId: cfContest.id.toString(),
  platform: ContestPlatform.CODEFORCES,
  name: cfContest.name,
  type: typeMap[cfContest.type] || ContestType.CF,
  phase: phaseMap[cfContest.phase] || ContestPhase.BEFORE,
  startTime: new Date(cfContest.startTimeSeconds * 1000),
  endTime: new Date((cfContest.startTimeSeconds + cfContest.durationSeconds) * 1000),
  durationMinutes: Math.floor(cfContest.durationSeconds / 60),
  isActive: cfContest.phase === 'BEFORE' || cfContest.phase === 'CODING',
  platformMetadata: {
    frozen: cfContest.frozen,
    relativeTimeSeconds: cfContest.relativeTimeSeconds,
  },
  lastSyncedAt: new Date(),
}
```

## Platform Metadata

Codeforces-specific metadata stored in `platformMetadata`:

```typescript
{
  frozen: boolean;              // Is scoreboard frozen
  relativeTimeSeconds: number;  // Time relative to now
}
```

## Phase Mapping

```typescript
const phaseMap: Record<string, ContestPhase> = {
  BEFORE: ContestPhase.BEFORE,
  CODING: ContestPhase.CODING,
  PENDING_SYSTEM_TEST: ContestPhase.PENDING_SYSTEM_TEST,
  SYSTEM_TEST: ContestPhase.SYSTEM_TEST,
  FINISHED: ContestPhase.FINISHED,
};
```

## Type Mapping

```typescript
const typeMap: Record<string, ContestType> = {
  CF: ContestType.CF,
  IOI: ContestType.IOI,
  ICPC: ContestType.ICPC,
};
```

## Example Usage

### Sync Codeforces Contests

```bash
# Manual sync (admin only)
curl -X POST http://localhost:3000/contests/sync/codeforces \
  -H "Authorization: Bearer <admin_token>"
```

### Get Codeforces Contests

```bash
# Get all Codeforces contests
curl http://localhost:3000/contests/platform/codeforces \
  -H "Authorization: Bearer <token>"
```

## Error Handling

### API Errors

```typescript
if (data.status !== 'OK') {
  throw new Error('Codeforces API returned error status');
}
```

### Network Errors

Handled by `BasePlatformAdapter` with automatic retry (3 attempts).

### Timeout

15-second timeout enforced using AbortController.

## Testing

```typescript
describe('CodeforcesAdapter', () => {
  let adapter: CodeforcesAdapter;

  beforeEach(() => {
    adapter = new CodeforcesAdapter(configService);
  });

  it('should fetch contests', async () => {
    const contests = await adapter.fetchContests();
    expect(contests).toBeDefined();
    expect(Array.isArray(contests)).toBe(true);
  });

  it('should transform contest correctly', () => {
    const cfContest = {
      id: 1900,
      name: 'Codeforces Round #900 (Div. 2)',
      type: 'CF',
      phase: 'BEFORE',
      frozen: false,
      durationSeconds: 7200,
      startTimeSeconds: 1707998400,
    };

    const result = adapter.transformToInternalFormat(cfContest);
    
    expect(result.platformId).toBe('1900');
    expect(result.platform).toBe(ContestPlatform.CODEFORCES);
    expect(result.type).toBe(ContestType.CF);
    expect(result.durationMinutes).toBe(120);
  });

  it('should filter upcoming contests', async () => {
    const contests = await adapter.fetchUpcomingContests();
    contests.forEach(contest => {
      expect(contest.startTime.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
```

## Configuration

### Environment Variables

```bash
# Codeforces API URL (optional, uses default)
CODEFORCES_API_URL=https://codeforces.com/api

# Timeout in milliseconds
CODEFORCES_TIMEOUT=15000

# Enable/disable adapter
CODEFORCES_ENABLED=true
```

## Rate Limiting

Codeforces API has rate limits:
- **Limit**: ~1 request per second
- **Handling**: Built-in retry with exponential backoff
- **Recommendation**: Sync every 6 hours (scheduled)

## Best Practices

### ✅ Do

1. **Respect rate limits** - Don't sync too frequently
2. **Handle frozen contests** - Check `frozen` metadata
3. **Validate phase** - Use phase mapping for consistency
4. **Log operations** - Track sync success/failure
5. **Cache results** - Store in MongoDB to reduce API calls

### ❌ Don't

1. **Don't ignore status** - Always check `status === "OK"`
2. **Don't sync continuously** - Use scheduled jobs (6 hours)
3. **Don't hardcode URLs** - Use constants
4. **Don't skip error handling** - API can fail
5. **Don't ignore phases** - Different phases need different handling

## Monitoring

### Health Check

```bash
curl http://localhost:3000/contests/health
```

### Sync Logs

```
[CodeforcesAdapter] Fetching contests from Codeforces API
[CodeforcesAdapter] Successfully fetched 150 contests from Codeforces
[ContestsService] Syncing codeforces: 5 new, 12 updated, 0 failed
```

## Related Documentation

- [Base Adapter](/server/adapters/base)
- [Platform Interface](/server/adapters#platform-interface)
- [Contest Schema](/server/database/contest)
- [Sync Endpoints](/api/contests/sync)
