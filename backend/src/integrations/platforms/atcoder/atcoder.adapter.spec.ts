import { Test, TestingModule } from '@nestjs/testing';
import { AtCoderAdapter } from './atcoder.adapter';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '../../../contests/schemas/contest.schema';

describe('AtCoderAdapter', () => {
  let adapter: AtCoderAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtCoderAdapter],
    }).compile();

    adapter = module.get<AtCoderAdapter>(AtCoderAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct platform name', () => {
      expect(adapter.platformName).toBe(ContestPlatform.ATCODER);
    });

    it('should have correct configuration', () => {
      expect(adapter.config).toBeDefined();
      expect(adapter.config.enabled).toBe(true);
      expect(adapter.config.apiUrl).toBe(
        'https://atcoder.jp/contests/?lang=en',
      );
      expect(adapter.config.timeout).toBe(15000);
      expect(adapter.config.retryAttempts).toBe(3);
      expect(adapter.config.retryDelay).toBe(1000);
    });
  });

  describe('fetchContests', () => {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const mockAtCoderResponse = [
      {
        id: 'abc300',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'AtCoder Beginner Contest 300',
        rate_change: '0 - 1999',
      },
      {
        id: 'arc150',
        start_epoch_second: now - 1800,
        duration_second: 7200,
        title: 'AtCoder Regular Contest 150',
        rate_change: '1000 - 2799',
      },
      {
        id: 'agc060',
        start_epoch_second: now - 10800,
        duration_second: 7200,
        title: 'AtCoder Grand Contest 060',
        rate_change: '1200 - Inf',
      },
      {
        id: 'ahc020',
        start_epoch_second: now + 7200,
        duration_second: 259200,
        title: 'AtCoder Heuristic Contest 020',
        rate_change: 'All',
      },
      {
        id: 'old-contest',
        start_epoch_second: thirtyDaysAgo - 86400,
        duration_second: 6000,
        title: 'Old Contest',
        rate_change: 'All',
      },
    ];

    it('should fetch and transform contests successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAtCoderResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests.length).toBeGreaterThan(0);
      expect(contests.length).toBeLessThan(mockAtCoderResponse.length);

      const abcContest = contests.find((c) => c.platformId === 'abc300');
      expect(abcContest).toMatchObject({
        platformId: 'abc300',
        platform: ContestPlatform.ATCODER,
        name: 'AtCoder Beginner Contest 300',
        type: ContestType.ABC,
        phase: ContestPhase.BEFORE,
        difficulty: DifficultyLevel.BEGINNER,
        durationMinutes: 100,
        isActive: true,
      });
      expect(abcContest?.websiteUrl).toBe('https://atcoder.jp/contests/abc300');
    });

    it('should filter out contests older than 30 days', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAtCoderResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      const oldContest = contests.find((c) => c.platformId === 'old-contest');
      expect(oldContest).toBeUndefined();
    });

    it('should handle ABC contest type', async () => {
      const response = [
        {
          id: 'abc300',
          start_epoch_second: now + 3600,
          duration_second: 6000,
          title: 'AtCoder Beginner Contest 300',
          rate_change: '0 - 1999',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.ABC);
      expect(contests[0].difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('should handle ARC contest type', async () => {
      const response = [
        {
          id: 'arc150',
          start_epoch_second: now + 3600,
          duration_second: 7200,
          title: 'AtCoder Regular Contest 150',
          rate_change: '1000 - 2799',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.ARC);
      expect(contests[0].difficulty).toBe(DifficultyLevel.MEDIUM);
    });

    it('should handle AGC contest type', async () => {
      const response = [
        {
          id: 'agc060',
          start_epoch_second: now + 3600,
          duration_second: 7200,
          title: 'AtCoder Grand Contest 060',
          rate_change: '1200 - Inf',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.AGC);
      expect(contests[0].difficulty).toBe(DifficultyLevel.EXPERT);
    });

    it('should handle AHC contest type', async () => {
      const response = [
        {
          id: 'ahc020',
          start_epoch_second: now + 3600,
          duration_second: 259200,
          title: 'AtCoder Heuristic Contest 020',
          rate_change: 'All',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.AHC);
      expect(contests[0].difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should handle invalid response format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'format' }),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(0);
    });

    it('should handle empty array response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(0);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it('should handle HTTP error responses', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it('should retry on failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockAtCoderResponse),
        } as unknown as Response);
      });

      const contests = await adapter.fetchContests();
      expect(contests.length).toBeGreaterThan(0);
      expect(callCount).toBe(3);
    });
  });

  describe('fetchUpcomingContests', () => {
    it('should return only upcoming contests', async () => {
      const now = Math.floor(Date.now() / 1000);
      const response = [
        {
          id: 'future-contest',
          start_epoch_second: now + 3600,
          duration_second: 6000,
          title: 'Future Contest',
          rate_change: 'All',
        },
        {
          id: 'past-contest',
          start_epoch_second: now - 10800,
          duration_second: 6000,
          title: 'Past Contest',
          rate_change: 'All',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();

      expect(contests).toHaveLength(1);
      expect(contests[0].name).toBe('Future Contest');
      expect(contests[0].startTime.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return empty array when no upcoming contests', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();
      expect(contests).toHaveLength(0);
    });
  });

  describe('fetchRunningContests', () => {
    it('should return only running contests', async () => {
      const now = Math.floor(Date.now() / 1000);
      const response = [
        {
          id: 'running-contest',
          start_epoch_second: now - 1800,
          duration_second: 6000,
          title: 'Running Contest',
          rate_change: 'All',
        },
        {
          id: 'future-contest',
          start_epoch_second: now + 3600,
          duration_second: 6000,
          title: 'Future Contest',
          rate_change: 'All',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchRunningContests();

      expect(contests).toHaveLength(1);
      expect(contests[0].name).toBe('Running Contest');
      expect(contests[0].startTime.getTime()).toBeLessThanOrEqual(Date.now());
      expect(contests[0].endTime.getTime()).toBeGreaterThanOrEqual(Date.now());
    });
  });

  describe('transformToInternalFormat', () => {
    const now = Math.floor(Date.now() / 1000);

    it('should transform ABC contest correctly', () => {
      const acContest = {
        id: 'abc300',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'AtCoder Beginner Contest 300',
        rate_change: '0 - 1999',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result).toMatchObject({
        platformId: 'abc300',
        platform: ContestPlatform.ATCODER,
        name: 'AtCoder Beginner Contest 300',
        type: ContestType.ABC,
        phase: ContestPhase.BEFORE,
        difficulty: DifficultyLevel.BEGINNER,
        durationMinutes: 100,
        isActive: true,
      });
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should transform ARC contest correctly', () => {
      const acContest = {
        id: 'arc150',
        start_epoch_second: now + 3600,
        duration_second: 7200,
        title: 'AtCoder Regular Contest 150',
        rate_change: '1000 - 2799',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.type).toBe(ContestType.ARC);
      expect(result.difficulty).toBe(DifficultyLevel.MEDIUM);
    });

    it('should transform AGC contest correctly', () => {
      const acContest = {
        id: 'agc060',
        start_epoch_second: now + 3600,
        duration_second: 7200,
        title: 'AtCoder Grand Contest 060',
        rate_change: '1200 - Inf',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.type).toBe(ContestType.AGC);
      expect(result.difficulty).toBe(DifficultyLevel.EXPERT);
    });

    it('should transform AHC contest correctly', () => {
      const acContest = {
        id: 'ahc020',
        start_epoch_second: now + 3600,
        duration_second: 259200,
        title: 'AtCoder Heuristic Contest 020',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.type).toBe(ContestType.AHC);
      expect(result.difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should determine BEFORE phase correctly', () => {
      const acContest = {
        id: 'future-contest',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'Future Contest',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.phase).toBe(ContestPhase.BEFORE);
      expect(result.isActive).toBe(true);
    });

    it('should determine CODING phase correctly', () => {
      const acContest = {
        id: 'running-contest',
        start_epoch_second: now - 1800,
        duration_second: 6000,
        title: 'Running Contest',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.phase).toBe(ContestPhase.CODING);
      expect(result.isActive).toBe(true);
    });

    it('should determine FINISHED phase correctly', () => {
      const acContest = {
        id: 'past-contest',
        start_epoch_second: now - 10800,
        duration_second: 6000,
        title: 'Past Contest',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.phase).toBe(ContestPhase.FINISHED);
      expect(result.isActive).toBe(false);
    });

    it('should include platform metadata', () => {
      const acContest = {
        id: 'test-contest',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'Test Contest',
        rate_change: '1000 - 1999',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.platformMetadata).toEqual({
        rate_change: '1000 - 1999',
        contest_id: 'test-contest',
      });
    });

    it('should generate correct website URL', () => {
      const acContest = {
        id: 'abc300',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'AtCoder Beginner Contest 300',
        rate_change: '0 - 1999',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.websiteUrl).toBe('https://atcoder.jp/contests/abc300');
    });

    it('should detect contest type from title keywords', () => {
      const testCases = [
        { title: 'ABC 300 Contest', expectedType: ContestType.ABC },
        { title: 'Regular Contest ARC 150', expectedType: ContestType.ARC },
        { title: 'Grand Contest AGC 060', expectedType: ContestType.AGC },
        { title: 'Heuristic Contest AHC 020', expectedType: ContestType.AHC },
      ];

      testCases.forEach(({ title, expectedType }) => {
        const acContest = {
          id: 'test',
          start_epoch_second: now + 3600,
          duration_second: 6000,
          title,
          rate_change: 'All',
        };

        const result = adapter.transformToInternalFormat(acContest);
        expect(result.type).toBe(expectedType);
      });
    });

    it('should default to ABC type for unknown contest', () => {
      const acContest = {
        id: 'unknown-contest',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: 'Unknown Contest Type',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.type).toBe(ContestType.ABC);
    });

    it('should handle very long duration contests', () => {
      const acContest = {
        id: 'long-contest',
        start_epoch_second: now + 3600,
        duration_second: 604800,
        title: 'Long Contest',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.durationMinutes).toBe(10080);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is accessible', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      } as unknown as Response);

      const result = await adapter.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is not accessible', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await adapter.healthCheck();
      expect(result).toBe(false);
    });

    it('should return false on HTTP error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await adapter.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it('should handle contest with missing fields', () => {
      const now = Math.floor(Date.now() / 1000);
      const acContest = {
        id: 'test',
        start_epoch_second: now + 3600,
        duration_second: 6000,
        title: '',
        rate_change: '',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.platformId).toBe('test');
      expect(result.name).toBe('');
    });

    it('should handle very short duration contests', () => {
      const now = Math.floor(Date.now() / 1000);
      const acContest = {
        id: 'short-contest',
        start_epoch_second: now + 3600,
        duration_second: 60,
        title: 'Short Contest',
        rate_change: 'All',
      };

      const result = adapter.transformToInternalFormat(acContest);

      expect(result.durationMinutes).toBe(1);
    });
  });
});
