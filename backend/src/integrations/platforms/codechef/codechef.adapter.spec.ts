import { Test, TestingModule } from '@nestjs/testing';
import { CodeChefAdapter } from './codechef.adapter';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '../../../contests/schemas/contest.schema';

describe('CodeChefAdapter', () => {
  let adapter: CodeChefAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeChefAdapter],
    }).compile();

    adapter = module.get<CodeChefAdapter>(CodeChefAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct platform name', () => {
      expect(adapter.platformName).toBe(ContestPlatform.CODECHEF);
    });

    it('should have correct configuration', () => {
      expect(adapter.config).toBeDefined();
      expect(adapter.config.enabled).toBe(true);
      expect(adapter.config.apiUrl).toBe(
        'https://www.codechef.com/api/list/contests/all',
      );
      expect(adapter.config.timeout).toBe(15000);
      expect(adapter.config.retryAttempts).toBe(3);
      expect(adapter.config.retryDelay).toBe(1000);
    });
  });

  describe('fetchContests', () => {
    const mockCodeChefResponse = {
      status: 'success',
      present_contests: [
        {
          contest_code: 'START100',
          contest_name: 'Starters 100',
          contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
          contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
          contest_start_date_iso: new Date(Date.now() - 1800000).toISOString(),
          contest_end_date_iso: new Date(Date.now() + 5400000).toISOString(),
          contest_duration: '120',
          distinct_users: 5000,
          contest_type: 'STARTERS',
        },
      ],
      future_contests: [
        {
          contest_code: 'LTIME101',
          contest_name: 'Lunchtime November 2023',
          contest_start_date: 'Sat, 04 Nov 2023 19:30:00 GMT',
          contest_end_date: 'Sat, 04 Nov 2023 22:30:00 GMT',
          contest_start_date_iso: new Date(Date.now() + 86400000).toISOString(),
          contest_end_date_iso: new Date(Date.now() + 97200000).toISOString(),
          contest_duration: '180',
          distinct_users: 0,
          contest_type: 'LUNCHTIME',
        },
      ],
      past_contests: Array.from({ length: 25 }, (_, i) => ({
        contest_code: `PAST${i}`,
        contest_name: `Past Contest ${i}`,
        contest_start_date: 'Mon, 01 Oct 2023 14:30:00 GMT',
        contest_end_date: 'Mon, 01 Oct 2023 16:30:00 GMT',
        contest_start_date_iso: new Date(Date.now() - 2592000000).toISOString(),
        contest_end_date_iso: new Date(Date.now() - 2584800000).toISOString(),
        contest_duration: '120',
        distinct_users: 1000 + i,
      })),
    };

    it('should fetch and transform contests successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCodeChefResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests.length).toBeGreaterThan(0);
      expect(contests.length).toBeLessThanOrEqual(47); // 1 present + 1 future + 20 past (limited)

      const presentContest = contests.find((c) => c.platformId === 'START100');
      expect(presentContest).toMatchObject({
        platformId: 'START100',
        platform: ContestPlatform.CODECHEF,
        name: 'Starters 100',
        type: ContestType.STARTERS,
        phase: ContestPhase.CODING,
        difficulty: DifficultyLevel.BEGINNER,
        participantCount: 5000,
      });
    });

    it('should handle STARTERS contest type', async () => {
      const response = {
        status: 'success',
        future_contests: [
          {
            contest_code: 'START100',
            contest_name: 'Starters 100',
            contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
            contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 3600000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
            contest_duration: '120',
            distinct_users: 0,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.STARTERS);
      expect(contests[0].difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('should handle LUNCH_TIME contest type', async () => {
      const response = {
        status: 'success',
        future_contests: [
          {
            contest_code: 'LTIME101',
            contest_name: 'Lunchtime November 2023',
            contest_start_date: 'Sat, 04 Nov 2023 19:30:00 GMT',
            contest_end_date: 'Sat, 04 Nov 2023 22:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 3600000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 14400000).toISOString(),
            contest_duration: '180',
            distinct_users: 0,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.LUNCH_TIME);
      expect(contests[0].difficulty).toBe(DifficultyLevel.MEDIUM);
    });

    it('should handle COOK_OFF contest type', async () => {
      const response = {
        status: 'success',
        future_contests: [
          {
            contest_code: 'COOK150',
            contest_name: 'Cook-Off November 2023',
            contest_start_date: 'Sun, 05 Nov 2023 20:30:00 GMT',
            contest_end_date: 'Sun, 05 Nov 2023 23:00:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 3600000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 12600000).toISOString(),
            contest_duration: '150',
            distinct_users: 0,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.COOK_OFF);
      expect(contests[0].difficulty).toBe(DifficultyLevel.MEDIUM);
    });

    it('should handle LONG contest type', async () => {
      const response = {
        status: 'success',
        future_contests: [
          {
            contest_code: 'LONG2023',
            contest_name: 'Long Challenge November 2023',
            contest_start_date: 'Fri, 03 Nov 2023 15:00:00 GMT',
            contest_end_date: 'Mon, 13 Nov 2023 15:00:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 3600000,
            ).toISOString(),
            contest_end_date_iso: new Date(
              Date.now() + 867600000,
            ).toISOString(),
            contest_duration: '14400',
            distinct_users: 0,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      } as unknown as Response);

      const contests = await adapter.fetchContests();

      expect(contests[0].type).toBe(ContestType.LONG);
      expect(contests[0].difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should limit past contests to 20', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCodeChefResponse),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      const pastContests = contests.filter(
        (c) => c.phase === ContestPhase.FINISHED,
      );

      expect(pastContests.length).toBeLessThanOrEqual(20);
    });

    it('should handle non-success status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'error' }),
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
          json: jest.fn().mockResolvedValue(mockCodeChefResponse),
        } as unknown as Response);
      });

      const contests = await adapter.fetchContests();
      expect(contests.length).toBeGreaterThan(0);
      expect(callCount).toBe(3);
    });
  });

  describe('fetchUpcomingContests', () => {
    it('should return only upcoming contests', async () => {
      const response = {
        status: 'success',
        future_contests: [
          {
            contest_code: 'FUTURE1',
            contest_name: 'Future Contest',
            contest_start_date: 'Sat, 04 Nov 2023 19:30:00 GMT',
            contest_end_date: 'Sat, 04 Nov 2023 22:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 86400000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 97200000).toISOString(),
            contest_duration: '180',
            distinct_users: 0,
          },
        ],
        past_contests: [
          {
            contest_code: 'PAST1',
            contest_name: 'Past Contest',
            contest_start_date: 'Mon, 01 Oct 2023 14:30:00 GMT',
            contest_end_date: 'Mon, 01 Oct 2023 16:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() - 2592000000,
            ).toISOString(),
            contest_end_date_iso: new Date(
              Date.now() - 2584800000,
            ).toISOString(),
            contest_duration: '120',
            distinct_users: 1000,
          },
        ],
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
        json: jest.fn().mockResolvedValue({ status: 'success' }),
      } as unknown as Response);

      const contests = await adapter.fetchUpcomingContests();
      expect(contests).toHaveLength(0);
    });
  });

  describe('fetchRunningContests', () => {
    it('should return only running contests', async () => {
      const response = {
        status: 'success',
        present_contests: [
          {
            contest_code: 'RUNNING1',
            contest_name: 'Running Contest',
            contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
            contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() - 1800000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 5400000).toISOString(),
            contest_duration: '120',
            distinct_users: 5000,
          },
        ],
        future_contests: [
          {
            contest_code: 'FUTURE1',
            contest_name: 'Future Contest',
            contest_start_date: 'Sat, 04 Nov 2023 19:30:00 GMT',
            contest_end_date: 'Sat, 04 Nov 2023 22:30:00 GMT',
            contest_start_date_iso: new Date(
              Date.now() + 86400000,
            ).toISOString(),
            contest_end_date_iso: new Date(Date.now() + 97200000).toISOString(),
            contest_duration: '180',
            distinct_users: 0,
          },
        ],
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
    it('should transform future contest correctly', () => {
      const ccContest = {
        contest_code: 'START100',
        contest_name: 'Starters 100',
        contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
        contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
        contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
        contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
        contest_duration: '120',
        distinct_users: 0,
        contest_type: 'STARTERS',
      };

      const result = adapter.transformToInternalFormat(ccContest);

      expect(result).toMatchObject({
        platformId: 'START100',
        platform: ContestPlatform.CODECHEF,
        name: 'Starters 100',
        type: ContestType.STARTERS,
        phase: ContestPhase.BEFORE,
        difficulty: DifficultyLevel.BEGINNER,
        participantCount: 0,
        isActive: true,
      });
      expect(result.websiteUrl).toBe('https://www.codechef.com/START100');
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should calculate duration correctly', () => {
      const ccContest = {
        contest_code: 'TEST1',
        contest_name: 'Test Contest',
        contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
        contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
        contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
        contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
        contest_duration: '120',
        distinct_users: 0,
      };

      const result = adapter.transformToInternalFormat(ccContest);

      expect(result.durationMinutes).toBe(120);
    });

    it('should include platform metadata', () => {
      const ccContest = {
        contest_code: 'TEST1',
        contest_name: 'Test Contest',
        contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
        contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
        contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
        contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
        contest_duration: '120',
        distinct_users: 5000,
        contest_type: 'STARTERS',
      };

      const result = adapter.transformToInternalFormat(ccContest);

      expect(result.platformMetadata).toEqual({
        contest_code: 'TEST1',
        contest_type: 'STARTERS',
        distinct_users: 5000,
      });
    });

    it('should handle contest without distinct_users', () => {
      const ccContest = {
        contest_code: 'TEST1',
        contest_name: 'Test Contest',
        contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
        contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
        contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
        contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
        contest_duration: '120',
        distinct_users: 0,
      };

      const result = adapter.transformToInternalFormat(ccContest);

      expect(result.participantCount).toBe(0);
    });

    it('should detect contest type from name', () => {
      const testCases = [
        { name: 'Starters 100', expectedType: ContestType.STARTERS },
        { name: 'Lunchtime November', expectedType: ContestType.LUNCH_TIME },
        { name: 'Cook-Off December', expectedType: ContestType.COOK_OFF },
        { name: 'Long Challenge', expectedType: ContestType.LONG },
      ];

      testCases.forEach(({ name, expectedType }) => {
        const ccContest = {
          contest_code: 'TEST',
          contest_name: name,
          contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
          contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
          contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
          contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
          contest_duration: '120',
          distinct_users: 0,
        };

        const result = adapter.transformToInternalFormat(ccContest);
        expect(result.type).toBe(expectedType);
      });
    });

    it('should detect contest type from code', () => {
      const testCases = [
        { code: 'START100', expectedType: ContestType.STARTERS },
        { code: 'LTIME101', expectedType: ContestType.LUNCH_TIME },
        { code: 'COOK150', expectedType: ContestType.COOK_OFF },
      ];

      testCases.forEach(({ code, expectedType }) => {
        const ccContest = {
          contest_code: code,
          contest_name: 'Test Contest',
          contest_start_date: 'Wed, 01 Nov 2023 14:30:00 GMT',
          contest_end_date: 'Wed, 01 Nov 2023 16:30:00 GMT',
          contest_start_date_iso: new Date(Date.now() + 3600000).toISOString(),
          contest_end_date_iso: new Date(Date.now() + 10800000).toISOString(),
          contest_duration: '120',
          distinct_users: 0,
        };

        const result = adapter.transformToInternalFormat(ccContest);
        expect(result.type).toBe(expectedType);
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is accessible', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'success' }),
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
    it('should handle empty response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'success' }),
      } as unknown as Response);

      const contests = await adapter.fetchContests();
      expect(contests).toHaveLength(0);
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
