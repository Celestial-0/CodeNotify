# Integrations Module

External service integrations for multi-platform contest data aggregation.

## Overview

The Integrations module is responsible for integrating with external competitive programming platforms and communication services. It serves as the bridge between CodeNotify and external APIs.

## Location

```
Server/src/integrations/
├── integrations.module.ts    # Main module configuration
├── platforms/                # Platform adapters for contest data
│   ├── platforms.module.ts
│   ├── base/
│   │   ├── platform.interface.ts
│   │   └── platform-adapter.abstract.ts
│   ├── codeforces/
│   │   ├── codeforces.adapter.ts
│   │   └── codeforces.module.ts
│   ├── leetcode/
│   │   ├── leetcode.adapter.ts
│   │   └── leetcode.module.ts
│   ├── codechef/
│   │   ├── codechef.adapter.ts
│   │   └── codechef.module.ts
│   └── atcoder/
│       ├── atcoder.adapter.ts
│       └── atcoder.module.ts
└── whatsapp/
    └── whatsapp.service.ts   # WhatsApp integration (stub)
```

## Module Structure

### IntegrationsModule

Main module that aggregates all integration services.

```typescript
@Module({
  providers: [WhatsappService],
  imports: [PlatformsModule],
  exports: [PlatformsModule],
})
export class IntegrationsModule {}
```

**Key Features:**
- Imports and exports `PlatformsModule` for contest data
- Provides `WhatsappService` for future WhatsApp integration
- Serves as the central integration hub

## Sub-Modules

### 1. PlatformsModule

Manages all competitive programming platform integrations.

**Purpose:** Fetch and synchronize contest data from multiple platforms

**Platforms Supported:**
- ✅ **Codeforces** - REST API integration
- ✅ **LeetCode** - GraphQL API integration
- ✅ **CodeChef** - REST API integration
- ✅ **AtCoder** - Community API integration

**Architecture:**
```
PlatformsModule
├── Platform Registry (Factory Provider)
├── CodeforcesModule → CodeforcesAdapter
├── LeetcodeModule → LeetCodeAdapter
├── CodechefModule → CodeChefAdapter
└── AtcoderModule → AtCoderAdapter
```

**Exports:**
- `PLATFORM_ADAPTERS_TOKEN` - Array of enabled platform adapters
- Individual platform modules

**Documentation:** See [Platform Adapters](/server/adapters) for detailed documentation.

### 2. WhatsappService

Stub service for future WhatsApp Business API integration.

**Location:** `server/src/integrations/whatsapp/whatsapp.service.ts`

**Current Implementation:**
```typescript
@Injectable()
export class WhatsappService {}
```

**Status:** 🚧 Stub implementation - Not yet functional

**Future Plans:**
- WhatsApp Business API integration
- Message template management
- Delivery status tracking
- Rate limiting and queue management

## Platform Adapters

### Adapter Pattern

All platform integrations follow the **Adapter Pattern** with a unified interface.

#### PlatformAdapter Interface

```typescript
interface PlatformAdapter {
  readonly platformName: ContestPlatform;
  fetchContests(): Promise<ContestData[]>;
  fetchUpcomingContests(): Promise<ContestData[]>;
  fetchRunningContests(): Promise<ContestData[]>;
  transformToInternalFormat(data: any): ContestData;
  healthCheck(): Promise<boolean>;
}
```

#### BasePlatformAdapter

Abstract base class providing common functionality:

```typescript
abstract class BasePlatformAdapter implements PlatformAdapter {
  protected readonly logger: Logger;
  
  constructor(public readonly config: PlatformConfig) {
    this.logger = new Logger(this.constructor.name);
  }
  
  // HTTP request handling with retry logic
  protected async makeRequest<T>(url: string, options?: RequestInit): Promise<T>
  
  // Utility methods
  protected sleep(ms: number): Promise<void>
  protected getErrorMessage(error: unknown): string
  protected unixToDate(timestamp: number): Date
  protected calculateDuration(startTime: Date, endTime: Date): number
  protected filterUpcoming(contests: ContestData[]): ContestData[]
  protected filterRunning(contests: ContestData[]): ContestData[]
  
  // Health check
  async healthCheck(): Promise<boolean>
}
```

