# Contest Schema

MongoDB schema for multi-platform competitive programming contest data.

## Overview

The Contest schema stores contest information from multiple platforms (Codeforces, LeetCode, CodeChef, AtCoder) in a unified format with platform-specific metadata.

## Location

```
Server/src/contests/schemas/contest.schema.ts
```

## Schema Definition

### TypeScript Interface

```typescript
interface ContestDocument extends Document {
  _id: Types.ObjectId;
  platformId: string;
  name: string;
  platform: ContestPlatform;
  phase: ContestPhase;
  type: ContestType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata: PlatformMetadata;
  isActive: boolean;
  isNotified: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  isUpcoming: boolean;
  isRunning: boolean;
  isFinished: boolean;
  timeUntilStart: number;
  timeUntilEnd: number;
}
```

### Mongoose Schema

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

  // ... other fields
}
```

## Enums

### ContestPlatform

```typescript
enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
}
```

Supported competitive programming platforms.

### ContestPhase

```typescript
enum ContestPhase {
  // Universal phases
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  FINISHED = 'FINISHED',
  
  // Codeforces specific
  PENDING_SYSTEM_TEST = 'PENDING_SYSTEM_TEST',
  SYSTEM_TEST = 'SYSTEM_TEST',
  
  // LeetCode specific
  UPCOMING = 'UPCOMING',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
  
  // CodeChef specific
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}
```

Contest lifecycle phases across different platforms.

### ContestType

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

Platform-specific contest types.

### DifficultyLevel

```typescript
enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}
```

Contest difficulty levels.

## Fields

### Required Fields

#### platformId
- **Type:** `String`
- **Required:** Yes
- **Indexed:** Yes
- **Description:** Platform-specific contest identifier
- **Examples:**
  - Codeforces: `"1900"` (numeric ID)
  - LeetCode: `"weekly-contest-380"` (slug)
  - CodeChef: `"START120"` (contest code)
  - AtCoder: `"abc340"` (contest ID)

#### name
- **Type:** `String`
- **Required:** Yes
- **Indexed:** Yes (text index)
- **Description:** Contest name/title
- **Examples:**
  - `"Codeforces Round #900 (Div. 2)"`
  - `"Weekly Contest 380"`
  - `"Starters 120"`
  - `"AtCoder Beginner Contest 340"`

#### platform
- **Type:** `ContestPlatform` (enum)
- **Required:** Yes
- **Indexed:** Yes
- **Description:** Source platform
- **Values:** `codeforces`, `leetcode`, `codechef`, `atcoder`

#### phase
- **Type:** `ContestPhase` (enum)
- **Required:** Yes
- **Indexed:** Yes
- **Description:** Current contest phase/status
- **Common Values:** `BEFORE`, `CODING`, `FINISHED`

#### type
- **Type:** `ContestType` (enum)
- **Required:** Yes
- **Description:** Platform-specific contest type
- **Examples:** `CF`, `WEEKLY`, `STARTERS`, `ABC`

#### startTime
- **Type:** `Date`
- **Required:** Yes
- **Indexed:** Yes
- **Description:** Contest start timestamp
- **Format:** ISO 8601 date

#### endTime
- **Type:** `Date`
- **Required:** Yes
- **Description:** Contest end timestamp
- **Format:** ISO 8601 date

#### durationMinutes
- **Type:** `Number`
- **Required:** Yes
- **Description:** Contest duration in minutes
- **Calculation:** `(endTime - startTime) / 60000`

### Optional Fields

#### description
- **Type:** `String`
- **Required:** No
- **Indexed:** Yes (text index)
- **Description:** Contest description or details

#### websiteUrl
- **Type:** `String`
- **Required:** No
- **Description:** Link to contest page
- **Examples:**
  - `"https://codeforces.com/contest/1900"`
  - `"https://leetcode.com/contest/weekly-contest-380"`

#### registrationUrl
- **Type:** `String`
- **Required:** No
- **Description:** Link to contest registration

#### preparedBy
- **Type:** `String`
- **Required:** No
- **Description:** Contest author/organizer

#### difficulty
- **Type:** `DifficultyLevel` (enum)
- **Required:** No
- **Description:** Contest difficulty level
- **Values:** `BEGINNER`, `EASY`, `MEDIUM`, `HARD`, `EXPERT`

#### participantCount
- **Type:** `Number`
- **Default:** `0`
- **Description:** Number of registered participants

#### problemCount
- **Type:** `Number`
- **Default:** `0`
- **Description:** Number of problems in contest

#### country
- **Type:** `String`
- **Required:** No
- **Description:** Country (for regional contests)

#### city
- **Type:** `String`
- **Required:** No
- **Description:** City (for onsite contests)

#### platformMetadata
- **Type:** `Object` (PlatformMetadata)
- **Default:** `{}`
- **Description:** Platform-specific additional data
- **See:** [Platform Metadata](#platform-metadata)

### System Fields

#### isActive
- **Type:** `Boolean`
- **Default:** `true`
- **Indexed:** Yes
- **Description:** Contest active status
- **Usage:** Soft delete mechanism

#### isNotified
- **Type:** `Boolean`
- **Default:** `false`
- **Indexed:** Yes
- **Description:** Whether users have been notified
- **Usage:** Prevent duplicate notifications

#### lastSyncedAt
- **Type:** `Date`
- **Required:** No
- **Indexed:** Yes
- **Description:** Last sync timestamp from platform API

#### createdAt
- **Type:** `Date`
- **Auto-generated:** Yes
- **Description:** Document creation timestamp

#### updatedAt
- **Type:** `Date`
- **Auto-generated:** Yes
- **Description:** Last update timestamp

## Platform Metadata

Flexible object for storing platform-specific data.

```typescript
interface PlatformMetadata {
  // Codeforces specific
  frozen?: boolean;
  relativeTimeSeconds?: number;
  icpcRegion?: string;
  season?: string;

