# Database Design

CodeNotify uses **MongoDB** with **Mongoose ODM** for flexible, scalable data storage.

## Database Architecture

```
MongoDB Atlas / Local MongoDB
├── codenotify (database)
    ├── users (collection)
    ├── contests (collection)
    └── notifications (collection)
```

## Connection Configuration

### Database Module

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true, // Build indexes automatically
        maxPoolSize: 10, // Connection pool size
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### Connection String Format

```
mongodb://[username:password@]host[:port]/database[?options]
```

**Examples**:
```bash
# Local
mongodb://localhost:27017/codenotify

# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/codenotify?retryWrites=true&w=majority

# With authentication
mongodb://admin:password@localhost:27017/codenotify?authSource=admin
```

## Collections

### 1. Users Collection

**Purpose**: Store user accounts, preferences, and authentication data

**Schema**: [User Schema](/server/database/user)

**Indexes**:
- `email` (unique)
- `createdAt`
- `lastLogin`

**Document Count**: ~10,000 (estimated)

**Average Size**: ~2 KB per document

### 2. Contests Collection

**Purpose**: Store contests from all platforms

**Schema**: [Contest Schema](/server/database/contest)

**Indexes**:
- `platformId + platform` (unique compound)
- `platform + startTime` (compound)
- `platform + phase` (compound)
- `startTime`
- `endTime`
- `name + description` (text index)

**Document Count**: ~50,000 (estimated)

**Average Size**: ~1.5 KB per document

### 3. Notifications Collection

**Purpose**: Store notification history and status

**Schema**: [Notification Schema](/server/database/notification)

**Indexes**:
- `userId + createdAt` (compound)
- `userId + isRead` (compound)
- `contestId`
- `createdAt`

**Document Count**: ~100,000 (estimated)

**Average Size**: ~0.5 KB per document

## Schema Design Principles

### 1. **Embedded vs Referenced**

**Embedded Documents** (used for):
- User preferences (embedded in User)
- Platform metadata (embedded in Contest)
- Notification metadata (embedded in Notification)

**Referenced Documents** (used for):
- Contest → Platform (enum reference)
- Notification → User (ObjectId reference)
- Notification → Contest (ObjectId reference)

### 2. **Denormalization**

Strategic denormalization for performance:
- User name/email duplicated in notifications
- Contest name duplicated in notifications
- Reduces JOIN operations

### 3. **Flexible Schema**

`platformMetadata` field allows platform-specific data:

```typescript
{
  platformMetadata: {
    // Codeforces
    frozen: boolean,
    relativeTimeSeconds: number,
    
    // LeetCode
    titleSlug: string,
    isVirtual: boolean,
    
    // CodeChef
    contestCode: string,
    
    // AtCoder
    rateChange: string
  }
}
```

## Indexing Strategy

### Compound Indexes

Optimized for common query patterns:

```typescript
// Contest queries
{ platform: 1, startTime: 1 }  // Platform + time range
{ platform: 1, phase: 1 }       // Platform + status
{ platformId: 1, platform: 1 }  // Unique constraint

// Notification queries
{ userId: 1, createdAt: -1 }    // User notifications timeline
{ userId: 1, isRead: 1 }        // Unread notifications
```

### Text Indexes

Full-text search on contests:

```typescript
{ name: 'text', description: 'text' }
```

### Performance Considerations

- Indexes are built automatically on startup
- Compound indexes cover multiple query patterns
- Text indexes enable fast search
- Sparse indexes for optional fields

## Data Validation

### Mongoose Schema Validation

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;
  
  @Prop({ required: true, minlength: 6 })
  password: string;
  
  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name: string;
  
  @Prop({ match: /^\+[1-9]\d{1,14}$/ })
  phoneNumber?: string;
}
```

### Zod Runtime Validation

Additional validation at API level:

```typescript
export const CreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/).optional()
});
```

## Query Optimization

### 1. **Projection**

Only fetch required fields:

```typescript
await this.contestModel
  .find({ platform: 'codeforces' })
  .select('name startTime endTime')
  .exec();
```

### 2. **Lean Queries**

Return plain JavaScript objects:

```typescript
await this.contestModel
  .find({ phase: 'BEFORE' })
  .lean()
  .exec();
