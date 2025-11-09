import { Test, TestingModule } from '@nestjs/testing';
import { LeetCodeAdapter } from './leetcode.adapter';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
} from '../../../contests/schemas/contest.schema';

describe('LeetCodeAdapter', () => {
  let adapter: LeetCodeAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeetCodeAdapter],
    }).compile();

    adapter = module.get<LeetCodeAdapter>(LeetCodeAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct platform name', () => {
      expect(adapter.platformName).toBe(ContestPlatform.LEETCODE);
    });

    it('should have correct configuration', () => {
      expect(adapter.config).toBeDefined();
      expect(adapter.config.enabled).toBe(true);
      expect(adapter.config.apiUrl).toBe('https://leetcode.com/graphql');
      expect(adapter.config.timeout).toBe(15000);
      expect(adapter.config.retryAttempts).toBe(3);
      expect(adapter.config.retryDelay).toBe(1000);
    });
  });

  describe('fetchContests', () => {
    const mockLeetCodeResponse = {
      data: {
        allContests: [
          {
            title: 'Weekly Contest 350',
            titleSlug: 'weekly-contest-350',
            startTime: Math.floor(Date.now() / 1000) + 3600,
            duration: 5400,
            originStartTime: Math.floor(Date.now() / 1000) + 3600,
            isVirtual: false,
            cardImg: 'https://example.com/image.png',
            description: 'Weekly Contest Description',
          },
          {
            title: 'Biweekly Contest 100',
            titleSlug: 'biweekly-contest-100',
            startTime: Math.floor(Date.now() / 1000) - 1800,
            duration: 5400,
            originStartTime: Math.floor(Date.now() / 1000) - 1800,
            isVirtual: false,
          },
          {
            title: 'Weekly Contest 349',
            titleSlug: 'weekly-contest-349',
            startTime: Math.floor(Date.now() / 1000) - 10800,
            duration: 5400,
            originStartTime: Math.floor(Date.now() / 1000) - 10800,
            isVirtual: false,
          },
        ],
      },
    };

    it('should fetch and transform contests successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLeetCodeResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests).toHaveLength(3);
      expect(contests[0]).toMatchObject({
        platformId: 'weekly-contest-350',
        platform: ContestPlatform.LEETCODE,
        name: 'Weekly Contest 350',
        type: ContestType.WEEKLY,
        phase: ContestPhase.BEFORE,
        durationMinutes: 90,
        isActive: true,
      });
      expect(contests[0].websiteUrl).toBe(
        'https://leetcode.com/contest/weekly-contest-350',
      );
      expect(contests[0].platformMetadata).toMatchObject({
        titleSlug: 'weekly-contest-350',
        isVirtual: false,
        cardImg: 'https://example.com/image.png',
      });
    });

    it('should handle biweekly contests', async () => {
      const response = {
        data: {
          allContests: [
            {
              title: 'Biweekly Contest 100',
              titleSlug: 'biweekly-contest-100',
              startTime: Math.floor(Date.now() / 1000) + 3600,
              duration: 5400,
              originStartTime: Math.floor(Date.now() / 1000) + 3600,
              isVirtual: false,
            },
          ],
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests).toHaveLength(1);
      expect(contests[0].type).toBe(ContestType.BIWEEKLY);
    });

    it('should handle empty response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { allContests: [] } }),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(0);
    });

    it('should handle missing allContests in response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: {} }),
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

      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolve - let the AbortController timeout trigger
          }),
      );

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
          json: jest.fn().mockResolvedValue(mockLeetCodeResponse),
        } as unknown as Response);
      });

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(3);
      expect(callCount).toBe(3);
    });
  });

  describe('fetchUpcomingContests', () => {
    it('should return only upcoming contests', async () => {
      const response = {
        data: {
          allContests: [
            {
              title: 'Future Contest',
              titleSlug: 'future-contest',
              startTime: Math.floor(Date.now() / 1000) + 3600,
              duration: 5400,
              originStartTime: Math.floor(Date.now() / 1000) + 3600,
              isVirtual: false,
            },
            {
              title: 'Past Contest',
              titleSlug: 'past-contest',
              startTime: Math.floor(Date.now() / 1000) - 10800,
              duration: 5400,
              originStartTime: Math.floor(Date.now() / 1000) - 10800,
              isVirtual: false,
            },
          ],
        },
      };

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
        json: jest.fn().mockResolvedValue({ data: { allContests: [] } }),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();
      expect(contests).toHaveLength(0);
    });
  });

  describe('fetchRunningContests', () => {
    it('should return only running contests', async () => {
      const now = Math.floor(Date.now() / 1000);
      const response = {
        data: {
          allContests: [
            {
              title: 'Running Contest',
              titleSlug: 'running-contest',
              startTime: now - 1800,
              duration: 5400,
              originStartTime: now - 1800,
              isVirtual: false,
            },
            {
              title: 'Future Contest',
              titleSlug: 'future-contest',
              startTime: now + 3600,
              duration: 5400,
              originStartTime: now + 3600,
              isVirtual: false,
            },
          ],
        },
      };

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
    it('should transform weekly contest correctly', () => {
      const lcContest = {
        title: 'Weekly Contest 350',
        titleSlug: 'weekly-contest-350',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
        cardImg: 'https://example.com/image.png',
        description: 'Test description',
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result).toMatchObject({
        platformId: 'weekly-contest-350',
        platform: ContestPlatform.LEETCODE,
        name: 'Weekly Contest 350',
        type: ContestType.WEEKLY,
        phase: ContestPhase.BEFORE,
        durationMinutes: 90,
        description: 'Test description',
        isActive: true,
      });
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should transform biweekly contest correctly', () => {
      const lcContest = {
        title: 'Biweekly Contest 100',
        titleSlug: 'biweekly-contest-100',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.type).toBe(ContestType.BIWEEKLY);
    });

    it('should determine BEFORE phase correctly', () => {
      const lcContest = {
        title: 'Future Contest',
        titleSlug: 'future-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.phase).toBe(ContestPhase.BEFORE);
      expect(result.isActive).toBe(true);
    });

    it('should determine CODING phase correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      const lcContest = {
        title: 'Running Contest',
        titleSlug: 'running-contest',
        startTime: now - 1800,
        duration: 5400,
        originStartTime: now - 1800,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.phase).toBe(ContestPhase.CODING);
      expect(result.isActive).toBe(true);
    });

    it('should determine FINISHED phase correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      const lcContest = {
        title: 'Past Contest',
        titleSlug: 'past-contest',
        startTime: now - 10800,
        duration: 5400,
        originStartTime: now - 10800,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.phase).toBe(ContestPhase.FINISHED);
      expect(result.isActive).toBe(false);
    });

    it('should handle contest without optional fields', () => {
      const lcContest = {
        title: 'Test Contest',
        titleSlug: 'test-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: true,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.platformId).toBe('test-contest');
      expect(result.description).toBeUndefined();
      expect(result.platformMetadata?.cardImg).toBeUndefined();
    });

    it('should include platform metadata', () => {
      const lcContest = {
        title: 'Test Contest',
        titleSlug: 'test-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: true,
        cardImg: 'https://example.com/image.png',
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.platformMetadata).toEqual({
        titleSlug: 'test-contest',
        isVirtual: true,
        cardImg: 'https://example.com/image.png',
        originStartTime: lcContest.originStartTime,
      });
    });

    it('should generate correct website URL', () => {
      const lcContest = {
        title: 'Test Contest',
        titleSlug: 'test-contest-123',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.websiteUrl).toBe(
        'https://leetcode.com/contest/test-contest-123',
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is accessible', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { allContests: [] } }),
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

  describe('GraphQL request handling', () => {
    it('should send correct GraphQL query structure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { allContests: [] } }),
      } as unknown as Response);
      global.fetch = mockFetch;

      await adapter.fetchContests();

      expect(mockFetch).toHaveBeenCalled();
      const firstCall = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(firstCall[0]).toBe('https://leetcode.com/graphql');
      const callOptions = firstCall[1];
      expect(callOptions.method).toBe('POST');
      expect(callOptions.headers).toBeDefined();
      const headers = callOptions.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Origin']).toBe('https://leetcode.com');
      expect(headers['Referer']).toBe('https://leetcode.com');
      expect(callOptions.body).toBeDefined();
      if (typeof callOptions.body === 'string') {
        expect(callOptions.body).toContain('allContests');
      }
    });

    it.skip('should handle GraphQL timeout', async () => {
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

      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolve - let the AbortController timeout trigger
          }),
      );

      await expect(adapter.fetchContests()).rejects.toThrow();
    }, 10000);
  });

  describe('edge cases', () => {
    it('should handle malformed JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(adapter.fetchContests()).rejects.toThrow();
    });

    it('should handle contest with missing title', () => {
      const lcContest = {
        title: '',
        titleSlug: 'test-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 5400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.name).toBe('');
      expect(result.platformId).toBe('test-contest');
    });

    it('should handle very short duration contests', () => {
      const lcContest = {
        title: 'Short Contest',
        titleSlug: 'short-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 60,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.durationMinutes).toBe(1);
    });

    it('should handle very long duration contests', () => {
      const lcContest = {
        title: 'Long Contest',
        titleSlug: 'long-contest',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        duration: 86400,
        originStartTime: Math.floor(Date.now() / 1000) + 3600,
        isVirtual: false,
      };

      const result = adapter.transformToInternalFormat(lcContest);

      expect(result.durationMinutes).toBe(1440);
    });
  });
});
