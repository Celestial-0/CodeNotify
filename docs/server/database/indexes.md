# Database Indexes

Comprehensive guide to MongoDB indexes used in CodeNotify for optimal query performance.

## Overview

Indexes are critical for query performance in MongoDB. This document details all indexes used across collections, their purpose, and optimization strategies.

## Collections

CodeNotify uses three main collections:
1. **users** - User accounts and preferences
2. **contests** - Multi-platform contest data
3. **notifications** - Notification history and tracking

## User Collection Indexes

### Primary Indexes

#### Unique Email Index

```typescript
{ email: 1 } // Unique
```

**Purpose:** Ensure email uniqueness and fast authentication queries

**Queries Optimized:**
- User login by email
- Email uniqueness check during registration
- Find user by email

**Usage:**
```typescript
db.users.findOne({ email: 'user@example.com' })
```

**Performance:** O(log n) lookup

### Recommended Additional Indexes

#### Active Users Index

```typescript
{ isActive: 1 }
```

**Purpose:** Filter active/inactive users efficiently

**Queries Optimized:**
- Find all active users
- Count active users
- Notification recipient filtering

**Usage:**
```typescript
db.users.find({ isActive: true })
```

#### Platform Preference Index

```typescript
{ 'preferences.platforms': 1 }
```

**Purpose:** Find users subscribed to specific platforms

**Queries Optimized:**
- Find users interested in Codeforces
- Platform-specific notification queries
- User segmentation by platform

**Usage:**
```typescript
db.users.find({ 'preferences.platforms': 'codeforces' })
```

#### Role Index

```typescript
{ role: 1 }
```

**Purpose:** Filter users by role (admin/user)

**Queries Optimized:**
- Find all admins
- Role-based access control queries
- User management operations

**Usage:**
```typescript
db.users.find({ role: 'admin' })
```

#### Last Login Index

```typescript
{ lastLogin: -1 }
```

**Purpose:** Sort users by last login time

**Queries Optimized:**
- Find recently active users
- Identify inactive accounts
- User engagement analytics

**Usage:**
```typescript
db.users.find().sort({ lastLogin: -1 })
```

#### Registration Date Index

```typescript
{ createdAt: -1 }
```

**Purpose:** Sort users by registration date

**Queries Optimized:**
- Find newest users
- User growth analytics
- Cohort analysis

**Usage:**
```typescript
db.users.find().sort({ createdAt: -1 })
```

### Compound Indexes for Users

#### Active Users by Platform

```typescript
{ 'preferences.platforms': 1, isActive: 1 }
```

**Purpose:** Find active users for specific platform

**Queries Optimized:**
- Notification recipient queries
- Platform-specific user counts
- Active user segmentation

**Usage:**
```typescript
db.users.find({
  'preferences.platforms': 'codeforces',
  isActive: true
})
```

#### Active Users by Notification Preference

```typescript
{ isActive: 1, 'preferences.notifyBefore': 1 }
```

**Purpose:** Find users with specific notification timing

**Queries Optimized:**
- Time-based notification queries
- User preference analytics

## Contest Collection Indexes

### Single Field Indexes

#### Platform ID Index

```typescript
{ platformId: 1 }
```

**Purpose:** Fast lookup by platform-specific ID

**Queries Optimized:**
- Find contest by platform ID
- Upsert operations during sync

**Usage:**
```typescript
db.contests.findOne({ platformId: '1900' })
```

#### Contest Name Index

```typescript
{ name: 1 }
```

**Purpose:** Sort and filter by contest name

**Queries Optimized:**
- Alphabetical sorting
- Name-based filtering

#### Platform Index

```typescript
{ platform: 1 }
```

**Purpose:** Filter contests by platform

**Queries Optimized:**
- Get all Codeforces contests
- Platform-specific queries
- Platform statistics

**Usage:**
```typescript
db.contests.find({ platform: 'codeforces' })
```

#### Phase Index

```typescript
{ phase: 1 }
```

**Purpose:** Filter contests by phase

**Queries Optimized:**
- Find upcoming contests
- Find running contests
- Find finished contests

**Usage:**
```typescript
db.contests.find({ phase: 'BEFORE' })
```

#### Start Time Index

```typescript
{ startTime: 1 }
```

**Purpose:** Sort contests by start time

**Queries Optimized:**
- Chronological sorting
- Time-range queries
- Upcoming contest queries