**Features:**
- Automatic retry with exponential backoff
- Timeout handling with AbortController
- Error logging and tracking
- Common utility methods
- Health check implementation

### Platform Registry

Dynamic platform adapter registration using factory provider.

```typescript
@Module({
  imports: [
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
    AtcoderModule
  ],
  providers: [
    {
      provide: PLATFORM_ADAPTERS_TOKEN,
      useFactory: (
        codeforces: CodeforcesAdapter,
        leetcode: LeetCodeAdapter,
        codechef: CodeChefAdapter,
        atcoder: AtCoderAdapter,
      ): PlatformAdapter[] => {
        // Only return enabled adapters
        return [codeforces, leetcode, codechef, atcoder].filter(
          adapter => adapter.config.enabled
        );
      },
      inject: [
        CodeforcesAdapter,
        LeetCodeAdapter,
        CodeChefAdapter,
        AtCoderAdapter,
      ],
    },
  ],
  exports: [PLATFORM_ADAPTERS_TOKEN, /* ... */],
})
export class PlatformsModule {}
```

**Benefits:**
- Dynamic adapter injection
- Easy to add new platforms
- Automatic filtering of disabled adapters
- Type-safe adapter registry

### Unified Data Format

All adapters transform platform-specific data to a unified `ContestData` format:

```typescript
interface ContestData {
  platformId: string;           // Platform-specific ID
  name: string;                 // Contest name
  platform: ContestPlatform;    // Platform enum
  phase: ContestPhase;          // Contest phase
  type: ContestType;            // Contest type
  startTime: Date;              // Start time
  endTime: Date;                // End time
  durationMinutes: number;      // Duration in minutes
  description?: string;         // Optional description
  websiteUrl?: string;          // Contest URL
  registrationUrl?: string;     // Registration URL
  preparedBy?: string;          // Contest author
  difficulty?: DifficultyLevel; // Difficulty level
  participantCount?: number;    // Number of participants
  problemCount?: number;        // Number of problems
  country?: string;             // Country (if applicable)
  city?: string;                // City (if applicable)
  platformMetadata?: Record<string, any>; // Platform-specific data
  isActive?: boolean;           // Active status
  lastSyncedAt?: Date;          // Last sync timestamp
}
```

## Platform Implementations

### 1. Codeforces Adapter

**API Type:** REST API  
**Endpoint:** `https://codeforces.com/api/contest.list`  
**Status:** ✅ Enabled  
**Timeout:** 15000ms  

**Features:**
- Fetches all contests from Codeforces API
- Supports 5 contest phases (BEFORE, CODING, PENDING_SYSTEM_TEST, SYSTEM_TEST, FINISHED)
- 3 contest types (CF, IOI, ICPC)
- Tracks frozen scoreboard status

**Documentation:** [Codeforces Adapter](/server/adapters/codeforces)

### 2. LeetCode Adapter

**API Type:** GraphQL  
**Endpoint:** `https://leetcode.com/graphql`  
**Status:** ✅ Enabled  
**Timeout:** 15000ms  

**Features:**
- GraphQL query for contest data
- Detects Weekly and Biweekly contests
- Custom GraphQL request handler
- Includes contest images and descriptions

**Documentation:** [LeetCode Adapter](/server/adapters/leetcode)

### 3. CodeChef Adapter

**API Type:** REST API  
**Endpoint:** `https://www.codechef.com/api/list/contests/all`  
**Status:** ✅ Enabled  
**Timeout:** 15000ms  

**Features:**
- Fetches present, future, and past contests
- 4 contest types (STARTERS, LUNCH_TIME, COOK_OFF, LONG)
- Difficulty mapping based on type
- Limits past contests to 20 most recent

