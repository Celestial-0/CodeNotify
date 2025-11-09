# Platform Integrations

Multi-platform contest aggregation using the Adapter pattern.

## Supported Platforms

| Platform | Status | API Type | Sync Interval |
|----------|--------|----------|---------------|
| **Codeforces** | ✅ Active | REST | Every 6 hours |
| **LeetCode** | ✅ Active | GraphQL | Every 6 hours |
| **CodeChef** | ✅ Active | REST | Every 6 hours |
| **AtCoder** | ✅ Active | REST | Every 6 hours |

## Adapter Pattern

### Interface

```typescript
interface PlatformAdapter {
  platformName: string;
  enabled: boolean;
  fetchContests(): Promise<ContestData[]>;
  fetchUpcomingContests(): Promise<ContestData[]>;
  fetchRunningContests(): Promise<ContestData[]>;
  healthCheck(): Promise<boolean>;
}
```

### Base Implementation

```typescript
abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract platformName: string;
  abstract enabled: boolean;
  
  protected async makeRequest(url: string): Promise<any> {
    // Retry logic, timeout, error handling
  }
  
  protected abstract transformToInternalFormat(data: any): ContestData[];
}
```

## Platform Details

### 1. Codeforces

**API**: `https://codeforces.com/api/contest.list`

**Features**:
- Div1, Div2, Div3 contests
- Educational rounds
- Global rounds
- ICPC-style contests

**Contest Types**:
- `CF` - Codeforces Round
- `IOI` - IOI-style
- `ICPC` - ICPC-style

**Phases**:
- `BEFORE` - Not started
- `CODING` - In progress
- `PENDING_SYSTEM_TEST` - Testing
- `SYSTEM_TEST` - System testing
- `FINISHED` - Completed

**Metadata**:
```typescript
{
  frozen: boolean,
  relativeTimeSeconds: number
}
```

### 2. LeetCode

**API**: `https://leetcode.com/graphql`

**Features**:
- Weekly contests (Sunday 2:30 AM UTC)
- Biweekly contests (Saturday 2:30 AM UTC)
- Virtual contests

**Contest Types**:
- `WEEKLY` - Weekly Contest
- `BIWEEKLY` - Biweekly Contest

**Phases**:
- `UPCOMING` - Not started
- `RUNNING` - In progress
- `ENDED` - Completed

**Metadata**:
```typescript
{
  titleSlug: string,
  isVirtual: boolean,
  cardImg: string,
  originStartTime: number
}
```

**GraphQL Query**:
```graphql
query {
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

### 3. CodeChef

**API**: `https://www.codechef.com/api/list/contests/all`

**Features**:
- Long Challenge (10 days)
- Cook-Off (2.5 hours)
- Lunchtime (3 hours)
- Starters (2 hours)

**Contest Types**:
- `LONG` - Long Challenge
- `COOK_OFF` - Cook-Off
- `LUNCH_TIME` - Lunchtime
- `STARTERS` - Starters

**Phases**:
- `NOT_STARTED` - Not started
- `STARTED` - In progress
- `COMPLETED` - Finished

**Difficulty Mapping**:
- STARTERS → BEGINNER
- LUNCH_TIME → MEDIUM
- COOK_OFF → MEDIUM
- LONG → HARD

### 4. AtCoder

**API**: `https://kenkoooo.com/atcoder/resources/contests.json`

**Features**:
- ABC (Beginner Contest)
- ARC (Regular Contest)
- AGC (Grand Contest)
- AHC (Heuristic Contest)

**Contest Types**:
- `ABC` - Beginner Contest
- `ARC` - Regular Contest
- `AGC` - Grand Contest
- `AHC` - Heuristic Contest

**Difficulty Mapping**:
- ABC → BEGINNER
- ARC → MEDIUM
- AGC → EXPERT
- AHC → HARD

**Metadata**:
```typescript
{
  rate_change: string
}
```

## Data Transformation

### Unified Format

```typescript
interface ContestData {
  platformId: string;
  name: string;
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  phase: string;
  type: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  difficulty?: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  participantCount?: number;
  problemCount?: number;
  platformMetadata: object;
}
```

### Example Transformation

```typescript
// Codeforces API response
{
  id: 1234,
  name: "Codeforces Round #900 (Div. 2)",
  type: "CF",
  phase: "BEFORE",
  startTimeSeconds: 1707998400,
  durationSeconds: 7200
}

// Transformed to internal format
{
  platformId: "1234",
  name: "Codeforces Round #900 (Div. 2)",
  platform: "codeforces",
  phase: "BEFORE",
  type: "CF",
  startTime: new Date(1707998400 * 1000),
  endTime: new Date((1707998400 + 7200) * 1000),
  durationMinutes: 120,
  websiteUrl: "https://codeforces.com/contest/1234",
  difficulty: "MEDIUM",
  platformMetadata: { frozen: false }
}
```

