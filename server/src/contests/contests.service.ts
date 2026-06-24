import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  Contest,
  ContestDocument,
  ContestPlatform,
  DifficultyLevel,
  ContestType,
} from './schemas/contest.schema';
import {
  CreateContestDto,
  UpdateContestDto,
  ContestQueryDto,
  ContestStatsDto,
  PlatformStatsDto,
  BulkCreateContestDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
} from './dto/contest.dto';
import {
  PlatformAdapter,
  ContestData,
} from '../integrations/platforms/base/platform.interface';
import { PLATFORM_ADAPTERS } from '../integrations/platforms/platforms.module';
import { ConfigService } from '@nestjs/config';

// Type definitions for MongoDB aggregation results
interface AggregationStatsResult {
  _id: null;
  avgDuration: number;
  avgParticipants: number;
}

interface BreakdownResult {
  _id: string;
  count: number;
}

interface MongoTimeFilter {
  $gte?: Date;
  $lte?: Date;
}

interface ContestDocumentWithVirtuals extends ContestDocument {
  createdAt?: Date;
  updatedAt?: Date;
}

interface FilterQueryWithTime extends FilterQuery<ContestDocument> {
  startTime?: MongoTimeFilter;
}

interface SyncStats {
  synced: number;
  updated: number;
  failed: number;
  skipped?: boolean;
}

interface SyncOptions {
  forceSync?: boolean;
  source?: 'scheduler' | 'api' | 'manual';
}

interface SyncStateDocument {
  _id: string;
  lastCompletedAt?: Date;
  updatedAt?: Date;
}

