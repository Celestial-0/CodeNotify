# Contests Module

Complete contest management system for multi-platform competitive programming contests.

## Overview

The Contests Module handles contest discovery, synchronization, filtering, and analytics across four major competitive programming platforms: Codeforces, LeetCode, CodeChef, and AtCoder.

## Module Structure

```
contests/
├── contests.module.ts              # Module configuration
├── contests.controller.ts          # REST endpoints (19 routes)
├── contests.service.ts             # Business logic
├── contest-scheduler.service.ts    # Scheduled sync jobs
├── schemas/
│   └── contest.schema.ts          # MongoDB schema
└── dto/
    └── contest.dto.ts             # Zod DTOs and validation
```

## Dependencies

### Imports
- **MongooseModule**: MongoDB integration for Contest schema
- **PlatformsModule**: Platform adapters registry (`PLATFORM_ADAPTERS`)
- **NotificationsModule**: For sending contest notifications
- **JwtAuthGuard**: Authentication (from Auth Module)
- **RolesGuard**: Authorization (from Auth Module)

### Providers
- **ContestsService**: Core business logic
- **ContestSchedulerService**: Scheduled jobs (sync, cleanup, notifications)

### Controllers
- **ContestsController**: REST API endpoints (19 routes)

### Exports
- **ContestsService**: Used by NotificationsModule and other modules

## Contest Schema

### MongoDB Schema

**File**: `server/src/contests/schemas/contest.schema.ts`

```typescript
@Schema({ timestamps: true })
export class Contest {
  @Prop({ required: true, index: true })
  platformId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, enum: ContestPlatform, index: true })
  platform: ContestPlatform;

  @Prop({ required: true, enum: ContestPhase, index: true })
  phase: ContestPhase;

  @Prop({ required: true, enum: ContestType })
  type: ContestType;

  @Prop({ required: true, index: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop()
  description?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  registrationUrl?: string;

  @Prop()
  preparedBy?: string;

  @Prop({ enum: DifficultyLevel })
  difficulty?: DifficultyLevel;

  @Prop({ default: 0 })
  participantCount?: number;

  @Prop({ default: 0 })
  problemCount?: number;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop({ type: Object, default: {} })
  platformMetadata: PlatformMetadata;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false })
  isNotified: boolean;

  @Prop()
  lastSyncedAt?: Date;
}
```

### Enums

**ContestPlatform**:
```typescript
enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
}
```

**ContestPhase**:
```typescript
enum ContestPhase {
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  PENDING_SYSTEM_TEST = 'PENDING_SYSTEM_TEST',
  SYSTEM_TEST = 'SYSTEM_TEST',
  FINISHED = 'FINISHED',
  UPCOMING = 'UPCOMING',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}
```

**ContestType**:
```typescript
enum ContestType {
  // Codeforces
  CF = 'CF',
  IOI = 'IOI',
  ICPC = 'ICPC',
  // LeetCode
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  // CodeChef
  LONG = 'LONG',
  COOK_OFF = 'COOK_OFF',
  LUNCH_TIME = 'LUNCH_TIME',
  STARTERS = 'STARTERS',
  // AtCoder
  ABC = 'ABC',
  ARC = 'ARC',
  AGC = 'AGC',
  AHC = 'AHC',
}
```

**DifficultyLevel**:
```typescript
enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}
```

### Indexes

```typescript
// Compound indexes for performance
ContestSchema.index({ platform: 1, startTime: 1 });
ContestSchema.index({ platform: 1, phase: 1 });
ContestSchema.index({ startTime: 1, isActive: 1 });
ContestSchema.index({ phase: 1, isActive: 1 });
ContestSchema.index({ platformId: 1, platform: 1 }, { unique: true });
ContestSchema.index({ name: 'text', description: 'text' });
ContestSchema.index({ isNotified: 1, startTime: 1 });
ContestSchema.index({ lastSyncedAt: 1 });
```

### Virtual Fields

```typescript
isUpcoming: boolean;        // startTime > now
isRunning: boolean;         // startTime <= now && endTime >= now
isFinished: boolean;        // endTime < now
timeUntilStart: number;     // Milliseconds until start
timeUntilEnd: number;       // Milliseconds until end
```

## DTOs & Validation

### CreateContestDto

**File**: `server/src/contests/dto/contest.dto.ts`