  // LeetCode specific
  titleSlug?: string;
  premiumOnly?: boolean;

  // CodeChef specific
  division?: string;
  rated?: boolean;

  // AtCoder specific
  ratedRange?: string;
  penalty?: number;
}
```

### Codeforces Metadata

- `frozen`: Scoreboard frozen status
- `relativeTimeSeconds`: Time relative to now
- `icpcRegion`: ICPC region (if applicable)
- `season`: Contest season

### LeetCode Metadata

- `titleSlug`: URL-friendly contest slug
- `premiumOnly`: Premium-only contest flag

### CodeChef Metadata

- `division`: Contest division (Div 1, Div 2, etc.)
- `rated`: Whether contest is rated

### AtCoder Metadata

- `ratedRange`: Rating range affected (e.g., "1200-1999")
- `penalty`: Penalty time in minutes

## Virtual Fields

### isUpcoming
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Contest hasn't started yet
- **Calculation:** `startTime > now`

### isRunning
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Contest is currently running
- **Calculation:** `startTime <= now && endTime >= now`

### isFinished
- **Type:** `Boolean`
- **Virtual:** Yes
- **Description:** Contest has ended
- **Calculation:** `endTime < now`

### timeUntilStart
- **Type:** `Number`
- **Virtual:** Yes
- **Unit:** Milliseconds
- **Description:** Time until contest starts
- **Calculation:** `max(0, startTime - now)`

### timeUntilEnd
- **Type:** `Number`
- **Virtual:** Yes
- **Unit:** Milliseconds
- **Description:** Time until contest ends
- **Calculation:** `max(0, endTime - now)`

## Indexes

### Single Field Indexes

```typescript
{ platformId: 1 }      // Platform-specific ID lookup
{ name: 1 }            // Name search
{ platform: 1 }        // Filter by platform
{ phase: 1 }           // Filter by phase
{ startTime: 1 }       // Sort by start time
{ isActive: 1 }        // Filter active contests
{ isNotified: 1 }      // Notification tracking
{ lastSyncedAt: 1 }    // Sync tracking
```

### Compound Indexes

```typescript
{ platform: 1, startTime: 1 }           // Platform contests sorted by time
{ platform: 1, phase: 1 }               // Platform contests by phase
{ startTime: 1, isActive: 1 }           // Active upcoming contests
{ phase: 1, isActive: 1 }               // Active contests by phase
{ platformId: 1, platform: 1 }          // Unique constraint
{ isNotified: 1, startTime: 1 }         // Notification queries
```

### Text Index

```typescript
{ name: 'text', description: 'text' }   // Full-text search
```

### Unique Index

```typescript
{ platformId: 1, platform: 1 }          // Prevent duplicates
```

**Purpose:** Ensure each contest is unique per platform.

## Example Documents

### Codeforces Contest

```json
{
  "_id": "65c1234567890abcdef12345",
  "platformId": "1900",
  "name": "Codeforces Round #900 (Div. 2)",
  "platform": "codeforces",
  "phase": "BEFORE",
  "type": "CF",
  "startTime": "2024-02-20T14:35:00.000Z",
  "endTime": "2024-02-20T16:35:00.000Z",
  "durationMinutes": 120,
  "websiteUrl": "https://codeforces.com/contest/1900",
  "difficulty": "MEDIUM",
  "participantCount": 15000,
  "problemCount": 6,
  "platformMetadata": {
    "frozen": false,
    "relativeTimeSeconds": -86400
  },
  "isActive": true,
  "isNotified": false,
  "lastSyncedAt": "2024-02-19T12:00:00.000Z",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-19T12:00:00.000Z"
}
```

### LeetCode Contest

```json
{
  "_id": "65c1234567890abcdef12346",
  "platformId": "weekly-contest-380",
  "name": "Weekly Contest 380",
  "platform": "leetcode",
  "phase": "UPCOMING",
  "type": "WEEKLY",
  "startTime": "2024-02-18T02:30:00.000Z",
  "endTime": "2024-02-18T04:00:00.000Z",
  "durationMinutes": 90,
  "description": "Weekly Contest 380",
  "websiteUrl": "https://leetcode.com/contest/weekly-contest-380",
  "difficulty": "MEDIUM",
  "problemCount": 4,
  "platformMetadata": {
    "titleSlug": "weekly-contest-380",
    "premiumOnly": false
  },
  "isActive": true,
  "isNotified": false,
  "lastSyncedAt": "2024-02-17T12:00:00.000Z",
  "createdAt": "2024-02-10T08:00:00.000Z",
  "updatedAt": "2024-02-17T12:00:00.000Z"
}
```

### CodeChef Contest

```json
{
  "_id": "65c1234567890abcdef12347",
  "platformId": "START120",
  "name": "Starters 120",
  "platform": "codechef",
  "phase": "NOT_STARTED",
  "type": "STARTERS",
  "startTime": "2024-02-21T14:30:00.000Z",
  "endTime": "2024-02-21T16:30:00.000Z",
  "durationMinutes": 120,
  "websiteUrl": "https://www.codechef.com/START120",
  "difficulty": "BEGINNER",
  "participantCount": 5000,
  "problemCount": 8,
  "platformMetadata": {
    "division": "All",
    "rated": true
  },
  "isActive": true,
  "isNotified": false,
  "lastSyncedAt": "2024-02-19T12:00:00.000Z",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-19T12:00:00.000Z"
}
```

### AtCoder Contest

```json
{
  "_id": "65c1234567890abcdef12348",
  "platformId": "abc340",
  "name": "AtCoder Beginner Contest 340",
  "platform": "atcoder",
  "phase": "BEFORE",
  "type": "ABC",
  "startTime": "2024-02-17T12:00:00.000Z",
  "endTime": "2024-02-17T13:40:00.000Z",
  "durationMinutes": 100,
  "websiteUrl": "https://atcoder.jp/contests/abc340",
  "difficulty": "BEGINNER",
  "problemCount": 6,
  "platformMetadata": {
    "ratedRange": "All",
    "penalty": 5
  },
  "isActive": true,
  "isNotified": false,
  "lastSyncedAt": "2024-02-16T12:00:00.000Z",
  "createdAt": "2024-02-10T08:00:00.000Z",
  "updatedAt": "2024-02-16T12:00:00.000Z"
}
```

## Common Queries

### Find Upcoming Contests

```typescript
const upcomingContests = await this.contestModel.find({
  startTime: { $gt: new Date() },
  isActive: true
}).sort({ startTime: 1 });
```

### Find Running Contests

```typescript
const now = new Date();
const runningContests = await this.contestModel.find({
  startTime: { $lte: now },
  endTime: { $gte: now },
  isActive: true
});
```

### Find by Platform

```typescript
const codeforcesContests = await this.contestModel.find({
  platform: ContestPlatform.CODEFORCES,
  isActive: true
}).sort({ startTime: -1 });
```

### Find by Type

```typescript
const weeklyContests = await this.contestModel.find({
  type: ContestType.WEEKLY,
  isActive: true
});
```

### Search by Name

```typescript
const contests = await this.contestModel.find({
  $text: { $search: 'beginner' }
});
```

### Find Contests Needing Notification

```typescript
const contestsToNotify = await this.contestModel.find({
  isNotified: false,
  isActive: true,
  startTime: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
  }
});
```

## Upsert Pattern

Used during platform synchronization to avoid duplicates:

```typescript
await this.contestModel.updateOne(
  { platformId: contest.platformId, platform: contest.platform },
  { $set: contest },
  { upsert: true }
);
```

## Relationships

### One-to-Many with Notifications

```typescript
// Contest has many notifications
Notification.contestId -> Contest._id
```

### Referenced by Users (indirectly)

Users receive notifications about contests based on their platform preferences.

## Data Lifecycle

### 1. Creation (Sync)

```typescript
// Adapter fetches contest from platform API
const contests = await adapter.fetchContests();