interface SyncLockDocument {
  _id: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ContestsService {
  private readonly logger = new Logger(ContestsService.name);
  private platformAdapters: Map<ContestPlatform, PlatformAdapter> = new Map();

  constructor(
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    @Inject(PLATFORM_ADAPTERS) @Optional() adapters: PlatformAdapter[] = [],
    @Optional() private readonly configService?: ConfigService,
  ) {
    // Register all platform adapters
    adapters.forEach((adapter) => {
      this.platformAdapters.set(adapter.platformName, adapter);
      this.logger.log(`Registered platform adapter: ${adapter.platformName}`);
    });
  }

  private get platformSyncCooldownMs(): number {
    return (
      this.configService?.get<number>(
        'CONTEST_PLATFORM_SYNC_COOLDOWN_MS',
        10 * 60 * 1000,
      ) ?? 10 * 60 * 1000
    );
  }

  private get globalSyncCooldownMs(): number {
    return (
      this.configService?.get<number>(
        'CONTEST_GLOBAL_SYNC_COOLDOWN_MS',
        5 * 60 * 1000,
      ) ?? 5 * 60 * 1000
    );
  }

  private get lockTtlMs(): number {
    return (
      this.configService?.get<number>(
        'CONTEST_SYNC_LOCK_TTL_MS',
        30 * 60 * 1000,
      ) ?? 30 * 60 * 1000
    );
  }

  private get syncStateCollection() {
    return this.contestModel.db.collection<SyncStateDocument>(
      'contest_sync_state',
    );
  }

  private get syncLockCollection() {
    return this.contestModel.db.collection<SyncLockDocument>(
      'contest_sync_locks',
    );
  }

  private hasMongoCollectionAccess(): boolean {
    return Boolean(
      this.contestModel &&
      this.contestModel.db &&
      typeof this.contestModel.db.collection === 'function',
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    return undefined;
  }

  // CRUD Operations
  async create(
    createContestDto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    try {
      // Check for duplicate contest (same platformId + platform)
      const existingContest = await this.contestModel.findOne({
        platformId: createContestDto.platformId,
        platform: createContestDto.platform,
      });

      if (existingContest) {
        throw new ConflictException(
          `Contest with platformId ${createContestDto.platformId} already exists for ${createContestDto.platform}`,
        );
      }

      const contest = new this.contestModel({
        ...createContestDto,
        lastSyncedAt: new Date(),
      });

      const savedContest = await contest.save();
      this.logger.log(
        `Created contest: ${savedContest.name} (${savedContest.platform})`,
      );

      return this.transformToResponseDto(savedContest);
    } catch (error) {
      this.logger.error(
        `Failed to create contest: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async bulkCreate(
    bulkCreateDto: BulkCreateContestDto,
  ): Promise<ContestResponseDto[]> {
    try {
      const contests = bulkCreateDto.contests.map((contest) => ({
        ...contest,
        lastSyncedAt: new Date(),
      }));

      // Use insertMany with ordered: false to continue on duplicates
      const savedContests = await this.contestModel.insertMany(contests, {
        ordered: false,
        rawResult: false,
      });

      this.logger.log(`Bulk created ${savedContests.length} contests`);
      return savedContests.map((contest) =>
        this.transformToResponseDto(contest),
      );
    } catch (error) {
      this.logger.error(
        `Failed to bulk create contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findAll(query: ContestQueryDto): Promise<PaginatedContestResponseDto> {
    try {
      const filter = this.buildFilterQuery(query);
      const sortOptions = this.buildSortOptions(query.sortBy, query.sortOrder);

      const [contests, total] = await Promise.all([
        this.contestModel
          .find(filter)
          .sort(sortOptions)
          .skip(query.offset)
          .limit(query.limit)
          .exec(),
        this.contestModel.countDocuments(filter),
      ]);

      const data = contests.map((contest) =>
        this.transformToResponseDto(contest),
      );

      return {
        data,
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasNext: query.offset + query.limit < total,
          hasPrev: query.offset > 0,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to find contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ContestResponseDto> {
    try {
      const contest = await this.contestModel.findById(id).exec();

      if (!contest) {
        throw new NotFoundException(`Contest with ID ${id} not found`);
      }

      return this.transformToResponseDto(contest);
    } catch (error) {
      this.logger.error(
        `Failed to find contest by ID ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findByPlatformId(
    platformId: string,
    platform: ContestPlatform,
  ): Promise<ContestResponseDto | null> {
    try {
      const contest = await this.contestModel
        .findOne({ platformId, platform })
        .exec();
      return contest ? this.transformToResponseDto(contest) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find contest by platform ID: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateContestDto: UpdateContestDto,
  ): Promise<ContestResponseDto> {
    try {
      const contest = await this.contestModel
        .findByIdAndUpdate(id, updateContestDto, { new: true })
        .exec();

      if (!contest) {
        throw new NotFoundException(`Contest with ID ${id} not found`);
      }

      this.logger.log(`Updated contest: ${contest.name} (${contest.platform})`);
      return this.transformToResponseDto(contest);
    } catch (error) {
      this.logger.error(
        `Failed to update contest ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.contestModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Contest with ID ${id} not found`);
      }

      this.logger.log(`Deleted contest: ${result.name} (${result.platform})`);
    } catch (error) {
      this.logger.error(
        `Failed to delete contest ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  // Platform-specific operations
  async findByPlatform(
    platform: ContestPlatform,
    query?: Partial<ContestQueryDto>,
  ): Promise<ContestResponseDto[]> {
    try {
      const filter: FilterQuery<ContestDocument> = { platform, isActive: true };

      if (query?.phase) filter.phase = query.phase;
      if (query?.type) filter.type = query.type;
      if (query?.difficulty) filter.difficulty = query.difficulty;

      const contests = await this.contestModel
        .find(filter)
        .sort({ startTime: 1 })
        .limit(query?.limit || 50)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to find contests by platform ${platform}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findUpcoming(
    platform?: ContestPlatform,
  ): Promise<ContestResponseDto[]> {
    try {
      const filter: FilterQuery<ContestDocument> = {
        startTime: { $gt: new Date() },
        isActive: true,
      };

      if (platform) filter.platform = platform;

      const contests = await this.contestModel
        .find(filter)
        .sort({ startTime: 1 })
        .limit(50)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to find upcoming contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findRunning(platform?: ContestPlatform): Promise<ContestResponseDto[]> {
    try {
      const now = new Date();
      const filter: FilterQuery<ContestDocument> = {
        startTime: { $lte: now },
        endTime: { $gte: now },
        isActive: true,
      };

      if (platform) filter.platform = platform;

      const contests = await this.contestModel
        .find(filter)
        .sort({ startTime: 1 })
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to find running contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async findFinished(
    platform?: ContestPlatform,
  ): Promise<ContestResponseDto[]> {
    try {
      const filter: FilterQuery<ContestDocument> = {
        endTime: { $lt: new Date() },
        isActive: true,
      };

      if (platform) filter.platform = platform;

      const contests = await this.contestModel
        .find(filter)
        .sort({ endTime: -1 })
        .limit(50)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to find finished contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  // Search and filtering
  async searchContests(searchQuery: string): Promise<ContestResponseDto[]> {
    try {
      const contests = await this.contestModel
        .find(
          {
            $text: { $search: searchQuery },
            isActive: true,
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to search contests: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async filterByDifficulty(
    difficulty: DifficultyLevel,
  ): Promise<ContestResponseDto[]> {
    try {
      const contests = await this.contestModel
        .find({ difficulty, isActive: true })
        .sort({ startTime: 1 })
        .limit(50)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to filter by difficulty: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async filterByType(type: ContestType): Promise<ContestResponseDto[]> {
    try {
      const contests = await this.contestModel
        .find({ type, isActive: true })
        .sort({ startTime: 1 })
        .limit(50)
        .exec();

      return contests.map((contest) => this.transformToResponseDto(contest));
    } catch (error) {
      this.logger.error(
        `Failed to filter by type: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  // Analytics and statistics
  async getContestStats(): Promise<ContestStatsDto> {
    try {
      const now = new Date();

      const [
        totalContests,
        upcomingContests,
        runningContests,
        finishedContests,
        platformBreakdown,
        typeBreakdown,
        difficultyBreakdown,
      ] = await Promise.all([
        this.contestModel.countDocuments({ isActive: true }),
        this.contestModel.countDocuments({
          startTime: { $gt: now },
          isActive: true,
        }),
        this.contestModel.countDocuments({
          startTime: { $lte: now },
          endTime: { $gte: now },
          isActive: true,
        }),
        this.contestModel.countDocuments({
          endTime: { $lt: now },
          isActive: true,
        }),
        this.contestModel.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$platform', count: { $sum: 1 } } },
        ]),
        this.contestModel.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        this.contestModel.aggregate([
          { $match: { isActive: true, difficulty: { $exists: true } } },
          { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        ]),
      ]);

      return {
        totalContests,
        upcomingContests,
        runningContests,
        finishedContests,
        platformBreakdown: this.transformBreakdown(
          platformBreakdown as BreakdownResult[],
        ),
        typeBreakdown: this.transformBreakdown(
          typeBreakdown as BreakdownResult[],
        ),
        difficultyBreakdown: this.transformBreakdown(
          difficultyBreakdown as BreakdownResult[],
        ),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get contest stats: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async getPlatformStats(platform: ContestPlatform): Promise<PlatformStatsDto> {
    try {
      const now = new Date();
      const filter = { platform, isActive: true };

      const [
        totalContests,
        upcomingContests,
        runningContests,
        finishedContests,
        avgStats,
        lastSync,
      ] = await Promise.all([
        this.contestModel.countDocuments(filter),
        this.contestModel.countDocuments({
          ...filter,
          startTime: { $gt: now },
        }),
        this.contestModel.countDocuments({
          ...filter,
          startTime: { $lte: now },
          endTime: { $gte: now },
        }),
        this.contestModel.countDocuments({ ...filter, endTime: { $lt: now } }),
        this.contestModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: '$durationMinutes' },
              avgParticipants: { $avg: '$participantCount' },
            },
          },
        ]),
        this.contestModel
          .findOne(filter, { lastSyncedAt: 1 })
          .sort({ lastSyncedAt: -1 }),
      ]);

      return {
        platform,
        totalContests,
        upcomingContests,
        runningContests,
        finishedContests,
        averageDuration:
          (avgStats[0] as AggregationStatsResult)?.avgDuration ?? 0,
        averageParticipants:
          (avgStats[0] as AggregationStatsResult)?.avgParticipants ?? 0,
        lastSyncTime: lastSync?.lastSyncedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get platform stats for ${platform}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  // Utility methods
  private buildFilterQuery(
    query: ContestQueryDto,
  ): FilterQuery<ContestDocument> {
    const filter: FilterQueryWithTime = {};

    if (query.platform) filter.platform = query.platform;
    if (query.phase) filter.phase = query.phase;
    if (query.type) filter.type = query.type;
    if (query.difficulty) filter.difficulty = query.difficulty;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.isNotified !== undefined) filter.isNotified = query.isNotified;
    if (query.country) filter.country = query.country;
    if (query.city) filter.city = query.city;

    if (query.startDate || query.endDate) {
      const timeFilter: MongoTimeFilter = {};
      if (query.startDate) timeFilter.$gte = query.startDate;
      if (query.endDate) timeFilter.$lte = query.endDate;
      filter.startTime = timeFilter;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return filter;
  }

  private buildSortOptions(
    sortBy: string,
    sortOrder: string,
  ): Record<string, 1 | -1> {
    const order = sortOrder === 'desc' ? -1 : 1;
    return { [sortBy]: order } as Record<string, 1 | -1>;
  }

  private transformToResponseDto(contest: ContestDocument): ContestResponseDto {
    return {
      id: String(contest._id),
      platformId: contest.platformId,
      name: contest.name,
      platform: contest.platform,
      phase: contest.phase,
      type: contest.type,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      description: contest.description,
      websiteUrl: contest.websiteUrl,
      registrationUrl: contest.registrationUrl,
      preparedBy: contest.preparedBy,
      difficulty: contest.difficulty,
      participantCount: contest.participantCount,
      problemCount: contest.problemCount,
      country: contest.country,
      city: contest.city,
      platformMetadata: contest.platformMetadata,
      isActive: contest.isActive,
      isNotified: contest.isNotified,
      lastSyncedAt: contest.lastSyncedAt,
      createdAt:
        (contest as ContestDocumentWithVirtuals).createdAt ?? new Date(),
      updatedAt:
        (contest as ContestDocumentWithVirtuals).updatedAt ?? new Date(),
      // Virtual fields will be automatically included if configured in schema
    };
  }

  private transformBreakdown(
    breakdown: BreakdownResult[],
  ): Record<string, number> {
    return breakdown.reduce(
      (acc: Record<string, number>, item: BreakdownResult) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Sync contests from a specific platform using the adapter
   */
  async syncPlatform(
    platform: ContestPlatform,
    options: SyncOptions = {},
  ): Promise<SyncStats> {
    const source = options.source ?? 'api';
    this.logger.log(
      `Syncing contests from platform: ${platform} (source: ${source})`,
    );

    const adapter = this.platformAdapters.get(platform);
    if (!adapter) {
      throw new Error(`Platform ${platform} not registered or not enabled`);
    }

    const scope = `platform:${platform}`;

    if (
      !options.forceSync &&
      (await this.isInCooldown(scope, this.platformSyncCooldownMs))
    ) {
      this.logger.warn(
        `Skipping ${platform} sync due to cooldown (source: ${source})`,
      );
      return { synced: 0, updated: 0, failed: 0, skipped: true };
    }

    const lockToken = await this.acquireLock(scope);
    if (!lockToken) {
      this.logger.warn(
        `Skipping ${platform} sync because a sync is already running`,
      );
      return { synced: 0, updated: 0, failed: 0, skipped: true };
    }

    try {
      const contests = await adapter.fetchContests();
      const stats = await this.upsertContests(contests);
      await this.markSyncCompleted(scope);
      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to sync ${platform}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    } finally {
      await this.releaseLock(scope, lockToken);
    }
  }

  /**
   * Sync contests from all registered platforms
   */
  async syncAllPlatforms(): Promise<Record<string, SyncStats>> {
    return this.syncAllPlatformsWithOptions({ source: 'api' });
  }

  async syncAllPlatformsWithOptions(
    options: SyncOptions = {},
  ): Promise<Record<string, SyncStats>> {
    const source = options.source ?? 'api';
    this.logger.log(`Syncing contests from all platforms (source: ${source})`);

    if (
      !options.forceSync &&
      (await this.isInCooldown('all', this.globalSyncCooldownMs))
    ) {
      this.logger.warn('Skipping all-platform sync due to global cooldown');
      return Object.fromEntries(
        [...this.platformAdapters.keys()].map((platform) => [
          platform,
          { synced: 0, updated: 0, failed: 0, skipped: true },
        ]),
      );
    }

    const globalLockToken = await this.acquireLock('all');
    if (!globalLockToken) {
      this.logger.warn(
        'Skipping all-platform sync because another run is active',
      );
      return Object.fromEntries(
        [...this.platformAdapters.keys()].map((platform) => [
          platform,
          { synced: 0, updated: 0, failed: 0, skipped: true },
        ]),
      );
    }

    const results: Record<string, SyncStats> = {};

    try {
      for (const [platform] of this.platformAdapters) {
        try {
          this.logger.log(`Syncing ${platform}...`);
          results[platform] = await this.syncPlatform(platform, {
            forceSync: options.forceSync,
            source,
          });
        } catch (error) {
          this.logger.error(
            `Failed to sync ${platform}: ${this.getErrorMessage(error)}`,
          );
          results[platform] = { synced: 0, updated: 0, failed: 0 };
        }
      }

      await this.markSyncCompleted('all');
      return results;
    } finally {
      await this.releaseLock('all', globalLockToken);
    }
  }

  /**
   * Upsert contests into database (create or update)
   */
  private async upsertContests(contests: ContestData[]): Promise<SyncStats> {
    if (contests.length === 0) {
      return { synced: 0, updated: 0, failed: 0 };
    }

    let synced = 0;
    let updated = 0;
    let failed = 0;

    const now = new Date();
    const deduped = new Map<string, ContestData>();

    for (const contest of contests) {
      const key = `${contest.platform}:${contest.platformId}`;
      deduped.set(key, contest);
    }

    const dedupedContests = [...deduped.values()];
    const identityFilter = dedupedContests.map((contest) => ({
      platform: contest.platform,
      platformId: contest.platformId,
    }));

    const existingContests = await this.contestModel
      .find({ $or: identityFilter })
      .exec();

    const existingByKey = new Map<string, ContestDocument>();
    for (const existing of existingContests) {
      existingByKey.set(
        `${existing.platform}:${existing.platformId}`,
        existing,
      );
    }

    const operations: Parameters<typeof this.contestModel.bulkWrite>[0] = [];

    for (const contestData of dedupedContests) {
      try {
        const normalized = this.normalizeContestData(contestData);
        const key = `${normalized.platform}:${normalized.platformId}`;
        const existing = existingByKey.get(key);

        if (!existing) {
          operations.push({
            updateOne: {
              filter: {
                platform: normalized.platform,
                platformId: normalized.platformId,
              },
              update: {
                $setOnInsert: {
                  ...normalized,
                  lastSyncedAt: now,
                },
              },
              upsert: true,
            },
          });
          continue;
        }

        if (!this.hasContestChanged(existing, normalized)) {
          continue;
        }

        operations.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: {
                ...normalized,
                lastSyncedAt: now,
              },
            },
          },
        });
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to stage upsert for contest ${contestData.platformId}: ${this.getErrorMessage(error)}`,
        );
      }
    }

    if (operations.length === 0) {
      this.logger.log('Sync completed: no data changes detected');
      return { synced: 0, updated: 0, failed };
    }

    try {
      const bulkResult = await this.contestModel.bulkWrite(operations, {
        ordered: false,
      });

      synced = bulkResult.upsertedCount ?? 0;
      updated = bulkResult.modifiedCount ?? 0;
    } catch (error) {
      failed += operations.length;
      this.logger.error(`Bulk upsert failed: ${this.getErrorMessage(error)}`);
      if (error && typeof error === 'object' && 'writeErrors' in error) {
        const writeErrors = (error as { writeErrors?: unknown[] }).writeErrors;
        failed = writeErrors?.length ?? failed;
      }
    }

    this.logger.log(
      `Sync completed: ${synced} new, ${updated} updated, ${failed} failed`,
    );

    return { synced, updated, failed };
  }

  async cleanupOldFinishedContests(cutoffDate: Date): Promise<number> {
    const result = await this.contestModel.deleteMany({
      endTime: { $lt: cutoffDate },
      phase: 'FINISHED',
    });

    return result.deletedCount ?? 0;
  }

  async findUpcomingForNotificationWindow(
    now: Date,
    windowEnd: Date,
  ): Promise<ContestDocument[]> {
    return this.contestModel
      .find({
        startTime: {
          $gte: now,
          $lte: windowEnd,
        },
        phase: 'BEFORE',
        isActive: true,
        isNotified: false,
      })
      .exec();
  }

  async markContestsAsNotified(contestIds: string[]): Promise<void> {
    if (contestIds.length === 0) {
      return;
    }

    await this.contestModel.updateMany(
      { _id: { $in: contestIds } },
      {
        $set: {
          isNotified: true,
        },
      },
    );
  }

  private normalizeContestData(contest: ContestData): ContestData {
    return {
      ...contest,
      participantCount: contest.participantCount ?? 0,
      problemCount: contest.problemCount ?? 0,
      platformMetadata: contest.platformMetadata ?? {},
      isActive: contest.isActive ?? true,
    };
  }

  private hasContestChanged(
    existing: ContestDocument,
    incoming: ContestData,
  ): boolean {
    const existingComparable = {
      name: existing.name,
      platform: existing.platform,
      phase: existing.phase,
      type: existing.type,
      startTime: existing.startTime?.getTime(),
      endTime: existing.endTime?.getTime(),
      durationMinutes: existing.durationMinutes,
      description: existing.description ?? null,
      websiteUrl: existing.websiteUrl ?? null,
      registrationUrl: existing.registrationUrl ?? null,
      preparedBy: existing.preparedBy ?? null,
      difficulty: existing.difficulty ?? null,
      participantCount: existing.participantCount ?? 0,
      problemCount: existing.problemCount ?? 0,
      country: existing.country ?? null,
      city: existing.city ?? null,
      platformMetadata: this.stableStringify(existing.platformMetadata ?? {}),
      isActive: existing.isActive,
    };

    const incomingComparable = {
      name: incoming.name,
      platform: incoming.platform,
      phase: incoming.phase,
      type: incoming.type,
      startTime: incoming.startTime?.getTime(),
      endTime: incoming.endTime?.getTime(),
      durationMinutes: incoming.durationMinutes,
      description: incoming.description ?? null,
      websiteUrl: incoming.websiteUrl ?? null,
      registrationUrl: incoming.registrationUrl ?? null,
      preparedBy: incoming.preparedBy ?? null,
      difficulty: incoming.difficulty ?? null,
      participantCount: incoming.participantCount ?? 0,
      problemCount: incoming.problemCount ?? 0,
      country: incoming.country ?? null,
      city: incoming.city ?? null,
      platformMetadata: this.stableStringify(incoming.platformMetadata ?? {}),
      isActive: incoming.isActive ?? true,
    };

    return (
      this.stableStringify(existingComparable) !==
      this.stableStringify(incomingComparable)
    );
  }

  private stableStringify(value: unknown): string {
    return JSON.stringify(this.sortForStableJson(value));
  }

  private sortForStableJson(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortForStableJson(item));
    }

    if (!value || typeof value !== 'object' || value instanceof Date) {
      return value;
    }

    const record = value as Record<string, unknown>;

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = this.sortForStableJson(record[key]);
        return acc;
      }, {});
  }

  private async isInCooldown(
    scope: string,
    cooldownMs: number,
  ): Promise<boolean> {
    if (!this.hasMongoCollectionAccess()) {
      return false;
    }

    if (cooldownMs <= 0) {
      return false;
    }

    const state = await this.syncStateCollection.findOne({ _id: scope });
    if (!state?.lastCompletedAt) {
      return false;
    }

    return Date.now() - new Date(state.lastCompletedAt).getTime() < cooldownMs;
  }

  private async markSyncCompleted(scope: string): Promise<void> {
    if (!this.hasMongoCollectionAccess()) {
      return;
    }

    const now = new Date();
    await this.syncStateCollection.updateOne(
      { _id: scope },
      {
        $set: {
          lastCompletedAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }

  private async acquireLock(scope: string): Promise<string | null> {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (!this.hasMongoCollectionAccess()) {
      return token;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.lockTtlMs);

    try {
      await this.syncLockCollection.insertOne({
        _id: scope,
        token,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });
      return token;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const renewed = await this.syncLockCollection.findOneAndUpdate(
          {
            _id: scope,
            expiresAt: { $lte: now },
          },
          {
            $set: {
              token,
              expiresAt,
              updatedAt: now,
            },
          },
          {
            returnDocument: 'after',
          },
        );

        if (renewed?.token === token) {
          return token;
        }

        return null;
      }

      this.logger.error(
        `Failed to acquire lock for scope ${scope}: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  private async releaseLock(scope: string, token: string): Promise<void> {
    if (!this.hasMongoCollectionAccess()) {
      return;
    }

    await this.syncLockCollection.deleteOne({
      _id: scope,
      token,
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    return 'code' in error && (error as { code?: number }).code === 11000;
  }
}
