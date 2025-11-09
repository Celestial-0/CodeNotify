import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from './schemas/contest.schema';
import {
  CreateContestDto,
  UpdateContestDto,
  ContestQueryDto,
  BulkCreateContestDto,
  SyncRequestDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
  ContestStatsDto,
  PlatformStatsDto,
} from './dto/contest.dto';

describe('ContestsController', () => {
  let controller: ContestsController;
  let contestsService: jest.Mocked<ContestsService>;

  const mockContestResponse: ContestResponseDto = {
    id: '507f1f77bcf86cd799439011',
    platformId: 'test-123',
    name: 'Test Contest',
    platform: ContestPlatform.CODEFORCES,
    phase: ContestPhase.BEFORE,
    type: ContestType.CF,
    startTime: new Date('2024-12-01T10:00:00Z'),
    endTime: new Date('2024-12-01T12:00:00Z'),
    durationMinutes: 120,
    description: 'Test description',
    websiteUrl: 'https://codeforces.com/contest/123',
    registrationUrl: 'https://codeforces.com/contest/123/register',
    difficulty: DifficultyLevel.MEDIUM,
    participantCount: 1000,
    problemCount: 5,
    platformMetadata: {},
    isActive: true,
    isNotified: false,
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByPlatform: jest.fn(),
      findUpcoming: jest.fn(),
      findRunning: jest.fn(),
      findFinished: jest.fn(),
      searchContests: jest.fn(),
      filterByDifficulty: jest.fn(),
      filterByType: jest.fn(),
      getContestStats: jest.fn(),
      getPlatformStats: jest.fn(),
      syncPlatform: jest.fn(),
      syncAllPlatforms: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestsController],
      providers: [
        {
          provide: ContestsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ContestsController>(ContestsController);
    contestsService = module.get(ContestsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = controller.healthCheck();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    const createDto: CreateContestDto = {
      platformId: 'test-123',
      name: 'New Contest',
      platform: ContestPlatform.CODEFORCES,
      phase: ContestPhase.BEFORE,
      type: ContestType.CF,
      startTime: new Date('2024-12-01T10:00:00Z'),
      endTime: new Date('2024-12-01T12:00:00Z'),
      durationMinutes: 120,
      isActive: true,
    };

    it('should create a new contest', async () => {
      contestsService.create.mockResolvedValue(mockContestResponse);

      const result = await controller.create(createDto);

      expect(contestsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockContestResponse);
    });

    it('should handle service errors', async () => {
      contestsService.create.mockRejectedValue(new Error('Create failed'));

      await expect(controller.create(createDto)).rejects.toThrow(
        'Create failed',
      );
    });
  });

  describe('bulkCreate', () => {
    const bulkDto: BulkCreateContestDto = {
      contests: [
        {
          platformId: 'test-1',
          name: 'Contest 1',
          platform: ContestPlatform.CODEFORCES,
          phase: ContestPhase.BEFORE,
          type: ContestType.CF,
          startTime: new Date('2024-12-01T10:00:00Z'),
          endTime: new Date('2024-12-01T12:00:00Z'),
          durationMinutes: 120,
          isActive: true,
        },
      ],
    };

    it('should bulk create contests', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.bulkCreate.mockResolvedValue(mockResponses);

      const result = await controller.bulkCreate(bulkDto);

      expect(contestsService.bulkCreate).toHaveBeenCalledWith(bulkDto);
      expect(result).toEqual(mockResponses);
    });

    it('should handle bulk create errors', async () => {
      contestsService.bulkCreate.mockRejectedValue(
        new Error('Bulk create failed'),
      );

      await expect(controller.bulkCreate(bulkDto)).rejects.toThrow(
        'Bulk create failed',
      );
    });
  });

  describe('findAll', () => {
    const query: ContestQueryDto = {
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortOrder: 'asc',
    };

    it('should return paginated contests', async () => {
      const mockPaginatedResponse: PaginatedContestResponseDto = {
        data: [mockContestResponse],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      contestsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(contestsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle query errors', async () => {
      contestsService.findAll.mockRejectedValue(new Error('Query failed'));

      await expect(controller.findAll(query)).rejects.toThrow('Query failed');
    });
  });

  describe('findById', () => {
    const testId = '507f1f77bcf86cd799439011';

    it('should find contest by id', async () => {
      contestsService.findById.mockResolvedValue(mockContestResponse);

      const result = await controller.findById(testId);

      expect(contestsService.findById).toHaveBeenCalledWith(testId);
      expect(result).toEqual(mockContestResponse);
    });

    it('should handle not found errors', async () => {
      contestsService.findById.mockRejectedValue(
        new Error('Contest not found'),
      );

      await expect(controller.findById(testId)).rejects.toThrow(
        'Contest not found',
      );
    });
  });

  describe('update', () => {
    const testId = '507f1f77bcf86cd799439011';
    const updateDto: UpdateContestDto = {
      name: 'Updated Contest',
      phase: ContestPhase.CODING,
    };

    it('should update contest', async () => {
      const updatedContest = { ...mockContestResponse, ...updateDto };
      contestsService.update.mockResolvedValue(updatedContest);

      const result = await controller.update(testId, updateDto);

      expect(contestsService.update).toHaveBeenCalledWith(testId, updateDto);
      expect(result).toEqual(updatedContest);
    });

    it('should handle update errors', async () => {
      contestsService.update.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update(testId, updateDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('delete', () => {
    const testId = '507f1f77bcf86cd799439011';

    it('should delete contest', async () => {
      contestsService.delete.mockResolvedValue(undefined);

      await controller.delete(testId);

      expect(contestsService.delete).toHaveBeenCalledWith(testId);
    });

    it('should handle delete errors', async () => {
      contestsService.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.delete(testId)).rejects.toThrow('Delete failed');
    });
  });

  describe('findByPlatform', () => {
    const query: ContestQueryDto = {
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortOrder: 'asc',
    };

    it('should find contests by platform', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findByPlatform.mockResolvedValue(mockResponses);

      const result = await controller.findByPlatform(
        ContestPlatform.CODEFORCES,
        query,
      );

      expect(contestsService.findByPlatform).toHaveBeenCalledWith(
        ContestPlatform.CODEFORCES,
        query,
      );
      expect(result).toEqual(mockResponses);
    });

    it('should handle platform query errors', async () => {
      contestsService.findByPlatform.mockRejectedValue(
        new Error('Platform query failed'),
      );

      await expect(
        controller.findByPlatform(ContestPlatform.LEETCODE, query),
      ).rejects.toThrow('Platform query failed');
    });
  });

  describe('getUpcomingContests', () => {
    it('should get upcoming contests for all platforms', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findUpcoming.mockResolvedValue(mockResponses);

      const result = await controller.getUpcomingContests();

      expect(contestsService.findUpcoming).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponses);
    });

    it('should get upcoming contests for specific platform', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findUpcoming.mockResolvedValue(mockResponses);

      const result = await controller.getUpcomingContests(
        ContestPlatform.CODECHEF,
      );

      expect(contestsService.findUpcoming).toHaveBeenCalledWith(
        ContestPlatform.CODECHEF,
      );
      expect(result).toEqual(mockResponses);
    });

    it('should handle upcoming query errors', async () => {
      contestsService.findUpcoming.mockRejectedValue(new Error('Query failed'));

      await expect(controller.getUpcomingContests()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getRunningContests', () => {
    it('should get running contests for all platforms', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findRunning.mockResolvedValue(mockResponses);

      const result = await controller.getRunningContests();

      expect(contestsService.findRunning).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponses);
    });

    it('should get running contests for specific platform', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findRunning.mockResolvedValue(mockResponses);

      const result = await controller.getRunningContests(
        ContestPlatform.ATCODER,
      );

      expect(contestsService.findRunning).toHaveBeenCalledWith(
        ContestPlatform.ATCODER,
      );
      expect(result).toEqual(mockResponses);
    });

    it('should handle running query errors', async () => {
      contestsService.findRunning.mockRejectedValue(new Error('Query failed'));

      await expect(controller.getRunningContests()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getFinishedContests', () => {
    it('should get finished contests for all platforms', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findFinished.mockResolvedValue(mockResponses);

      const result = await controller.getFinishedContests();

      expect(contestsService.findFinished).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponses);
    });

    it('should get finished contests for specific platform', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.findFinished.mockResolvedValue(mockResponses);

      const result = await controller.getFinishedContests(
        ContestPlatform.LEETCODE,
      );

      expect(contestsService.findFinished).toHaveBeenCalledWith(
        ContestPlatform.LEETCODE,
      );
      expect(result).toEqual(mockResponses);
    });

    it('should handle finished query errors', async () => {
      contestsService.findFinished.mockRejectedValue(new Error('Query failed'));

      await expect(controller.getFinishedContests()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('searchContests', () => {
    it('should search contests with valid query', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.searchContests.mockResolvedValue(mockResponses);

      const result = await controller.searchContests('test query');

      expect(contestsService.searchContests).toHaveBeenCalledWith('test query');
      expect(result).toEqual(mockResponses);
    });

    it('should throw BadRequestException for empty query', async () => {
      await expect(controller.searchContests('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.searchContests('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for undefined query', async () => {
      await expect(controller.searchContests(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle search errors', async () => {
      contestsService.searchContests.mockRejectedValue(
        new Error('Search failed'),
      );

      await expect(controller.searchContests('test')).rejects.toThrow(
        'Search failed',
      );
    });
  });

  describe('filterByDifficulty', () => {
    it('should filter contests by difficulty', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.filterByDifficulty.mockResolvedValue(mockResponses);

      const result = await controller.filterByDifficulty(
        DifficultyLevel.MEDIUM,
      );

      expect(contestsService.filterByDifficulty).toHaveBeenCalledWith(
        DifficultyLevel.MEDIUM,
      );
      expect(result).toEqual(mockResponses);
    });

    it('should handle filter errors', async () => {
      contestsService.filterByDifficulty.mockRejectedValue(
        new Error('Filter failed'),
      );

      await expect(
        controller.filterByDifficulty(DifficultyLevel.HARD),
      ).rejects.toThrow('Filter failed');
    });
  });

  describe('filterByType', () => {
    it('should filter contests by type', async () => {
      const mockResponses = [mockContestResponse];
      contestsService.filterByType.mockResolvedValue(mockResponses);

      const result = await controller.filterByType(ContestType.CF);

      expect(contestsService.filterByType).toHaveBeenCalledWith(ContestType.CF);
      expect(result).toEqual(mockResponses);
    });

    it('should handle filter errors', async () => {
      contestsService.filterByType.mockRejectedValue(
        new Error('Filter failed'),
      );

      await expect(controller.filterByType(ContestType.WEEKLY)).rejects.toThrow(
        'Filter failed',
      );
    });
  });

  describe('getContestStats', () => {
    it('should return contest statistics', async () => {
      const mockStats: ContestStatsDto = {
        totalContests: 100,
        upcomingContests: 30,
        runningContests: 5,
        finishedContests: 65,
        platformBreakdown: {
          [ContestPlatform.CODEFORCES]: 50,
          [ContestPlatform.LEETCODE]: 50,
        },
        typeBreakdown: {
          [ContestType.CF]: 40,
          [ContestType.WEEKLY]: 60,
        },
        difficultyBreakdown: {
          [DifficultyLevel.EASY]: 30,
          [DifficultyLevel.MEDIUM]: 50,
          [DifficultyLevel.HARD]: 20,
        },
      };

      contestsService.getContestStats.mockResolvedValue(mockStats);

      const result = await controller.getContestStats();

      expect(contestsService.getContestStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should handle stats errors', async () => {
      contestsService.getContestStats.mockRejectedValue(
        new Error('Stats failed'),
      );

      await expect(controller.getContestStats()).rejects.toThrow(
        'Stats failed',
      );
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform-specific statistics', async () => {
      const mockStats: PlatformStatsDto = {
        platform: ContestPlatform.CODEFORCES,
        totalContests: 50,
        upcomingContests: 20,
        runningContests: 3,
        finishedContests: 27,
        averageDuration: 120,
        averageParticipants: 1000,
        lastSyncTime: new Date(),
      };

      contestsService.getPlatformStats.mockResolvedValue(mockStats);

      const result = await controller.getPlatformStats(
        ContestPlatform.CODEFORCES,
      );

      expect(contestsService.getPlatformStats).toHaveBeenCalledWith(
        ContestPlatform.CODEFORCES,
      );
      expect(result).toEqual(mockStats);
    });

    it('should handle platform stats errors', async () => {
      contestsService.getPlatformStats.mockRejectedValue(
        new Error('Platform stats failed'),
      );

      await expect(
        controller.getPlatformStats(ContestPlatform.LEETCODE),
      ).rejects.toThrow('Platform stats failed');
    });
  });

  describe('syncPlatform', () => {
    const syncRequest: SyncRequestDto = {
      platform: ContestPlatform.CODEFORCES,
      forceSync: false,
    };

    it('should sync specific platform', async () => {
      const mockResult = { synced: 5, updated: 3, failed: 0 };
      contestsService.syncPlatform.mockResolvedValue(mockResult);

      const result = await controller.syncPlatform(
        ContestPlatform.CODEFORCES,
        syncRequest,
      );

      expect(contestsService.syncPlatform).toHaveBeenCalledWith(
        ContestPlatform.CODEFORCES,
      );
      expect(result).toEqual({
        message: `Sync completed for ${ContestPlatform.CODEFORCES}`,
        platform: ContestPlatform.CODEFORCES,
        ...mockResult,
      });
    });

    it('should handle sync errors', async () => {
      contestsService.syncPlatform.mockRejectedValue(new Error('Sync failed'));

      await expect(
        controller.syncPlatform(ContestPlatform.LEETCODE, syncRequest),
      ).rejects.toThrow('Sync failed');
    });
  });

  describe('syncAllPlatforms', () => {
    it('should sync all platforms', async () => {
      const mockResults = {
        [ContestPlatform.CODEFORCES]: { synced: 5, updated: 3, failed: 0 },
        [ContestPlatform.LEETCODE]: { synced: 2, updated: 1, failed: 0 },
      };

      contestsService.syncAllPlatforms.mockResolvedValue(mockResults);

      const result = await controller.syncAllPlatforms();

      expect(contestsService.syncAllPlatforms).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Sync completed for all platforms',
        results: mockResults,
      });
    });

    it('should handle sync all errors', async () => {
      contestsService.syncAllPlatforms.mockRejectedValue(
        new Error('Sync all failed'),
      );

      await expect(controller.syncAllPlatforms()).rejects.toThrow(
        'Sync all failed',
      );
    });
  });
});
