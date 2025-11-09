import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CodeforcesAdapter } from './codeforces.adapter';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
} from '../../../contests/schemas/contest.schema';

describe('CodeforcesAdapter', () => {
  let adapter: CodeforcesAdapter;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeforcesAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<CodeforcesAdapter>(CodeforcesAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct platform name', () => {
      expect(adapter.platformName).toBe(ContestPlatform.CODEFORCES);
    });

    it('should have correct configuration', () => {
      expect(adapter.config).toBeDefined();
      expect(adapter.config.enabled).toBe(true);
      expect(adapter.config.apiUrl).toBe('https://codeforces.com/api');
      expect(adapter.config.timeout).toBe(10000);
      expect(adapter.config.retryAttempts).toBe(3);
      expect(adapter.config.retryDelay).toBe(1000);
    });
  });

  describe('fetchContests', () => {
    const mockCodeforcesResponse = {
      status: 'OK',
      result: [
        {
          id: 1234,
          name: 'Codeforces Round #800',
          type: 'CF',
          phase: 'BEFORE',
          frozen: false,
          durationSeconds: 7200,
          startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
          relativeTimeSeconds: -3600,
        },
        {
          id: 1235,
          name: 'Educational Codeforces Round #150',
          type: 'ICPC',
          phase: 'CODING',
          frozen: false,
          durationSeconds: 7200,
          startTimeSeconds: Math.floor(Date.now() / 1000) - 1800,
          relativeTimeSeconds: 1800,
        },
        {
          id: 1236,
          name: 'Codeforces Round #799',
          type: 'IOI',
          phase: 'FINISHED',
          frozen: true,
          durationSeconds: 7200,
          startTimeSeconds: Math.floor(Date.now() / 1000) - 10800,
          relativeTimeSeconds: 10800,
        },
      ],
    };

    it('should fetch and transform contests successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCodeforcesResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests).toHaveLength(3);
      expect(contests[0]).toMatchObject({
        platformId: '1234',
        platform: ContestPlatform.CODEFORCES,
        name: 'Codeforces Round #800',
        type: ContestType.CF,
        phase: ContestPhase.BEFORE,
        durationMinutes: 120,
        isActive: true,
      });
      expect(contests[0].platformMetadata).toEqual({
        frozen: false,
        relativeTimeSeconds: -3600,
      });
    });

    it('should handle API error status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'FAILED', result: [] }),
      } as unknown as Response);

      await expect(adapter.fetchContests()).rejects.toThrow(
        'Codeforces API returned error status',
      );
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it.skip('should handle timeout', async () => {
      // Override config for faster test
      Object.defineProperty(adapter, 'config', {
        value: {
          ...adapter.config,
          timeout: 1000,
          retryAttempts: 1,
          retryDelay: 0,
        },
        writable: true,
        configurable: true,
      });

      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise(() => {
          // Never resolve - let the AbortController timeout trigger
        });
      });

      await expect(adapter.fetchContests()).rejects.toThrow();
    }, 10000);

    it('should retry on failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(mockCodeforcesResponse),
        } as unknown as Response);
      });

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(3);
      expect(callCount).toBe(3);
    });
  });

  describe('fetchUpcomingContests', () => {
    it('should return only upcoming contests', async () => {
      const mockResponse = {
        status: 'OK',
        result: [
          {
            id: 1234,
            name: 'Future Contest',
            type: 'CF',
            phase: 'BEFORE',
            frozen: false,
            durationSeconds: 7200,
            startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
          },
          {
            id: 1235,
            name: 'Past Contest',
            type: 'CF',
            phase: 'FINISHED',
            frozen: true,
            durationSeconds: 7200,
            startTimeSeconds: Math.floor(Date.now() / 1000) - 10800,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();

      expect(contests).toHaveLength(1);
      expect(contests[0].name).toBe('Future Contest');
      expect(contests[0].startTime.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return empty array when no upcoming contests', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'OK', result: [] }),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();
      expect(contests).toHaveLength(0);
    });
  });

  describe('fetchRunningContests', () => {
    it('should return only running contests', async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockResponse = {
        status: 'OK',
        result: [
          {
            id: 1234,
            name: 'Running Contest',
            type: 'CF',
            phase: 'CODING',
            frozen: false,
            durationSeconds: 7200,
            startTimeSeconds: now - 1800,
          },
          {
            id: 1235,
            name: 'Future Contest',
            type: 'CF',
            phase: 'BEFORE',
            frozen: false,
            durationSeconds: 7200,
            startTimeSeconds: now + 3600,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const contests = await adapter.fetchRunningContests();

      expect(contests).toHaveLength(1);
      expect(contests[0].name).toBe('Running Contest');
      expect(contests[0].startTime.getTime()).toBeLessThanOrEqual(Date.now());
      expect(contests[0].endTime.getTime()).toBeGreaterThanOrEqual(Date.now());
    });
  });

  describe('transformToInternalFormat', () => {
    it('should transform CF type contest correctly', () => {
      const cfContest = {
        id: 1234,
        name: 'Codeforces Round #800',
        type: 'CF',
        phase: 'BEFORE',
        frozen: false,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
        relativeTimeSeconds: -3600,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result).toMatchObject({
        platformId: '1234',
        platform: ContestPlatform.CODEFORCES,
        name: 'Codeforces Round #800',
        type: ContestType.CF,
        phase: ContestPhase.BEFORE,
        durationMinutes: 120,
        isActive: true,
      });
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should transform IOI type contest correctly', () => {
      const cfContest = {
        id: 1235,
        name: 'IOI 2023',
        type: 'IOI',
        phase: 'CODING',
        frozen: false,
        durationSeconds: 18000,
        startTimeSeconds: Math.floor(Date.now() / 1000) - 1800,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.type).toBe(ContestType.IOI);
      expect(result.phase).toBe(ContestPhase.CODING);
      expect(result.durationMinutes).toBe(300);
    });

    it('should transform ICPC type contest correctly', () => {
      const cfContest = {
        id: 1236,
        name: 'ICPC Regional',
        type: 'ICPC',
        phase: 'FINISHED',
        frozen: true,
        durationSeconds: 18000,
        startTimeSeconds: Math.floor(Date.now() / 1000) - 20000,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.type).toBe(ContestType.ICPC);
      expect(result.phase).toBe(ContestPhase.FINISHED);
      expect(result.isActive).toBe(false);
    });

    it('should handle contest without startTimeSeconds', () => {
      const cfContest = {
        id: 1237,
        name: 'Test Contest',
        type: 'CF',
        phase: 'BEFORE',
        frozen: false,
        durationSeconds: 7200,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
    });

    it('should handle PENDING_SYSTEM_TEST phase', () => {
      const cfContest = {
        id: 1238,
        name: 'Test Contest',
        type: 'CF',
        phase: 'PENDING_SYSTEM_TEST',
        frozen: true,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) - 7200,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.phase).toBe(ContestPhase.PENDING_SYSTEM_TEST);
    });

    it('should handle SYSTEM_TEST phase', () => {
      const cfContest = {
        id: 1239,
        name: 'Test Contest',
        type: 'CF',
        phase: 'SYSTEM_TEST',
        frozen: true,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) - 7200,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.phase).toBe(ContestPhase.SYSTEM_TEST);
    });

    it('should handle unknown contest type', () => {
      const cfContest = {
        id: 1240,
        name: 'Unknown Contest',
        type: 'UNKNOWN',
        phase: 'BEFORE',
        frozen: false,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.type).toBe(ContestType.CF);
    });

    it('should handle unknown phase', () => {
      const cfContest = {
        id: 1241,
        name: 'Test Contest',
        type: 'CF',
        phase: 'UNKNOWN_PHASE',
        frozen: false,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.phase).toBe(ContestPhase.BEFORE);
    });

    it('should include platform metadata', () => {
      const cfContest = {
        id: 1242,
        name: 'Test Contest',
        type: 'CF',
        phase: 'BEFORE',
        frozen: true,
        durationSeconds: 7200,
        startTimeSeconds: Math.floor(Date.now() / 1000) + 3600,
        relativeTimeSeconds: -3600,
      };

      const result = adapter.transformToInternalFormat(cfContest);

      expect(result.platformMetadata).toEqual({
        frozen: true,
        relativeTimeSeconds: -3600,
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is accessible', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'OK', result: [] }),
      } as unknown as Response);

      const result = await adapter.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is not accessible', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await adapter.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty contest list', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'OK', result: [] }),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(0);
    });

    it('should handle HTTP error responses', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it('should handle malformed JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(adapter.fetchContests()).rejects.toThrow();
    });
  });
});
