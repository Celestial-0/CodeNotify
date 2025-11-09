import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ContestsService } from './contests.service';
import {
  Contest,
  ContestDocument,
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from './schemas/contest.schema';
import { CreateContestDto } from './dto/contest.dto';
import { PLATFORM_ADAPTERS } from '../integrations/platforms/platforms.module';
import { PlatformAdapter } from '../integrations/platforms/base/platform.interface';

// Mock types for testing
type MockModel = {
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  countDocuments: jest.Mock;
  aggregate: jest.Mock;
  insertMany: jest.Mock;
  updateOne: jest.Mock;
  create: jest.Mock;
  exec: jest.Mock;
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
};

describe('ContestsService', () => {
  let service: ContestsService;
  let contestModel: MockModel;
  let mockPlatformAdapter: jest.Mocked<PlatformAdapter>;

  const mockContest: Partial<ContestDocument> = {
    _id: '507f1f77bcf86cd799439011' as never,
    platformId: 'test-123',
    name: 'Test Contest',
    platform: ContestPlatform.CODEFORCES,
    phase: ContestPhase.BEFORE,
    type: ContestType.CF,
    startTime: new Date('2024-12-01T10:00:00Z'),
    endTime: new Date('2024-12-01T12:00:00Z'),
    durationMinutes: 120,
    isActive: true,
    platformMetadata: {},
  };

  const mockCreateDto: CreateContestDto = {
    platformId: 'test-123',
    name: 'Test Contest',
    platform: ContestPlatform.CODEFORCES,
    phase: ContestPhase.BEFORE,
    type: ContestType.CF,
    startTime: new Date('2024-12-01T10:00:00Z'),
    endTime: new Date('2024-12-01T12:00:00Z'),
    durationMinutes: 120,
    isActive: true,
  };

  beforeEach(async () => {
    mockPlatformAdapter = {
      platformName: ContestPlatform.CODEFORCES,
      fetchContests: jest.fn(),
      fetchUpcomingContests: jest.fn(),
      fetchRunningContests: jest.fn(),
      transformToInternalFormat: jest.fn(),
      healthCheck: jest.fn(),
    };

    const mockModelValue: MockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      insertMany: jest.fn(),
      updateOne: jest.fn(),
      create: jest.fn(),
      exec: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestsService,
        {
          provide: getModelToken(Contest.name),
          useValue: mockModelValue,
        },
        { provide: PLATFORM_ADAPTERS, useValue: [mockPlatformAdapter] },
      ],
    }).compile();

    service = module.get<ContestsService>(ContestsService);
    contestModel = module.get<MockModel>(getModelToken(Contest.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should check for duplicates before creating', async () => {
      contestModel.exec.mockResolvedValue(null);
      await expect(service.create(mockCreateDto)).rejects.toThrow();
      expect(contestModel.findOne).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate', async () => {
      contestModel.exec.mockResolvedValue(mockContest);
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      contestModel.countDocuments.mockResolvedValue(1);
      const result = await service.findAll({
        limit: 20,
        offset: 0,
        sortBy: 'startTime',
        sortOrder: 'asc',
      });
      expect(result.data).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find contest by id', async () => {
      contestModel.exec.mockResolvedValue(mockContest);
      const result = await service.findById('test-id');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when not found', async () => {
      contestModel.exec.mockResolvedValue(null);
      await expect(service.findById('test-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update contest', async () => {
      contestModel.exec.mockResolvedValue({ ...mockContest, name: 'Updated' });
      const result = await service.update('test-id', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete contest', async () => {
      contestModel.exec.mockResolvedValue(mockContest);
      await service.delete('test-id');
      expect(contestModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('platform operations', () => {
    it('should find by platform', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.findByPlatform(ContestPlatform.CODEFORCES);
      expect(result).toHaveLength(1);
    });

    it('should find upcoming', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.findUpcoming();
      expect(result).toBeDefined();
    });

    it('should find running', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.findRunning();
      expect(result).toBeDefined();
    });

    it('should find finished', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.findFinished();
      expect(result).toBeDefined();
    });
  });

  describe('search and filter', () => {
    it('should search contests', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.searchContests('test');
      expect(result).toBeDefined();
    });

    it('should filter by difficulty', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.filterByDifficulty(DifficultyLevel.MEDIUM);
      expect(result).toBeDefined();
    });

    it('should filter by type', async () => {
      contestModel.exec.mockResolvedValue([mockContest]);
      const result = await service.filterByType(ContestType.CF);
      expect(result).toBeDefined();
    });
  });

  describe('statistics', () => {
    it('should get contest stats', async () => {
      contestModel.countDocuments.mockResolvedValue(100);
      contestModel.aggregate.mockResolvedValue([]);
      const result = await service.getContestStats();
      expect(result.totalContests).toBe(100);
    });

    it('should get platform stats', async () => {
      contestModel.countDocuments.mockResolvedValue(50);
      contestModel.aggregate.mockResolvedValue([
        { _id: null, avgDuration: 120, avgParticipants: 1000 },
      ]);
      contestModel.exec.mockResolvedValue({ lastSyncedAt: new Date() });
      const result = await service.getPlatformStats(ContestPlatform.CODEFORCES);
      expect(result.platform).toBe(ContestPlatform.CODEFORCES);
    });
  });

  describe('sync operations', () => {
    it('should sync platform', async () => {
      mockPlatformAdapter.fetchContests.mockResolvedValue([]);
      contestModel.exec.mockResolvedValue(null);
      contestModel.create.mockResolvedValue(mockContest);
      const result = await service.syncPlatform(ContestPlatform.CODEFORCES);
      expect(result.synced).toBeGreaterThanOrEqual(0);
    });

    it('should sync all platforms', async () => {
      mockPlatformAdapter.fetchContests.mockResolvedValue([]);
      const result = await service.syncAllPlatforms();
      expect(result).toHaveProperty(ContestPlatform.CODEFORCES);
    });
  });

  describe('utility methods', () => {
    it('should build filter query', () => {
      const filter = service['buildFilterQuery']({
        platform: ContestPlatform.CODEFORCES,
        limit: 20,
        offset: 0,
        sortBy: 'startTime',
        sortOrder: 'asc',
      });
      expect(filter.platform).toBe(ContestPlatform.CODEFORCES);
    });

    it('should build sort options', () => {
      const sort = service['buildSortOptions']('startTime', 'asc');
      expect(sort).toEqual({ startTime: 1 });
    });

    it('should transform to response DTO', () => {
      const result = service['transformToResponseDto'](
        mockContest as ContestDocument,
      );
      expect(result.id).toBeDefined();
    });

    it('should get error message', () => {
      expect(service['getErrorMessage'](new Error('test'))).toBe('test');
      expect(service['getErrorMessage']('test')).toBe('test');
    });

    it('should get error stack', () => {
      expect(service['getErrorStack'](new Error('test'))).toBeDefined();
      expect(service['getErrorStack']('test')).toBeUndefined();
    });
  });
});