**Usage:**
```typescript
db.contests.find({ startTime: { $gt: new Date() } })
```

#### Active Status Index

```typescript
{ isActive: 1 }
```

**Purpose:** Filter active/archived contests

**Queries Optimized:**
- Get only active contests
- Soft delete filtering

#### Notification Status Index

```typescript
{ isNotified: 1 }
```

**Purpose:** Track notification status

**Queries Optimized:**
- Find contests needing notification
- Prevent duplicate notifications

**Usage:**
```typescript
db.contests.find({ isNotified: false })
```

#### Last Synced Index

```typescript
{ lastSyncedAt: 1 }
```

**Purpose:** Track sync freshness

**Queries Optimized:**
- Find stale contests
- Sync monitoring
- Data freshness queries

### Compound Indexes for Contests

#### Platform + Start Time

```typescript
{ platform: 1, startTime: 1 }
```

**Purpose:** Get platform contests sorted by time

**Queries Optimized:**
- Platform-specific upcoming contests
- Platform contest timeline
- Platform-specific filtering with sorting

**Usage:**
```typescript
db.contests.find({ platform: 'codeforces' }).sort({ startTime: 1 })
```

**Performance:** Highly optimized for common queries

#### Platform + Phase

```typescript
{ platform: 1, phase: 1 }
```

**Purpose:** Get platform contests by phase

**Queries Optimized:**
- Codeforces upcoming contests
- Platform-specific running contests
- Phase distribution per platform

**Usage:**
```typescript
db.contests.find({ platform: 'leetcode', phase: 'BEFORE' })
```

#### Start Time + Active Status

```typescript
{ startTime: 1, isActive: 1 }
```

**Purpose:** Get active contests sorted by time

**Queries Optimized:**
- Upcoming active contests
- Contest timeline (active only)
- Notification queries

**Usage:**
```typescript
db.contests.find({ isActive: true }).sort({ startTime: 1 })
```

#### Phase + Active Status

```typescript
{ phase: 1, isActive: 1 }
```

**Purpose:** Get active contests by phase

**Queries Optimized:**
- Active upcoming contests
- Active running contests
- Phase-based filtering (active only)

**Usage:**
```typescript
db.contests.find({ phase: 'CODING', isActive: true })
```

#### Notification Status + Start Time

```typescript
{ isNotified: 1, startTime: 1 }
```

**Purpose:** Find contests needing notification

**Queries Optimized:**
- Notification scheduler queries
- Time-based notification filtering
- Prevent duplicate notifications

**Usage:**
```typescript
db.contests.find({
  isNotified: false,
  startTime: { $gte: now, $lte: tomorrow }
})
```

### Unique Compound Index

#### Platform ID + Platform

```typescript
{ platformId: 1, platform: 1 } // Unique
```

**Purpose:** Ensure contest uniqueness per platform

**Queries Optimized:**
- Upsert operations during sync
- Duplicate prevention
- Contest lookup by platform and ID

**Usage:**
```typescript
db.contests.updateOne(
  { platformId: '1900', platform: 'codeforces' },
  { $set: contestData },
  { upsert: true }
)
```

**Critical:** Prevents duplicate contests during sync

### Text Index

#### Full-Text Search

```typescript
{ name: 'text', description: 'text' }
```

**Purpose:** Enable full-text search on contest names and descriptions

**Queries Optimized:**
- Search contests by keywords
- Fuzzy name matching
- Description search

**Usage:**
```typescript
db.contests.find({ $text: { $search: 'beginner' } })
```

**Note:** Only one text index per collection

## Notification Collection Indexes

### Single Field Indexes

#### User ID Index

```typescript
{ userId: 1 }
```

**Purpose:** Find notifications for a user

**Queries Optimized:**
- User notification history
- User-specific queries

**Usage:**
```typescript
db.notifications.find({ userId: ObjectId('...') })
```

#### Contest ID Index

```typescript
{ contestId: 1 }
```

**Purpose:** Find notifications for a contest

**Queries Optimized:**
- Contest notification tracking
- Contest-specific queries

#### Type Index

```typescript
{ type: 1 }
```

**Purpose:** Filter by notification type

**Queries Optimized:**
- Type-based analytics
- Notification type filtering

#### Status Index

```typescript
{ status: 1 }
```

**Purpose:** Filter by delivery status

**Queries Optimized:**
- Find failed notifications
- Success rate analytics
- Retry queries