```

### 3. **Pagination**

Limit result sets:

```typescript
await this.contestModel
  .find(filter)
  .skip(offset)
  .limit(limit)
  .exec();
```

### 4. **Aggregation Pipeline**

Complex queries:

```typescript
await this.contestModel.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$platform', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

## Data Lifecycle

### 1. **Creation**

```typescript
// Single document
await this.contestModel.create(contestData);

// Bulk insert
await this.contestModel.insertMany(contests, { ordered: false });
```

### 2. **Updates**

```typescript
// Update one
await this.contestModel.updateOne(
  { _id: id },
  { $set: updateData }
);

// Update many
await this.contestModel.updateMany(
  { platform: 'codeforces' },
  { $set: { lastSyncedAt: new Date() } }
);
```

### 3. **Deletion**

```typescript
// Soft delete (preferred)
await this.contestModel.updateOne(
  { _id: id },
  { $set: { isActive: false } }
);

// Hard delete
await this.contestModel.deleteOne({ _id: id });
```

### 4. **Cleanup**

Scheduled job removes old data:

```typescript
// Delete finished contests older than 30 days
await this.contestModel.deleteMany({
  phase: 'FINISHED',
  endTime: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});
```

## Backup Strategy

### 1. **MongoDB Atlas Automated Backups**

- Continuous backups
- Point-in-time recovery
- Retention: 7 days (configurable)

### 2. **Manual Backups**

```bash
# Export database
mongodump --uri="mongodb://localhost:27017/codenotify" --out=./backup

# Import database
mongorestore --uri="mongodb://localhost:27017/codenotify" ./backup/codenotify
```

### 3. **Collection-Specific Backups**

```bash
# Export contests collection
mongoexport --uri="mongodb://localhost:27017/codenotify" \
  --collection=contests \
  --out=contests.json

# Import contests collection
mongoimport --uri="mongodb://localhost:27017/codenotify" \
  --collection=contests \
  --file=contests.json
```

## Monitoring

### Key Metrics

- **Connection Pool**: Monitor active/available connections
- **Query Performance**: Slow query log (>100ms)
- **Index Usage**: Track index hit rates
- **Storage Size**: Monitor database growth
- **Operation Latency**: Track read/write times

### MongoDB Compass

Visual tool for:
- Schema analysis
- Query performance
- Index recommendations
- Real-time monitoring

### Mongoose Debug Mode

```typescript
mongoose.set('debug', true); // Log all queries
```

## Scaling Strategies

### 1. **Vertical Scaling**

Increase server resources:
- More RAM for working set
- Faster CPU for queries
- SSD storage for I/O

### 2. **Horizontal Scaling**

**Read Replicas**:
- Distribute read load
- Geographic distribution
- High availability

**Sharding**:
- Partition data across servers
- Shard key: `platform` or `userId`
- Automatic balancing

### 3. **Caching**

- Redis for frequently accessed data
- In-memory cache for static data
- Query result caching

## Best Practices

### 1. **Schema Design**

✅ **Do**:
- Use appropriate data types
- Create necessary indexes
- Embed related data when possible
- Use enums for fixed values

❌ **Don't**:
- Over-normalize
- Create too many indexes
- Store large binary data
- Use arrays with unbounded growth

### 2. **Query Patterns**

✅ **Do**:
- Use indexes for filters
- Limit result sets
- Project only needed fields
- Use aggregation for complex queries

❌ **Don't**:
- Fetch entire collections
- Use regex without indexes
- Perform client-side filtering
- Chain multiple queries

### 3. **Connection Management**

✅ **Do**:
- Use connection pooling
- Handle connection errors
- Close connections gracefully
- Monitor pool metrics

❌ **Don't**:
- Create connections per request
- Ignore connection errors
- Leave connections open
- Exceed pool limits

## Related Documentation

- [User Schema](/server/database/user) - Detailed user schema
- [Contest Schema](/server/database/contest) - Detailed contest schema
- [Notification Schema](/server/database/notification) - Detailed notification schema
- [Indexes](/server/database/indexes) - Index optimization
- [System Architecture](/server/architecture) - Server architecture