## Synchronization

### Automatic Sync

**Schedule**: Every 6 hours (configurable)

```typescript
@Cron(CronExpression.EVERY_6_HOURS)
async syncAllPlatforms() {
  const adapters = this.platformAdapters.values();
  
  for (const adapter of adapters) {
    if (!adapter.enabled) continue;
    
    try {
      const contests = await adapter.fetchContests();
      await this.upsertContests(contests);
    } catch (error) {
      this.logger.error(`Sync failed for ${adapter.platformName}`);
    }
  }
}
```

### Manual Sync

**Admin Only**:
```bash
# Sync specific platform
curl -X POST http://localhost:3000/contests/sync/codeforces \
  -H "Authorization: Bearer <admin_token>"

# Sync all platforms
curl -X POST http://localhost:3000/contests/sync/all \
  -H "Authorization: Bearer <admin_token>"
```

### Upsert Logic

```typescript
async upsertContests(contests: ContestData[]) {
  for (const contest of contests) {
    await Contest.findOneAndUpdate(
      { platformId: contest.platformId, platform: contest.platform },
      { $set: contest },
      { upsert: true, new: true }
    );
  }
}
```

## Error Handling

### Retry Logic

```typescript
async makeRequest(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 15000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await this.sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### Health Checks

```typescript
async healthCheck(): Promise<boolean> {
  try {
    await this.makeRequest(this.apiUrl);
    return true;
  } catch (error) {
    this.logger.error(`Health check failed: ${error.message}`);
    return false;
  }
}
```

## Adding New Platforms

### 1. Create Adapter

```typescript
@Injectable()
export class NewPlatformAdapter extends BasePlatformAdapter {
  platformName = 'newplatform';
  enabled = true;
  
  async fetchContests(): Promise<ContestData[]> {
    const data = await this.makeRequest('https://api.newplatform.com/contests');
    return this.transformToInternalFormat(data);
  }
  
  protected transformToInternalFormat(data: any): ContestData[] {
    return data.contests.map(contest => ({
      platformId: contest.id,
      name: contest.title,
      platform: 'newplatform',
      // ... map other fields
    }));
  }
}
```

### 2. Register in Module

```typescript
@Module({
  providers: [
    {
      provide: PLATFORM_ADAPTERS,
      useFactory: () => [
        new CodeforcesAdapter(),
        new LeetCodeAdapter(),
        new CodeChefAdapter(),
        new AtCoderAdapter(),
        new NewPlatformAdapter(), // Add here
      ],
    },
  ],
})
export class PlatformsModule {}
```

### 3. Update Schema

```typescript
export enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
  NEWPLATFORM = 'newplatform', // Add here
}
```

## Configuration

### Enable/Disable Platforms

```bash
CODEFORCES_ENABLED=true
LEETCODE_ENABLED=true
CODECHEF_ENABLED=true
ATCODER_ENABLED=true
```

### Sync Configuration

```bash
# Sync interval (cron expression)
CONTEST_SYNC_INTERVAL=0 */6 * * *

# Request timeout (milliseconds)
PLATFORM_TIMEOUT=15000

# Retry attempts
PLATFORM_RETRY_ATTEMPTS=3
```

## Monitoring

### Sync Logs

```
[ContestScheduler] Starting scheduled contest sync
[ContestsService] Syncing codeforces: 5 new, 12 updated, 0 failed
[ContestsService] Syncing leetcode: 2 new, 8 updated, 0 failed
[ContestsService] Syncing codechef: 3 new, 5 updated, 0 failed
[ContestsService] Syncing atcoder: 4 new, 6 updated, 0 failed
[ContestScheduler] Sync completed: 14 new, 31 updated, 0 failed
```

### Health Status

```bash
# Check platform health
curl http://localhost:3000/contests/platform/codeforces
```

## Best Practices

### ✅ Do

1. **Implement retry logic** for API failures
2. **Use timeouts** to prevent hanging
3. **Log all operations** for debugging
4. **Handle rate limits** gracefully
5. **Validate data** before storing
6. **Use unique constraints** (platformId + platform)

### ❌ Don't

1. **Don't sync too frequently** (respect rate limits)
2. **Don't ignore errors** silently
3. **Don't block** on failed platforms
4. **Don't store invalid** data
5. **Don't hardcode** API URLs

## Related Documentation

- [Contests Module](/server/modules/contests)
- [Contest Schema](/server/database#contest-schema)
- [Sync Endpoints](/api/contests/sync)