#### Scheduled Time Index

```typescript
{ scheduledAt: 1 }
```

**Purpose:** Find scheduled notifications

**Queries Optimized:**
- Scheduler queries
- Time-based filtering

#### Active Status Index

```typescript
{ isActive: 1 }
```

**Purpose:** Filter active notifications

**Queries Optimized:**
- Active notification queries
- Soft delete filtering

### Compound Indexes for Notifications

#### User + Created Date

```typescript
{ userId: 1, createdAt: -1 }
```

**Purpose:** User notification history sorted by date

**Queries Optimized:**
- User notification timeline
- Recent notifications for user
- Pagination queries

**Usage:**
```typescript
db.notifications.find({ userId: ObjectId('...') }).sort({ createdAt: -1 })
```

#### User + Status

```typescript
{ userId: 1, status: 1 }
```

**Purpose:** User notifications by status

**Queries Optimized:**
- User's failed notifications
- User's pending notifications
- Status-based filtering per user

#### User + Contest (Unique)

```typescript
{ userId: 1, contestId: 1 } // Unique, Sparse
```

**Purpose:** Prevent duplicate notifications per user per contest

**Queries Optimized:**
- Duplicate prevention
- User-contest notification lookup

**Note:** Sparse index (allows null contestId)

#### Contest + Created Date

```typescript
{ contestId: 1, createdAt: -1 }
```

**Purpose:** Contest notification history

**Queries Optimized:**
- All notifications for a contest
- Contest notification timeline

#### Status + Scheduled Time

```typescript
{ status: 1, scheduledAt: 1 }
```

**Purpose:** Find pending scheduled notifications

**Queries Optimized:**
- Scheduler queries
- Pending notification processing

#### Status + Next Retry Time

```typescript
{ status: 1, nextRetryAt: 1 }
```

**Purpose:** Find notifications ready for retry

**Queries Optimized:**
- Retry scheduler queries
- Failed notification processing

### TTL Index

#### Expiration Index

```typescript
{ expiresAt: 1 } // TTL index, expireAfterSeconds: 0
```

**Purpose:** Automatic cleanup of old notifications

**Behavior:** MongoDB automatically deletes documents when `expiresAt` date is reached

**Default:** 90 days from creation

**Usage:**
```typescript
// Set expiration (done automatically in pre-save hook)
notification.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
```

## Index Statistics

### Checking Index Usage

```javascript
// Get index statistics
db.contests.aggregate([
  { $indexStats: {} }
])

// Explain query plan
db.contests.find({ platform: 'codeforces' }).explain('executionStats')
```

### Index Size

```javascript
// Get collection stats including index sizes
db.contests.stats()
```

## Index Maintenance

### Creating Indexes

```javascript
// Create single field index
db.users.createIndex({ email: 1 }, { unique: true })

// Create compound index
db.contests.createIndex({ platform: 1, startTime: 1 })

// Create text index
db.contests.createIndex({ name: 'text', description: 'text' })

// Create TTL index
db.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)
```

### Dropping Indexes

```javascript
// Drop specific index
db.contests.dropIndex('platform_1_startTime_1')

// Drop all indexes except _id
db.contests.dropIndexes()
```

### Rebuilding Indexes

```javascript
// Rebuild all indexes
db.contests.reIndex()
```

## Performance Considerations

### Index Selectivity

**High Selectivity (Good):**
- Unique fields (email, platformId+platform)
- Fields with many distinct values (startTime, name)

**Low Selectivity (Consider carefully):**
- Boolean fields (isActive, isNotified)
- Enum fields with few values (role, phase)

**Recommendation:** Use compound indexes for low-selectivity fields

### Index Size vs. Performance

**Trade-offs:**
- More indexes = Faster reads, slower writes
- Larger indexes = More memory usage
- Compound indexes = More specific optimization

**Best Practice:** Create indexes based on actual query patterns

### Write Performance Impact

Each index adds overhead to write operations:
- Insert: Update all indexes
- Update: Update affected indexes
- Delete: Update all indexes

**Recommendation:** Only create necessary indexes

## Query Optimization Tips

### 1. Use Covered Queries

Query only indexed fields to avoid document lookup:

```typescript
// Covered query (fast)
db.contests.find(
  { platform: 'codeforces' },
  { platform: 1, startTime: 1, _id: 0 }
)
```

### 2. Use Index Hints

Force MongoDB to use specific index:

```typescript
db.contests.find({ platform: 'codeforces' }).hint({ platform: 1, startTime: 1 })
```

### 3. Analyze Query Plans

```typescript
db.contests.find({ platform: 'codeforces' }).explain('executionStats')
```

Look for:
- `IXSCAN` (index scan) - Good
- `COLLSCAN` (collection scan) - Bad (add index)
- `nReturned` vs `totalDocsExamined` - Should be close

### 4. Use Projection

Fetch only needed fields:

```typescript
db.contests.find(
  { platform: 'codeforces' },
  { name: 1, startTime: 1 }
)
```

### 5. Limit Results

Always use limit for large result sets:

```typescript
db.contests.find({ platform: 'codeforces' }).limit(20)
```

## Monitoring

### Index Usage Monitoring

```javascript
// Check if index is being used
db.contests.aggregate([
  { $indexStats: {} },
  { $match: { name: 'platform_1_startTime_1' } }
])
```

### Slow Query Logging

Enable slow query logging in MongoDB:

```javascript
db.setProfilingLevel(1, { slowms: 100 })
```

### Index Recommendations

Use MongoDB Compass or Atlas to get index recommendations based on actual query patterns.

## Best Practices

### ✅ Do

1. **Create indexes for frequently queried fields**
2. **Use compound indexes for multi-field queries**
3. **Monitor index usage** with $indexStats
4. **Analyze query plans** with explain()
5. **Use covered queries** when possible
6. **Create unique indexes** for uniqueness constraints
7. **Use TTL indexes** for automatic cleanup
8. **Test index performance** before production

### ❌ Don't

1. **Don't create unnecessary indexes** (write overhead)
2. **Don't create redundant indexes** (covered by compound)
3. **Don't ignore index size** (memory usage)
4. **Don't skip index maintenance** (rebuild periodically)
5. **Don't create indexes on high-cardinality fields** without need
6. **Don't use too many compound indexes** (diminishing returns)
7. **Don't forget to drop unused indexes**

## Index Creation Scripts

### Users Collection

```javascript
// Unique email
db.users.createIndex({ email: 1 }, { unique: true });

// Active users
db.users.createIndex({ isActive: 1 });

// Platform preferences
db.users.createIndex({ 'preferences.platforms': 1 });

// Role
db.users.createIndex({ role: 1 });

// Compound: active users by platform
db.users.createIndex({ 'preferences.platforms': 1, isActive: 1 });
```

### Contests Collection

```javascript
// Single field indexes
db.contests.createIndex({ platformId: 1 });
db.contests.createIndex({ platform: 1 });
db.contests.createIndex({ phase: 1 });
db.contests.createIndex({ startTime: 1 });
db.contests.createIndex({ isActive: 1 });
db.contests.createIndex({ isNotified: 1 });
db.contests.createIndex({ lastSyncedAt: 1 });

// Compound indexes
db.contests.createIndex({ platform: 1, startTime: 1 });
db.contests.createIndex({ platform: 1, phase: 1 });
db.contests.createIndex({ startTime: 1, isActive: 1 });
db.contests.createIndex({ phase: 1, isActive: 1 });
db.contests.createIndex({ isNotified: 1, startTime: 1 });

// Unique compound index
db.contests.createIndex(
  { platformId: 1, platform: 1 },
  { unique: true }
);

// Text index
db.contests.createIndex({ name: 'text', description: 'text' });
```

### Notifications Collection

```javascript
// Single field indexes
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ contestId: 1 });
db.notifications.createIndex({ type: 1 });
db.notifications.createIndex({ status: 1 });
db.notifications.createIndex({ scheduledAt: 1 });
db.notifications.createIndex({ isActive: 1 });

// Compound indexes
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, status: 1 });
db.notifications.createIndex({ contestId: 1, createdAt: -1 });
db.notifications.createIndex({ status: 1, scheduledAt: 1 });
db.notifications.createIndex({ status: 1, nextRetryAt: 1 });

// Unique compound index (sparse)
db.notifications.createIndex(
  { userId: 1, contestId: 1 },
  { unique: true, sparse: true }
);

// TTL index
db.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

## Related Documentation

- [User Schema](/server/database/user)
- [Contest Schema](/server/database/contest)
- [Notification Schema](/server/modules/notifications#notification-schema)
- [Database Design](/server/database) - Overall database architecture
- [System Architecture](/server/architecture) - Server architecture
