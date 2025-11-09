import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  Inject,
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

@Injectable()
export class ContestsService {
  private readonly logger = new Logger(ContestsService.name);
  private platformAdapters: Map<ContestPlatform, PlatformAdapter> = new Map();

  constructor(
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    @Inject(PLATFORM_ADAPTERS) adapters: PlatformAdapter[],
  ) {
    // Register all platform adapters
    adapters.forEach((adapter) => {
      this.platformAdapters.set(adapter.platformName, adapter);
      this.logger.log(`Registered platform adapter: ${adapter.platformName}`);
    });
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
  ): Promise<{ synced: number; updated: number; failed: number }> {
    this.logger.log(`Syncing contests from platform: ${platform}`);

    const adapter = this.platformAdapters.get(platform);
    if (!adapter) {
      throw new Error(`Platform ${platform} not registered or not enabled`);
    }

    try {
      const contests = await adapter.fetchContests();
      return await this.upsertContests(contests);
    } catch (error) {
      this.logger.error(
        `Failed to sync ${platform}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Sync contests from all registered platforms
   */
  async syncAllPlatforms(): Promise<
    Record<string, { synced: number; updated: number; failed: number }>
  > {
    this.logger.log('Syncing contests from all platforms');

    const results: Record<
      string,
      { synced: number; updated: number; failed: number }
    > = {};

    for (const [platform] of this.platformAdapters) {
      try {
        this.logger.log(`Syncing ${platform}...`);
        results[platform] = await this.syncPlatform(platform);
      } catch (error) {
        this.logger.error(
          `Failed to sync ${platform}: ${this.getErrorMessage(error)}`,
        );
        results[platform] = { synced: 0, updated: 0, failed: 0 };
      }
    }

    return results;
  }

  /**
   * Upsert contests into database (create or update)
   */
  private async upsertContests(
    contests: ContestData[],
  ): Promise<{ synced: number; updated: number; failed: number }> {
    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const contestData of contests) {
      try {
        const existing = await this.contestModel.findOne({
          platformId: contestData.platformId,
          platform: contestData.platform,
        });

        if (existing) {
          // Update existing contest
          await this.contestModel.updateOne(
            { _id: existing._id },
            { $set: { ...contestData, lastSyncedAt: new Date() } },
          );
          updated++;
        } else {
          // Create new contest
          await this.contestModel.create({
            ...contestData,
            lastSyncedAt: new Date(),
          });
          synced++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to upsert contest ${contestData.platformId}: ${this.getErrorMessage(error)}`,
        );
        failed++;
      }
    }

    this.logger.log(
      `Sync completed: ${synced} new, ${updated} updated, ${failed} failed`,
    );

    return { synced, updated, failed };
  }
}