**Documentation:** [CodeChef Adapter](/server/adapters/codechef)

### 4. AtCoder Adapter

**API Type:** REST API (Community)  
**Endpoint:** `https://kenkoooo.com/atcoder/resources/contests.json`  
**Status:** ✅ Enabled  
**Timeout:** 15000ms  

**Features:**
- Uses community-maintained AtCoder Problems API
- 4 contest types (ABC, ARC, AGC, AHC)
- Filters to last 30 days + future contests
- Rate change metadata tracking

**Documentation:** [AtCoder Adapter](/server/adapters/atcoder)

## Integration with ContestsService

The Integrations module is consumed by the `ContestsService` for contest synchronization.

### Dependency Injection

```typescript
@Injectable()
export class ContestsService {
  private platformAdapters: Map<ContestPlatform, PlatformAdapter> = new Map();

  constructor(
    @Inject(PLATFORM_ADAPTERS_TOKEN)
    private readonly adapters: PlatformAdapter[],
  ) {
    // Build adapter registry
    this.adapters.forEach(adapter => {
      this.platformAdapters.set(adapter.platformName, adapter);
    });
  }
}
```

### Sync Operations

**Sync Single Platform:**
```typescript
async syncPlatform(platform: ContestPlatform): Promise<PlatformSyncResult> {
  const adapter = this.platformAdapters.get(platform);
  if (!adapter) {
    throw new Error(`Platform ${platform} not found`);
  }
  
  const contests = await adapter.fetchContests();
  // Upsert contests to database
  // Return sync results
}
```

**Sync All Platforms:**
```typescript
async syncAllPlatforms(): Promise<PlatformSyncResult[]> {
  const results = await Promise.allSettled(
    Array.from(this.platformAdapters.keys()).map(platform =>
      this.syncPlatform(platform)
    )
  );
  return results;
}
```

## Configuration

### Platform Configuration

Each adapter is configured via `PlatformConfig`:

```typescript
interface PlatformConfig {
  enabled: boolean;           // Enable/disable adapter
  apiUrl: string;            // Base API URL
  timeout: number;           // Request timeout (ms)
  retryAttempts?: number;    // Max retry attempts (default: 3)
  retryDelay?: number;       // Retry delay (ms, default: 1000)
}
```

### Environment Variables

```bash
# Codeforces
CODEFORCES_API_URL=https://codeforces.com/api
CODEFORCES_TIMEOUT=15000
CODEFORCES_ENABLED=true

# LeetCode
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_TIMEOUT=15000
LEETCODE_ENABLED=true

# CodeChef
CODECHEF_API_URL=https://www.codechef.com/api/list/contests/all
CODECHEF_TIMEOUT=15000
CODECHEF_ENABLED=true

# AtCoder
ATCODER_API_URL=https://kenkoooo.com/atcoder/resources/contests.json
ATCODER_TIMEOUT=15000
ATCODER_ENABLED=true
ATCODER_DAYS_FILTER=30

# WhatsApp (Future)
WHATSAPP_API_KEY=your-api-key
WHATSAPP_PHONE_NUMBER=+1234567890
```

## Error Handling

### Retry Logic

All adapters implement automatic retry with exponential backoff:

```typescript
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (attempt === maxAttempts) throw error;
    await this.sleep(retryDelay * attempt); // Exponential backoff
  }
}
```

### Timeout Handling

Requests are aborted if they exceed the configured timeout:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(
  () => controller.abort(),
  this.config.timeout
);

const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);
```

### Error Logging

All errors are logged with context:

```typescript
this.logger.error(
  `Failed to fetch contests from ${this.platformName}: ${error.message}`
);
```

## Health Checks

### Individual Adapter Health

```typescript
async healthCheck(): Promise<boolean> {
  try {
    await this.makeRequest(this.config.apiUrl);
    return true;
  } catch (error) {
    this.logger.error(`Health check failed: ${error.message}`);
    return false;
  }
}
```

### All Platforms Health

```bash
# Check health of all platforms
GET /contests/health

