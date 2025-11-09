import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ContestSchedulerService } from './contest-scheduler.service';
import { ContestsService } from './contests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SCHEDULER, NOTIFICATIONS } from '../common/common.constants';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  ContestDocument,
} from './schemas/contest.schema';

// Mock types for testing
interface DeleteManyFilter {
  endTime: { $lt: Date };
  phase: string;
}

interface FindContestFilter {
  startTime: {
    $gte: Date;
    $lte: Date;
  };
  phase: string;
  isActive: boolean;
}

interface DeleteManyResult {
  deletedCount: number;
}

interface MockContestModel {
  find: jest.Mock<Promise<ContestDocument[]>, [FindContestFilter]> & {
    mockReturnValue: (value: { exec: jest.Mock }) => MockContestModel['find'];
    mockResolvedValue: (value: ContestDocument[]) => MockContestModel['find'];
  };
  deleteMany: jest.Mock<Promise<DeleteManyResult>, [DeleteManyFilter]> & {
    mockResolvedValue: (
      value: DeleteManyResult,
    ) => MockContestModel['deleteMany'];
  };
}

// Helper function to create mock contest documents
function createMockContest(
  overrides: Partial<ContestDocument> = {},
): ContestDocument {
  const now = Date.now();
  return {
    _id: '1',
    platformId: 'test-contest-1',
    name: 'Test Contest',
    platform: ContestPlatform.CODEFORCES,
    phase: ContestPhase.BEFORE,
    type: ContestType.CF,
    startTime: new Date(now + 2 * 60 * 60 * 1000),
    endTime: new Date(now + 4 * 60 * 60 * 1000),
    durationMinutes: 120,
    participantCount: 0,
    problemCount: 0,
    platformMetadata: {},
    isActive: true,
    isNotified: false,
    ...overrides,
  } as ContestDocument;
}

