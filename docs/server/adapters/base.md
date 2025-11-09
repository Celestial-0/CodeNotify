# Base Platform Adapter

Abstract base class providing common functionality for all platform adapters.

## Overview

`BasePlatformAdapter` implements the `PlatformAdapter` interface and provides shared utilities for HTTP requests, error handling, retry logic, and data transformation.

## Location

```
Server/src/integrations/platforms/base/platform-adapter.abstract.ts
```

## Class Definition

```typescript
export abstract class BasePlatformAdapter implements PlatformAdapter {
  protected readonly logger: Logger;

  constructor(public readonly config: PlatformConfig) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract readonly platformName: ContestPlatform;
  abstract fetchContests(): Promise<ContestData[]>;
  abstract fetchUpcomingContests(): Promise<ContestData[]>;
  abstract fetchRunningContests(): Promise<ContestData[]>;
  abstract transformToInternalFormat(data: any): ContestData;
}
```

## Configuration

### PlatformConfig Interface

```typescript
interface PlatformConfig {
  enabled: boolean;           // Enable/disable adapter
  apiUrl: string;            // Base API URL
  timeout: number;           // Request timeout (ms)
  retryAttempts?: number;    // Max retry attempts (default: 3)
  retryDelay?: number;       // Retry delay (ms, default: 1000)
}
```

## Core Methods

### makeRequest\<T\>()

HTTP request with automatic retry logic and timeout handling.

```typescript
protected async makeRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T>
```

**Features:**
- Automatic retry with exponential backoff
- Configurable timeout using AbortController
- Custom User-Agent header
- Error logging for each attempt
- Throws error after max attempts

**Example:**
```typescript
const data = await this.makeRequest<ApiResponse>(
  'https://api.platform.com/contests'
);
```

### healthCheck()

Verify platform API connectivity.

```typescript
async healthCheck(): Promise<boolean>
```

**Returns:** `true` if API is reachable, `false` otherwise

**Example:**
```typescript
const isHealthy = await adapter.healthCheck();
if (!isHealthy) {
  logger.warn('Platform API is down');
}
```

## Utility Methods

### sleep()

Async sleep utility for retry delays.

```typescript
protected sleep(ms: number): Promise<void>
```

### getErrorMessage()

Extract error message from unknown error types.

```typescript
protected getErrorMessage(error: unknown): string
```

**Handles:**
- `Error` instances
- Plain objects
- Primitive values

### unixToDate()

Convert Unix timestamp to Date object.

```typescript
protected unixToDate(timestamp: number): Date
```

**Example:**
```typescript
const date = this.unixToDate(1707998400); // 2024-02-15T12:00:00Z
```

### calculateDuration()

Calculate duration in minutes between two dates.

```typescript
protected calculateDuration(startTime: Date, endTime: Date): number
```

**Returns:** Duration in minutes (rounded)

### filterUpcoming()

Filter contests that haven't started yet.

```typescript
protected filterUpcoming(contests: ContestData[]): ContestData[]
```

**Returns:** Contests where `startTime > now`

### filterRunning()

Filter currently running contests.

```typescript
protected filterRunning(contests: ContestData[]): ContestData[]
```

**Returns:** Contests where `startTime <= now && endTime >= now`

## Error Handling

### Retry Logic

```typescript
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    // Make request
    return response;
  } catch (error) {
    if (attempt === maxAttempts) throw error;
    await this.sleep(retryDelay * attempt); // Exponential backoff
  }
}
```

### Timeout Handling

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(
  () => controller.abort(),
  this.config.timeout
);

const response = await fetch(url, {
  signal: controller.signal
});

clearTimeout(timeoutId);
```

## Implementation Example

```typescript
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
    
    return response.contests.map(contest =>
      this.transformToInternalFormat(contest)
    );
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
      name: data.title,
      platform: ContestPlatform.NEWPLATFORM,
      phase: this.determinePhase(data.startTime, data.endTime),
      type: this.mapType(data.type),
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

## Testing

```typescript
describe('BasePlatformAdapter', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter({
      enabled: true,
      apiUrl: 'https://test.com',
      timeout: 5000,
      retryAttempts: 2,
    });
  });

  it('should retry on failure', async () => {
    // Mock failed requests
    jest.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await expect(adapter.makeRequest('https://test.com')).resolves.toBeDefined();
  });

  it('should filter upcoming contests', () => {
    const contests = [
      { startTime: new Date('2025-01-01'), endTime: new Date('2025-01-02') },
      { startTime: new Date('2020-01-01'), endTime: new Date('2020-01-02') },
    ];

    const upcoming = adapter.filterUpcoming(contests);
    expect(upcoming).toHaveLength(1);
  });
});
```

## Best Practices

### ✅ Do

1. **Always call super(config)** in constructor
2. **Use provided utility methods** for common operations
3. **Log all operations** for debugging
4. **Handle errors gracefully** with try-catch
5. **Validate API responses** before transformation
6. **Use exponential backoff** for retries

### ❌ Don't

1. **Don't bypass retry logic** - use `makeRequest()`
2. **Don't ignore timeouts** - respect config.timeout
3. **Don't swallow errors** - let them propagate
4. **Don't make direct fetch calls** - use `makeRequest()`
5. **Don't hardcode values** - use config

## Related Documentation

- [Platform Interface](/server/adapters#platform-interface)
- [Codeforces Adapter](/server/adapters/codeforces)
- [LeetCode Adapter](/server/adapters/leetcode)
- [CodeChef Adapter](/server/adapters/codechef)
- [AtCoder Adapter](/server/adapters/atcoder)