Response:
{
  "codeforces": { "status": "healthy", "enabled": true },
  "leetcode": { "status": "healthy", "enabled": true },
  "codechef": { "status": "healthy", "enabled": true },
  "atcoder": { "status": "healthy", "enabled": true }
}
```

## Scheduled Synchronization

Contests are automatically synchronized every 6 hours via the scheduler:

```typescript
@Cron('0 */6 * * *') // Every 6 hours
async handleContestSync() {
  this.logger.log('Starting scheduled contest sync');
  
  for (const [platform, adapter] of this.platformAdapters) {
    try {
      await this.syncPlatform(platform);
      this.logger.log(`Successfully synced ${platform}`);
    } catch (error) {
      this.logger.error(`Failed to sync ${platform}: ${error.message}`);
    }
  }
}
```

## Adding a New Platform

### Step 1: Create Adapter

```typescript
// src/integrations/platforms/newplatform/newplatform.adapter.ts
@Injectable()
export class NewPlatformAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.NEWPLATFORM;
  
  constructor() {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: 'https://api.newplatform.com',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
    };
    super(config);
  }
  
  async fetchContests(): Promise<ContestData[]> {
    const response = await this.makeRequest<ApiResponse>(
      `${this.config.apiUrl}/contests`
    );
    return response.contests.map(c => this.transformToInternalFormat(c));
  }
  
  async fetchUpcomingContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterUpcoming(contests);
  }
  
  async fetchRunningContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterRunning(contests);
  }
  
  transformToInternalFormat(data: any): ContestData {
    return {
      platformId: data.id,
      name: data.name,
      platform: ContestPlatform.NEWPLATFORM,
      phase: this.determinePhase(data),
      type: data.type,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      durationMinutes: this.calculateDuration(
        new Date(data.startTime),
        new Date(data.endTime)
      ),
      isActive: true,
      lastSyncedAt: new Date(),
    };
  }
}
```

### Step 2: Create Module

```typescript
// src/integrations/platforms/newplatform/newplatform.module.ts
@Module({
  providers: [NewPlatformAdapter],
  exports: [NewPlatformAdapter],
})
export class NewPlatformModule {}
```

### Step 3: Register in PlatformsModule

```typescript
// src/integrations/platforms/platforms.module.ts
@Module({
  imports: [
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
    AtcoderModule,
    NewPlatformModule, // Add new module
  ],
  providers: [
    {
      provide: PLATFORM_ADAPTERS_TOKEN,
      useFactory: (
        codeforces: CodeforcesAdapter,
        leetcode: LeetCodeAdapter,
        codechef: CodeChefAdapter,
        atcoder: AtCoderAdapter,
        newplatform: NewPlatformAdapter, // Add new adapter
      ): PlatformAdapter[] => {
        return [
          codeforces,
          leetcode,
          codechef,
          atcoder,
          newplatform, // Add to array
        ].filter(adapter => adapter.config.enabled);
      },
      inject: [
        CodeforcesAdapter,
        LeetCodeAdapter,
        CodeChefAdapter,
        AtCoderAdapter,
        NewPlatformAdapter, // Add to inject array
      ],
    },
  ],
  exports: [
    PLATFORM_ADAPTERS_TOKEN,
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
    AtcoderModule,
    NewPlatformModule, // Export new module
  ],
})
export class PlatformsModule {}
```

### Step 4: Update Contest Schema

Add new platform to enum:

```typescript
export enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
  NEWPLATFORM = 'newplatform', // Add new platform
}
```

### Step 5: Test

```bash
# Manual sync
POST /contests/sync/newplatform

# Get contests
GET /contests/platform/newplatform

