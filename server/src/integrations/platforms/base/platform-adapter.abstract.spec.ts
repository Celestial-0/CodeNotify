import { Logger } from '@nestjs/common';
import { BasePlatformAdapter } from './platform-adapter.abstract';
import { ContestData, PlatformConfig } from './platform.interface';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
} from '../../../contests/schemas/contest.schema';

class TestPlatformAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.CODEFORCES;

  async fetchContests(): Promise<ContestData[]> {
    return Promise.resolve([]);
  }

  async fetchUpcomingContests(): Promise<ContestData[]> {
    return this.filterUpcoming(await this.fetchContests());
  }

  async fetchRunningContests(): Promise<ContestData[]> {
    return this.filterRunning(await this.fetchContests());
  }

  transformToInternalFormat(data: Record<string, string>): ContestData {
    return {
      platformId: data['id'] || 'test',
      platform: this.platformName,
      name: data['name'] || 'Test Contest',
      type: ContestType.CF,
      phase: ContestPhase.BEFORE,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7200000),
      durationMinutes: 120,
      isActive: true,
    };
  }
}

describe('BasePlatformAdapter', () => {
  let adapter: TestPlatformAdapter;
  let config: PlatformConfig;

  beforeEach(() => {
    config = {
      enabled: true,
      apiUrl: 'https://api.example.com',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    };
    adapter = new TestPlatformAdapter(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should store config correctly', () => {
      expect(adapter.config).toEqual(config);
    });

    it('should have a logger', () => {
      expect(adapter['logger']).toBeInstanceOf(Logger);
    });
  });

  describe('makeRequest', () => {
    it('should make successful HTTP request', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await adapter['makeRequest']<typeof mockResponse>(
        'https://api.example.com/test',
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalled();
      const firstCall = (global.fetch as jest.Mock).mock.calls[0] as [
        string,
        RequestInit,
      ];
      expect(firstCall[0]).toBe('https://api.example.com/test');
      const headers = firstCall[1].headers as Record<string, string>;
      expect(headers['User-Agent']).toBe('CodeNotify/1.0');
    });

    it('should include custom headers', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      await adapter['makeRequest']<typeof mockResponse>(
        'https://api.example.com/test',
        {
          headers: {
            'Custom-Header': 'value',
          },
        },
      );

      expect(global.fetch).toHaveBeenCalled();
      const firstCall = (global.fetch as jest.Mock).mock.calls[0] as [
        string,
        RequestInit,
      ];
      expect(firstCall[0]).toBe('https://api.example.com/test');
      const headers = firstCall[1].headers as Record<string, string>;
      expect(headers['User-Agent']).toBe('CodeNotify/1.0');
      expect(headers['Custom-Header']).toBe('value');
    });

    it('should handle HTTP errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        adapter['makeRequest']('https://api.example.com/test'),
      ).rejects.toThrow();
    });

    it('should retry on failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: 'success' }),
        } as unknown as Response);
      });

      const result = await adapter['makeRequest']<{ data: string }>(
        'https://api.example.com/test',
      );

      expect(result).toEqual({ data: 'success' });
      expect(callCount).toBe(3);
    });

    it('should fail after max retry attempts', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        adapter['makeRequest']('https://api.example.com/test'),
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(3);
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

      await expect(
        adapter['makeRequest']('https://api.example.com/test'),
      ).rejects.toThrow();
    }, 10000);

    it('should clear timeout on successful response', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      } as unknown as Response);

      await adapter['makeRequest']('https://api.example.com/test');

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should retry multiple times before succeeding', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: 'success' }),
        } as unknown as Response);
      });

      const result = await adapter['makeRequest']<{ data: string }>(
        'https://api.example.com/test',
      );

      expect(result).toEqual({ data: 'success' });
      expect(callCount).toBe(2);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is accessible', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      const result = await adapter.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is not accessible', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await adapter.healthCheck();
      expect(result).toBe(false);
    });

    it('should use config apiUrl', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      await adapter.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        config.apiUrl,
        expect.any(Object),
      );
    });
  });

  describe('utility methods', () => {
    describe('sleep', () => {
      it('should wait for specified milliseconds', async () => {
        const start = Date.now();
        await adapter['sleep'](100);
        const end = Date.now();

        expect(end - start).toBeGreaterThanOrEqual(100);
      });
    });

    describe('getErrorMessage', () => {
      it('should extract message from Error object', () => {
        const error = new Error('Test error');
        const message = adapter['getErrorMessage'](error);

        expect(message).toBe('Test error');
      });

      it('should convert non-Error to string', () => {
        const message = adapter['getErrorMessage']('String error');

        expect(message).toBe('String error');
      });

      it('should handle number errors', () => {
        const message = adapter['getErrorMessage'](404);

        expect(message).toBe('404');
      });

      it('should handle object errors', () => {
        const message = adapter['getErrorMessage']({ code: 'ERR_001' });

        expect(message).toContain('ERR_001');
      });
    });

    describe('unixToDate', () => {
      it('should convert Unix timestamp to Date', () => {
        const timestamp = 1609459200;
        const date = adapter['unixToDate'](timestamp);

        expect(date).toBeInstanceOf(Date);
        expect(date.getTime()).toBe(timestamp * 1000);
      });

      it('should handle zero timestamp', () => {
        const date = adapter['unixToDate'](0);

        expect(date.getTime()).toBe(0);
      });

      it('should handle current timestamp', () => {
        const now = Math.floor(Date.now() / 1000);
        const date = adapter['unixToDate'](now);

        expect(date.getTime()).toBeCloseTo(now * 1000, -2);
      });
    });

    describe('calculateDuration', () => {
      it('should calculate duration in minutes', () => {
        const startTime = new Date('2023-01-01T10:00:00Z');
        const endTime = new Date('2023-01-01T12:00:00Z');

        const duration = adapter['calculateDuration'](startTime, endTime);

        expect(duration).toBe(120);
      });

      it('should handle zero duration', () => {
        const time = new Date();
        const duration = adapter['calculateDuration'](time, time);

        expect(duration).toBe(0);
      });

      it('should round to nearest minute', () => {
        const startTime = new Date('2023-01-01T10:00:00Z');
        const endTime = new Date('2023-01-01T10:01:30Z');

        const duration = adapter['calculateDuration'](startTime, endTime);

        expect(duration).toBe(2);
      });
    });

    describe('filterUpcoming', () => {
      it('should filter upcoming contests', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'Future Contest',
            type: ContestType.CF,
            phase: ContestPhase.BEFORE,
            startTime: new Date(Date.now() + 3600000),
            endTime: new Date(Date.now() + 10800000),
            durationMinutes: 120,
            isActive: true,
          },
          {
            platformId: '2',
            platform: ContestPlatform.CODEFORCES,
            name: 'Past Contest',
            type: ContestType.CF,
            phase: ContestPhase.FINISHED,
            startTime: new Date(Date.now() - 10800000),
            endTime: new Date(Date.now() - 3600000),
            durationMinutes: 120,
            isActive: false,
          },
        ];

        const upcoming = adapter['filterUpcoming'](contests);

        expect(upcoming).toHaveLength(1);
        expect(upcoming[0].name).toBe('Future Contest');
      });

      it('should return empty array when no upcoming contests', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'Past Contest',
            type: ContestType.CF,
            phase: ContestPhase.FINISHED,
            startTime: new Date(Date.now() - 10800000),
            endTime: new Date(Date.now() - 3600000),
            durationMinutes: 120,
            isActive: false,
          },
        ];

        const upcoming = adapter['filterUpcoming'](contests);

        expect(upcoming).toHaveLength(0);
      });
    });

    describe('filterRunning', () => {
      it('should filter running contests', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'Running Contest',
            type: ContestType.CF,
            phase: ContestPhase.CODING,
            startTime: new Date(Date.now() - 1800000),
            endTime: new Date(Date.now() + 5400000),
            durationMinutes: 120,
            isActive: true,
          },
          {
            platformId: '2',
            platform: ContestPlatform.CODEFORCES,
            name: 'Future Contest',
            type: ContestType.CF,
            phase: ContestPhase.BEFORE,
            startTime: new Date(Date.now() + 3600000),
            endTime: new Date(Date.now() + 10800000),
            durationMinutes: 120,
            isActive: true,
          },
        ];

        const running = adapter['filterRunning'](contests);

        expect(running).toHaveLength(1);
        expect(running[0].name).toBe('Running Contest');
      });

      it('should return empty array when no running contests', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'Future Contest',
            type: ContestType.CF,
            phase: ContestPhase.BEFORE,
            startTime: new Date(Date.now() + 3600000),
            endTime: new Date(Date.now() + 10800000),
            durationMinutes: 120,
            isActive: true,
          },
        ];

        const running = adapter['filterRunning'](contests);

        expect(running).toHaveLength(0);
      });

      it('should include contests that just started', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'Just Started',
            type: ContestType.CF,
            phase: ContestPhase.CODING,
            startTime: new Date(Date.now() - 1000),
            endTime: new Date(Date.now() + 7199000),
            durationMinutes: 120,
            isActive: true,
          },
        ];

        const running = adapter['filterRunning'](contests);

        expect(running).toHaveLength(1);
      });

      it('should include contests about to end', () => {
        const contests: ContestData[] = [
          {
            platformId: '1',
            platform: ContestPlatform.CODEFORCES,
            name: 'About to End',
            type: ContestType.CF,
            phase: ContestPhase.CODING,
            startTime: new Date(Date.now() - 7199000),
            endTime: new Date(Date.now() + 1000),
            durationMinutes: 120,
            isActive: true,
          },
        ];

        const running = adapter['filterRunning'](contests);

        expect(running).toHaveLength(1);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty contests array in filters', () => {
      expect(adapter['filterUpcoming']([])).toHaveLength(0);
      expect(adapter['filterRunning']([])).toHaveLength(0);
    });

    it('should handle request with custom options', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      } as unknown as Response);

      await adapter['makeRequest']('https://api.example.com/test', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' }),
        }),
      );
    });
  });
});