```typescript
export const CreateContestSchema = z.object({
  platformId: z.string().min(1, 'Platform ID is required'),
  name: z.string().min(1, 'Contest name is required'),
  platform: z.enum(ContestPlatform),
  phase: z.enum(ContestPhase),
  type: z.enum(ContestType),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  durationMinutes: z.number().positive('Duration must be positive'),
  description: z.string().optional(),
  websiteUrl: z.url().optional(),
  registrationUrl: z.url().optional(),
  preparedBy: z.string().optional(),
  difficulty: z.enum(DifficultyLevel).optional(),
  participantCount: z.number().min(0).optional(),
  problemCount: z.number().min(0).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  platformMetadata: PlatformMetadataSchema,
  isActive: z.boolean().default(true),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
```

### ContestQueryDto

```typescript
export const ContestQuerySchema = z.object({
  platform: z.enum(ContestPlatform).optional(),
  phase: z.enum(ContestPhase).optional(),
  type: z.enum(ContestType).optional(),
  difficulty: z.enum(DifficultyLevel).optional(),
  isActive: z.boolean().optional(),
  isNotified: z.boolean().optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['startTime', 'endTime', 'name', 'participantCount']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
```

## API Endpoints (19 total)

### CRUD Operations

1. **POST /contests** - Create contest (Admin)
2. **GET /contests** - List all with pagination
3. **GET /contests/:id** - Get by ID
4. **PATCH /contests/:id** - Update (Admin)
5. **DELETE /contests/:id** - Delete (Admin)

### Status Filters

6. **GET /contests/upcoming** - Upcoming contests
7. **GET /contests/running** - Running contests
8. **GET /contests/finished** - Finished contests

### Platform & Filtering

9. **GET /contests/platform/:platform** - By platform
10. **GET /contests/search?q=** - Text search
11. **GET /contests/difficulty/:level** - By difficulty
12. **GET /contests/type/:type** - By type

### Analytics

13. **GET /contests/stats** - Overall stats
14. **GET /contests/stats/:platform** - Platform stats

### Synchronization (Admin)

15. **POST /contests/sync/:platform** - Sync platform
16. **POST /contests/sync/all** - Sync all
17. **POST /contests/bulk** - Bulk create

### System

18. **GET /contests/health** - Health check (Public, no auth required)

## Service Methods

### CRUD Operations

```typescript
async create(dto: CreateContestDto): Promise<ContestResponseDto>
async bulkCreate(dto: BulkCreateContestDto): Promise<ContestResponseDto[]>
async findAll(query: ContestQueryDto): Promise<PaginatedContestResponseDto>
async findById(id: string): Promise<ContestResponseDto>
async findByPlatformId(platformId: string, platform: ContestPlatform): Promise<ContestResponseDto | null>
async update(id: string, dto: UpdateContestDto): Promise<ContestResponseDto>
async delete(id: string): Promise<void>
```

### Platform Operations

```typescript
async findByPlatform(platform: ContestPlatform, query?: Partial<ContestQueryDto>): Promise<ContestResponseDto[]>
async findUpcoming(platform?: ContestPlatform): Promise<ContestResponseDto[]>
async findRunning(platform?: ContestPlatform): Promise<ContestResponseDto[]>
async findFinished(platform?: ContestPlatform): Promise<ContestResponseDto[]>
```

### Search & Filter

```typescript
async searchContests(query: string): Promise<ContestResponseDto[]>
async filterByDifficulty(level: DifficultyLevel): Promise<ContestResponseDto[]>
async filterByType(type: ContestType): Promise<ContestResponseDto[]>
```

### Analytics

```typescript
async getContestStats(): Promise<ContestStatsDto>
async getPlatformStats(platform: ContestPlatform): Promise<PlatformStatsDto>
```

### Synchronization

```typescript
async syncPlatform(platform: ContestPlatform): Promise<{ synced: number; updated: number; failed: number }>
async syncAllPlatforms(): Promise<Record<string, { synced: number; updated: number; failed: number }>>
private async upsertContests(contests: ContestData[]): Promise<{ synced: number; updated: number; failed: number }>
```

## Platform Integration

### Adapter Pattern

Uses `PlatformAdapter` interface from Platforms Module:

```typescript
constructor(
  @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
  @Inject(PLATFORM_ADAPTERS) adapters: PlatformAdapter[],
) {
  adapters.forEach((adapter) => {
    this.platformAdapters.set(adapter.platformName, adapter);
  });
}
```