# Health check
GET /contests/health
```

## Best Practices

### ✅ Do

1. **Extend BasePlatformAdapter** - Use provided utilities
2. **Implement all interface methods** - Required for adapter pattern
3. **Handle errors gracefully** - Log and retry appropriately
4. **Transform to unified format** - Use ContestData interface
5. **Add health checks** - Monitor adapter status
6. **Configure timeouts** - Prevent hanging requests
7. **Test thoroughly** - Unit and integration tests
8. **Document API specifics** - Rate limits, authentication, etc.

### ❌ Don't

1. **Don't bypass retry logic** - Use makeRequest()
2. **Don't ignore timeouts** - Respect configured limits
3. **Don't hardcode values** - Use configuration
4. **Don't skip error logging** - Track all failures
5. **Don't make direct fetch calls** - Use BasePlatformAdapter methods
6. **Don't ignore health checks** - Implement properly
7. **Don't forget to filter** - Only return enabled adapters

## Testing

### Unit Tests

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
    const cfContest = { /* ... */ };
    const result = adapter.transformToInternalFormat(cfContest);
    expect(result.platform).toBe(ContestPlatform.CODEFORCES);
  });
});
```

### Integration Tests

```typescript
describe('PlatformsModule (e2e)', () => {
  it('should provide all enabled adapters', () => {
    const adapters = app.get(PLATFORM_ADAPTERS_TOKEN);
    expect(adapters.length).toBeGreaterThan(0);
    adapters.forEach(adapter => {
      expect(adapter.config.enabled).toBe(true);
    });
  });
});
```

## Monitoring

### Key Metrics

- **Sync Success Rate**: Percentage of successful syncs
- **API Response Time**: Average response time per platform
- **Error Rate**: Failed requests per platform
- **Contest Count**: Number of contests per platform
- **Health Status**: Current health of each adapter

### Logging

```typescript
// Successful sync
this.logger.log(`Successfully fetched 150 contests from Codeforces`);

// Failed sync
this.logger.error(`Failed to fetch contests from LeetCode: Timeout`);

// Health check
this.logger.warn(`Health check failed for CodeChef`);
```

## Troubleshooting

### Platform API Down

**Symptoms:** All requests to a platform fail

**Solutions:**
1. Check platform API status page
2. Verify network connectivity
3. Check API endpoint URL
4. Review error logs for patterns
5. Implement circuit breaker pattern

### Timeout Issues

**Symptoms:** Requests consistently timeout

**Solutions:**
1. Increase timeout in configuration
2. Check network latency
3. Verify API is responsive
4. Implement request caching
5. Use pagination if available

### Rate Limiting

**Symptoms:** 429 Too Many Requests errors

**Solutions:**
1. Reduce sync frequency
2. Implement request throttling
3. Use exponential backoff
4. Cache responses
5. Contact platform for rate limit increase

## Future Enhancements

### Planned Features

- [ ] **WhatsApp Integration** - Full WhatsApp Business API integration
- [ ] **Telegram Integration** - Telegram bot for notifications
- [ ] **Discord Integration** - Discord webhook support
- [ ] **Slack Integration** - Slack workspace integration
- [ ] **Webhook Support** - Custom webhook notifications
- [ ] **GraphQL Federation** - Unified GraphQL API
- [ ] **Real-time Updates** - WebSocket for live contest updates
- [ ] **Caching Layer** - Redis cache for API responses
- [ ] **Circuit Breaker** - Prevent cascading failures
- [ ] **API Versioning** - Support multiple API versions

### Scalability Improvements

1. **Distributed Sync** - Parallel sync across multiple workers
2. **Event-Driven Architecture** - Use message queues for sync jobs
3. **API Gateway** - Centralized API management
4. **Service Mesh** - Advanced traffic management
5. **Auto-scaling** - Dynamic resource allocation

## Related Documentation

- [Platform Adapters Overview](/server/adapters)
- [Base Adapter](/server/adapters/base)
- [Codeforces Adapter](/server/adapters/codeforces)
- [LeetCode Adapter](/server/adapters/leetcode)
- [CodeChef Adapter](/server/adapters/codechef)
- [AtCoder Adapter](/server/adapters/atcoder)
- [Contests Module](/server/modules/contests)
- [Platform Integrations Guide](/guide/platforms)