// Transform to internal format
const contestData = adapter.transformToInternalFormat(rawContest);

// Upsert to database
await contestModel.updateOne(
  { platformId: contestData.platformId, platform: contestData.platform },
  { $set: contestData },
  { upsert: true }
);
```

### 2. Update (Re-sync)

Contests are re-synced every 6 hours to update phase, participant count, etc.

### 3. Notification

```typescript
// Mark as notified after sending notifications
await contestModel.updateOne(
  { _id: contestId },
  { $set: { isNotified: true } }
);
```

### 4. Cleanup (Optional)

Old finished contests can be archived or deleted:

```typescript
// Archive contests older than 90 days
await contestModel.updateMany(
  {
    endTime: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    phase: ContestPhase.FINISHED
  },
  { $set: { isActive: false } }
);
```

## Performance Optimization

### Query Optimization

1. **Use indexes** for frequently queried fields
2. **Project only needed fields** to reduce data transfer
3. **Use lean()** for read-only queries
4. **Limit results** with pagination

### Example Optimized Query

```typescript
const contests = await this.contestModel
  .find({
    platform: ContestPlatform.CODEFORCES,
    startTime: { $gt: new Date() }
  })
  .select('name startTime endTime platform type')
  .sort({ startTime: 1 })
  .limit(20)
  .lean();