describe('ContestSchedulerService', () => {
  let service: ContestSchedulerService;
  let contestsService: jest.Mocked<ContestsService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let configService: jest.Mocked<ConfigService>;

  const mockContestModel: MockContestModel = {
    find: jest.fn().mockReturnValue({ exec: jest.fn() }),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestSchedulerService,
        {
          provide: ContestsService,
          useValue: {
            syncAllPlatforms: jest.fn(),
            contestModel: mockContestModel,
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyUpcomingContests: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              <T = string | number | boolean>(
                key: string,
                defaultValue?: T,
              ): T => {
                // Return true for sync/notification enabled by default
                if (key === 'CONTEST_SYNC_ENABLED') return true as T;
                if (key === 'NOTIFICATIONS_ENABLED') return true as T;
                if (key === 'CONTEST_CLEANUP_ENABLED') return true as T;
                if (key === 'CONTEST_CLEANUP_DAYS') return 90 as T;
                if (key === 'NOTIFICATION_WINDOW_HOURS') return 24 as T;
                return defaultValue as T;
              },
            ),
          },
        },
      ],
    }).compile();

    service = module.get<ContestSchedulerService>(ContestSchedulerService);
    contestsService = module.get(ContestsService);
    notificationsService = module.get(NotificationsService);
    configService = module.get(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined();
    });

    it('should log initialization message', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      // Create a new instance to test constructor logging
      new ContestSchedulerService(
        contestsService,
        notificationsService,
        configService,
      );

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should read sync enabled from config', () => {
      configService.get.mockReturnValueOnce(true);

      new ContestSchedulerService(
        contestsService,
        notificationsService,
        configService,
      );

      expect(configService.get).toHaveBeenCalledWith(
        'CONTEST_SYNC_ENABLED',
        SCHEDULER.CONTEST_SYNC_ENABLED,
      );
    });

    it('should read sync interval from config', () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce('0 */6 * * *');

      new ContestSchedulerService(
        contestsService,
        notificationsService,
        configService,
      );

      expect(configService.get).toHaveBeenCalledWith(
        'CONTEST_SYNC_INTERVAL',
        SCHEDULER.CONTEST_SYNC_INTERVAL,
      );
    });
  });

  describe('handleContestSync', () => {
    it('should skip sync when disabled via configuration', async () => {
      configService.get.mockReturnValueOnce(false);

      const newService = new ContestSchedulerService(
        contestsService,
        notificationsService,
        configService,
      );

      await newService.handleContestSync();

      expect(contestsService.syncAllPlatforms).not.toHaveBeenCalled();
    });

    it('should log debug message when sync is disabled', async () => {
      configService.get.mockReturnValueOnce(false);
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      const newService = new ContestSchedulerService(
        contestsService,
        notificationsService,
        configService,
      );

      await newService.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Contest sync is disabled via configuration',
      );
    });

    it('should successfully sync all platforms', async () => {
      const mockResults = {
        codeforces: { synced: 5, updated: 3, failed: 0 },
        leetcode: { synced: 2, updated: 1, failed: 0 },
      };

      contestsService.syncAllPlatforms.mockResolvedValue(mockResults);

      await service.handleContestSync();

      expect(contestsService.syncAllPlatforms).toHaveBeenCalled();
    });

    it('should log results for each platform', async () => {
      const mockResults = {
        codeforces: { synced: 5, updated: 3, failed: 1 },
        leetcode: { synced: 2, updated: 1, failed: 0 },
      };

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      contestsService.syncAllPlatforms.mockResolvedValue(mockResults);

      await service.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('codeforces: 5 new, 3 updated, 1 failed'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('leetcode: 2 new, 1 updated, 0 failed'),
      );
    });

    it('should calculate and log totals correctly', async () => {
      const mockResults = {
        codeforces: { synced: 5, updated: 3, failed: 1 },
        leetcode: { synced: 2, updated: 1, failed: 0 },
        codechef: { synced: 3, updated: 2, failed: 1 },
      };

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      contestsService.syncAllPlatforms.mockResolvedValue(mockResults);

      await service.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total: 10 new, 6 updated, 2 failed'),
      );
    });

    it('should handle sync errors gracefully', async () => {
      const error = new Error('Sync failed');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      contestsService.syncAllPlatforms.mockRejectedValue(error);

      await service.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scheduled contest sync failed: Sync failed'),
        error.stack,
      );
    });

    it('should handle non-Error exceptions', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      contestsService.syncAllPlatforms.mockRejectedValue('String error');

      await service.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
        undefined,
      );
    });

    it('should log start message', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      contestsService.syncAllPlatforms.mockResolvedValue({});

      await service.handleContestSync();

      expect(loggerSpy).toHaveBeenCalledWith('Starting scheduled contest sync');
    });
  });

  describe('handleCleanup', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockContestModel.deleteMany.mockReset();
    });

    it('should skip cleanup when disabled via configuration', async () => {
      configService.get.mockReturnValueOnce(false);

      await service.handleCleanup();

      expect(mockContestModel.deleteMany).not.toHaveBeenCalled();
    });

    it('should log debug message when cleanup is disabled', async () => {
      configService.get.mockReturnValueOnce(false);
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      await service.handleCleanup();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Contest cleanup is disabled via configuration',
      );
    });

    it('should use default cleanup days from config', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 10 });

      await service.handleCleanup();

      expect(configService.get).toHaveBeenCalledWith(
        'CONTEST_CLEANUP_DAYS',
        SCHEDULER.CONTEST_CLEANUP_DAYS,
      );
    });

    it('should delete contests older than specified days', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(30);
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await service.handleCleanup();

      const expectedFilter: DeleteManyFilter = {
        endTime: { $lt: expect.any(Date) as Date },
        phase: 'FINISHED',
      };
      expect(mockContestModel.deleteMany).toHaveBeenCalledWith(expectedFilter);
    });

    it('should calculate cutoff date correctly', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(30);
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const beforeDate = new Date();
      beforeDate.setDate(beforeDate.getDate() - 30);

      await service.handleCleanup();

      const callArgs = mockContestModel.deleteMany.mock.calls[0];
      expect(callArgs).toBeDefined();
      if (!callArgs) return;
      const filter = callArgs[0];
      const cutoffDate = filter.endTime.$lt;

      // Allow 1 second difference for test execution time
      expect(
        Math.abs(cutoffDate.getTime() - beforeDate.getTime()),
      ).toBeLessThan(1000);
    });

    it('should log cleanup start message', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 10 });

      await service.handleCleanup();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Starting cleanup of contests older than 90 days',
        ),
      );
    });

    it('should log cleanup completion with count', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 15 });

      await service.handleCleanup();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup completed - Deleted 15 old contests'),
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      const error = new Error('Database error');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      mockContestModel.deleteMany.mockRejectedValue(error);

      await service.handleCleanup();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Contest cleanup failed: Database error'),
        error.stack,
      );
    });

    it('should handle non-Error exceptions in cleanup', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      mockContestModel.deleteMany.mockRejectedValue('String error');

      await service.handleCleanup();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
        undefined,
      );
    });
  });

  describe('handleUpcomingContests', () => {
    const mockContests: ContestDocument[] = [
      createMockContest({
        _id: '1',
        platformId: 'cf-1',
        name: 'Test Contest 1',
        platform: ContestPlatform.CODEFORCES,
        type: ContestType.CF,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        phase: ContestPhase.BEFORE,
        isActive: true,
      }),
      createMockContest({
        _id: '2',
        platformId: 'lc-1',
        name: 'Test Contest 2',
        platform: ContestPlatform.LEETCODE,
        type: ContestType.WEEKLY,
        startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        phase: ContestPhase.BEFORE,
        isActive: true,
      }),
    ];

    beforeEach(() => {
      mockContestModel.find.mockResolvedValue([]);
    });

    it('should skip when notifications are disabled', async () => {
      configService.get.mockReturnValueOnce(false);

      await service.handleUpcomingContests();

      expect(mockContestModel.find).not.toHaveBeenCalled();
    });

    it('should log debug message when notifications are disabled', async () => {
      configService.get.mockReturnValueOnce(false);
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      await service.handleUpcomingContests();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Notifications are disabled via configuration',
      );
    });

    it('should query contests within notification window', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue([]);

      await service.handleUpcomingContests();

      const expectedFilter: FindContestFilter = {
        startTime: {
          $gte: expect.any(Date) as Date,
          $lte: expect.any(Date) as Date,
        },
        phase: 'BEFORE',
        isActive: true,
      };
      expect(mockContestModel.find).toHaveBeenCalledWith(expectedFilter);
    });

    it('should use notification window from config', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(48);
      mockContestModel.find.mockResolvedValue([]);

      await service.handleUpcomingContests();

      expect(configService.get).toHaveBeenCalledWith(
        'NOTIFICATION_WINDOW_HOURS',
        NOTIFICATIONS.WINDOW_HOURS,
      );
    });

    it('should calculate window end correctly', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue([]);

      const beforeDate = new Date();
      const expectedWindowEnd = new Date(
        beforeDate.getTime() + 24 * 60 * 60 * 1000,
      );

      await service.handleUpcomingContests();

      const callArgs = mockContestModel.find.mock.calls[0];
      expect(callArgs).toBeDefined();
      if (!callArgs) return;
      const filter = callArgs[0];
      const windowEnd = filter.startTime.$lte;

      // Allow 1 second difference for test execution time
      expect(
        Math.abs(windowEnd.getTime() - expectedWindowEnd.getTime()),
      ).toBeLessThan(1000);
    });

    it('should not notify when no contests found', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue([]);

      await service.handleUpcomingContests();

      expect(
        notificationsService.notifyUpcomingContests,
      ).not.toHaveBeenCalled();
    });

    it('should log when contests are found', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      mockContestModel.find.mockResolvedValue(mockContests);

      await service.handleUpcomingContests();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found 2 contests starting within 24 hours'),
      );
    });

    it('should call notification service with found contests', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue(mockContests);

      await service.handleUpcomingContests();

      expect(notificationsService.notifyUpcomingContests).toHaveBeenCalledWith(
        mockContests,
      );
    });

    it('should handle errors gracefully', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      const error = new Error('Database error');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      mockContestModel.find.mockRejectedValue(error);

      await service.handleUpcomingContests();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to check upcoming contests: Database error',
        ),
      );
    });

    it('should handle non-Error exceptions', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      mockContestModel.find.mockRejectedValue('String error');

      await service.handleUpcomingContests();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
      );
    });

    it('should handle notification service errors', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue(mockContests);
      notificationsService.notifyUpcomingContests.mockRejectedValue(
        new Error('Notification failed'),
      );

      // Should not throw
      await expect(service.handleUpcomingContests()).resolves.not.toThrow();
    });
  });

  describe('triggerManualSync', () => {
    it('should call handleContestSync', async () => {
      const handleSyncSpy = jest
        .spyOn(service, 'handleContestSync')
        .mockResolvedValue();

      await service.triggerManualSync();

      expect(handleSyncSpy).toHaveBeenCalled();
    });

    it('should log manual sync trigger', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      jest.spyOn(service, 'handleContestSync').mockResolvedValue();

      await service.triggerManualSync();

      expect(loggerSpy).toHaveBeenCalledWith('Manual contest sync triggered');
    });

    it('should propagate errors from handleContestSync', async () => {
      const error = new Error('Sync failed');
      jest.spyOn(service, 'handleContestSync').mockRejectedValue(error);

      await expect(service.triggerManualSync()).rejects.toThrow('Sync failed');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete sync workflow', async () => {
      const mockResults = {
        codeforces: { synced: 5, updated: 3, failed: 0 },
        leetcode: { synced: 2, updated: 1, failed: 0 },
      };

      contestsService.syncAllPlatforms.mockResolvedValue(mockResults);

      await service.handleContestSync();

      expect(contestsService.syncAllPlatforms).toHaveBeenCalled();
    });

    it('should handle complete cleanup workflow', async () => {
      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(90);
      mockContestModel.deleteMany.mockResolvedValue({ deletedCount: 10 });

      await service.handleCleanup();

      expect(mockContestModel.deleteMany).toHaveBeenCalled();
    });

    it('should handle complete notification workflow', async () => {
      const mockContests: ContestDocument[] = [
        createMockContest({
          _id: '1',
          platformId: 'cf-test',
          name: 'Test Contest',
          platform: ContestPlatform.CODEFORCES,
          type: ContestType.CF,
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          phase: ContestPhase.BEFORE,
          isActive: true,
        }),
      ];

      configService.get.mockReturnValueOnce(true);
      configService.get.mockReturnValueOnce(24);
      mockContestModel.find.mockResolvedValue(mockContests);

      await service.handleUpcomingContests();

      expect(notificationsService.notifyUpcomingContests).toHaveBeenCalledWith(
        mockContests,
      );
    });
  });
});