### Registered Adapters

- **Codeforces** ✅ Enabled
- **LeetCode** ✅ Enabled
- **CodeChef** ✅ Enabled
- **AtCoder** ✅ Enabled

## Scheduled Jobs

**File**: `contest-scheduler.service.ts`

### 1. Contest Synchronization

```typescript
@Cron(CronExpression.EVERY_6_HOURS, {
  name: 'sync-all-contests',
  timeZone: 'UTC',
})
async handleContestSync(): Promise<void>
```

- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Timezone**: UTC
- **Function**: Syncs contests from all registered platform adapters
- **Configurable**: `CONTEST_SYNC_ENABLED` (default: true)
- **Logging**: Logs results for each platform (synced, updated, failed)

### 2. Contest Cleanup

```typescript
@Cron('0 2 * * *', {
  name: 'cleanup-old-contests',
  timeZone: 'UTC',
})
async handleCleanup()
```

- **Schedule**: Daily at 2 AM UTC
- **Function**: Deletes old finished contests
- **Retention**: `CONTEST_CLEANUP_DAYS` (default: 90 days)
- **Configurable**: `CONTEST_CLEANUP_ENABLED` (default: true)
- **Criteria**: Contests with `endTime < cutoffDate` and `phase = 'FINISHED'`

### 3. Upcoming Contest Notifications

```typescript
@Cron(CronExpression.EVERY_30_MINUTES, {
  name: 'check-upcoming-contests',
  timeZone: 'UTC',
})
async handleUpcomingContests()
```

- **Schedule**: Every 30 minutes (`*/30 * * * *`)
- **Timezone**: UTC
- **Function**: Finds contests starting within notification window
- **Window**: `NOTIFICATION_WINDOW_HOURS` (default: 24 hours)
- **Configurable**: `NOTIFICATIONS_ENABLED` (default: true)
- **Integration**: Calls `NotificationsService.notifyUpcomingContests()`

### Manual Sync Trigger

```typescript
async triggerManualSync(): Promise<void>
```

- Available for testing or admin use
- Manually triggers the sync job

## Guards & Authorization

| Endpoint | Guards | Roles | Access |
|----------|--------|-------|--------|
| GET (read) | None | - | Public |
| POST /contests | JwtAuthGuard, RolesGuard | admin | Admin only |
| PATCH /contests/:id | JwtAuthGuard, RolesGuard | admin | Admin only |
| DELETE /contests/:id | JwtAuthGuard, RolesGuard | admin | Admin only |
| POST /contests/sync/* | JwtAuthGuard, RolesGuard | admin | Admin only |
| POST /contests/bulk | JwtAuthGuard, RolesGuard | admin | Admin only |

## Error Handling

```typescript
try {
  // Operation
} catch (error) {
  this.logger.error(`Failed to...: ${this.getErrorMessage(error)}`, this.getErrorStack(error));
  throw error;
}
```

All operations include comprehensive error logging with stack traces.

## Integration with Other Modules

### Notifications Module

- Reads contests for upcoming notifications
- Filters by user preferences (platforms, contestTypes)
- Checks `isNotified` flag
- Updates `isNotified` after sending

### Platforms Module

- Fetches contests from platform adapters
- Transforms to internal format
- Handles sync failures gracefully

### Users Module

- User preferences filter contests
- `notifyBefore` determines notification timing

## Best Practices

### ✅ Do

1. **Use pagination** for list endpoints
2. **Filter by platform** for better performance
3. **Use text search** for name/description queries
4. **Check isActive** flag for current contests
5. **Sync regularly** (automated every 6 hours)
6. **Handle duplicates** (unique index on platformId + platform)

### ❌ Don't

1. **Don't fetch all contests** without pagination
2. **Don't ignore validation errors**
3. **Don't manually sync** too frequently (rate limits)
4. **Don't delete contests** (use isActive flag instead)
5. **Don't modify platformId** after creation

## Related Documentation

- [Contests API](/api/contests) - API reference
- [Platform Adapters](/server/adapters) - Integration details
- [Scheduler](/server/scheduler) - Sync scheduling
- [Database](/server/database) - Schema details

## Notes

- Contests synced every 6 hours automatically
- Unique constraint: platformId + platform
- Virtual fields computed on-the-fly
- Text search uses MongoDB text index
- Platform metadata flexible per platform