```

## Best Practices

### ✅ Do

1. **Use upsert** to prevent duplicates during sync
2. **Index frequently queried fields** (platform, startTime, phase)
3. **Use compound indexes** for multi-field queries
4. **Mark contests as notified** to prevent duplicate notifications
5. **Store platform metadata** for platform-specific features
6. **Use virtual fields** for computed properties
7. **Validate enum values** before saving

### ❌ Don't

1. **Don't create duplicate contests** (use unique index)
2. **Don't skip lastSyncedAt** updates
3. **Don't hard-delete contests** (use isActive flag)
4. **Don't ignore phase updates** during re-sync
5. **Don't query without indexes** on large collections
6. **Don't store redundant data** (use virtual fields)

## Migration Notes

### Adding New Platform

1. Add platform to `ContestPlatform` enum
2. Add platform-specific types to `ContestType` enum
3. Add platform-specific phases to `ContestPhase` enum
4. Update `PlatformMetadata` interface
5. Create platform adapter
6. Test sync and queries

### Adding New Field

```typescript
// Add field to schema
@Prop()
newField?: string;

// Migrate existing documents (optional)
await contestModel.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: 'default-value' } }
);
```

## Related Documentation

- [Contest API Endpoints](/api/contests)
- [Platform Adapters](/server/adapters)
- [Contests Module](/server/modules/contests)
- [Database Indexes](/server/database/indexes)
- [Platform Integrations](/guide/platforms)
