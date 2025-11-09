import {
  ENV,
  DATABASE,
  getDatabaseName,
  AUTH,
  SCHEDULER,
  NOTIFICATIONS,
  WHATSAPP,
  PLATFORM_ENV,
  DB_NAME,
  IS_PUBLIC_KEY,
  PLATFORM_URLS,
  HTTP_CONFIG,
  PLATFORM_TIMEOUTS,
  PLATFORM_ADAPTERS_TOKEN,
  CONTEST_LIMITS,
  LEETCODE_HEADERS,
  PLATFORM_METADATA,
  TIME_CONSTANTS,
} from './common.constants';

describe('Common Constants', () => {
  describe('ENV', () => {
    it('should have PORT with default value', () => {
      expect(ENV.PORT).toBeDefined();
      expect(typeof ENV.PORT).toBe('string');
    });

    it('should have NODE_ENV with default value', () => {
      expect(ENV.NODE_ENV).toBeDefined();
      expect(typeof ENV.NODE_ENV).toBe('string');
    });

    it('should be readonly object', () => {
      expect(typeof ENV).toBe('object');
      expect(ENV).toHaveProperty('PORT');
      expect(ENV).toHaveProperty('NODE_ENV');
    });
  });

  describe('DATABASE', () => {
    it('should have MONGO_URI with default value', () => {
      expect(DATABASE.MONGO_URI).toBeDefined();
      expect(typeof DATABASE.MONGO_URI).toBe('string');
    });

    it('should have DB_NAME', () => {
      expect(DATABASE.DB_NAME).toBeDefined();
      expect(typeof DATABASE.DB_NAME).toBe('string');
    });

    it('should be readonly object', () => {
      expect(typeof DATABASE).toBe('object');
      expect(DATABASE).toHaveProperty('MONGO_URI');
      expect(DATABASE).toHaveProperty('DB_NAME');
    });
  });

  describe('getDatabaseName', () => {
    it('should return database name with -dev suffix in dev environment', () => {
      const result = getDatabaseName('dev', 'testdb');
      expect(result).toBe('testdb-dev');
    });

    it('should return database name without suffix in production', () => {
      const result = getDatabaseName('production', 'testdb');
      expect(result).toBe('testdb');
    });

    it('should use default values when no parameters provided', () => {
      const result = getDatabaseName();
      expect(result).toBe('codenotify-dev');
    });

    it('should handle custom base name with default dev environment', () => {
      const result = getDatabaseName('dev', 'customdb');
      expect(result).toBe('customdb-dev');
    });

    it('should handle any non-dev environment as production', () => {
      const result = getDatabaseName('staging', 'testdb');
      expect(result).toBe('testdb');
    });

    it('should handle empty string environment', () => {
      const result = getDatabaseName('', 'testdb');
      expect(result).toBe('testdb');
    });
  });

  describe('AUTH', () => {
    it('should have JWT_SECRET', () => {
      expect(AUTH.JWT_SECRET).toBeDefined();
      expect(typeof AUTH.JWT_SECRET).toBe('string');
    });

    it('should have JWT_REFRESH_SECRET', () => {
      expect(AUTH.JWT_REFRESH_SECRET).toBeDefined();
      expect(typeof AUTH.JWT_REFRESH_SECRET).toBe('string');
    });

    it('should have IS_PUBLIC_KEY', () => {
      expect(AUTH.IS_PUBLIC_KEY).toBeDefined();
      expect(typeof AUTH.IS_PUBLIC_KEY).toBe('string');
    });

    it('should be readonly object', () => {
      expect(typeof AUTH).toBe('object');
      expect(AUTH).toHaveProperty('JWT_SECRET');
      expect(AUTH).toHaveProperty('JWT_REFRESH_SECRET');
      expect(AUTH).toHaveProperty('IS_PUBLIC_KEY');
    });
  });

  describe('SCHEDULER', () => {
    it('should have CONTEST_SYNC_ENABLED as boolean', () => {
      expect(typeof SCHEDULER.CONTEST_SYNC_ENABLED).toBe('boolean');
    });

    it('should have CONTEST_SYNC_INTERVAL', () => {
      expect(SCHEDULER.CONTEST_SYNC_INTERVAL).toBeDefined();
      expect(typeof SCHEDULER.CONTEST_SYNC_INTERVAL).toBe('string');
    });

    it('should have CONTEST_CLEANUP_ENABLED as boolean', () => {
      expect(typeof SCHEDULER.CONTEST_CLEANUP_ENABLED).toBe('boolean');
    });

    it('should have CONTEST_CLEANUP_DAYS as number', () => {
      expect(typeof SCHEDULER.CONTEST_CLEANUP_DAYS).toBe('number');
      expect(SCHEDULER.CONTEST_CLEANUP_DAYS).toBeGreaterThan(0);
    });

    it('should have valid cron expression format', () => {
      expect(SCHEDULER.CONTEST_SYNC_INTERVAL).toMatch(/^[0-9*\s/,-]+$/);
    });
  });

  describe('NOTIFICATIONS', () => {
    it('should have ENABLED as boolean', () => {
      expect(typeof NOTIFICATIONS.ENABLED).toBe('boolean');
    });

    it('should have WINDOW_HOURS as number', () => {
      expect(typeof NOTIFICATIONS.WINDOW_HOURS).toBe('number');
      expect(NOTIFICATIONS.WINDOW_HOURS).toBeGreaterThan(0);
    });

    it('should be readonly object', () => {
      expect(typeof NOTIFICATIONS).toBe('object');
      expect(NOTIFICATIONS).toHaveProperty('ENABLED');
      expect(NOTIFICATIONS).toHaveProperty('WINDOW_HOURS');
    });
  });

  describe('WHATSAPP', () => {
    it('should have API_KEY', () => {
      expect(WHATSAPP.API_KEY).toBeDefined();
      expect(typeof WHATSAPP.API_KEY).toBe('string');
    });

    it('should have PHONE_ID', () => {
      expect(WHATSAPP.PHONE_ID).toBeDefined();
      expect(typeof WHATSAPP.PHONE_ID).toBe('string');
    });

    it('should have BUSINESS_ACCOUNT_ID', () => {
      expect(WHATSAPP.BUSINESS_ACCOUNT_ID).toBeDefined();
      expect(typeof WHATSAPP.BUSINESS_ACCOUNT_ID).toBe('string');
    });

    it('should be readonly object', () => {
      expect(typeof WHATSAPP).toBe('object');
      expect(WHATSAPP).toHaveProperty('API_KEY');
      expect(WHATSAPP).toHaveProperty('PHONE_ID');
      expect(WHATSAPP).toHaveProperty('BUSINESS_ACCOUNT_ID');
    });
  });

  describe('PLATFORM_ENV', () => {
    it('should have CODEFORCES_API with default URL', () => {
      expect(PLATFORM_ENV.CODEFORCES_API).toBeDefined();
      expect(PLATFORM_ENV.CODEFORCES_API).toContain('codeforces.com');
    });

    it('should have LEETCODE_API with default URL', () => {
      expect(PLATFORM_ENV.LEETCODE_API).toBeDefined();
      expect(PLATFORM_ENV.LEETCODE_API).toContain('leetcode.com');
    });

    it('should be readonly object', () => {
      expect(typeof PLATFORM_ENV).toBe('object');
      expect(PLATFORM_ENV).toHaveProperty('CODEFORCES_API');
      expect(PLATFORM_ENV).toHaveProperty('LEETCODE_API');
    });
  });

  describe('Legacy Exports', () => {
    it('should export DB_NAME', () => {
      expect(DB_NAME).toBeDefined();
      expect(DB_NAME).toBe(DATABASE.DB_NAME);
    });

    it('should export IS_PUBLIC_KEY', () => {
      expect(IS_PUBLIC_KEY).toBeDefined();
      expect(IS_PUBLIC_KEY).toBe(AUTH.IS_PUBLIC_KEY);
    });
  });

  describe('PLATFORM_URLS', () => {
    it('should have all platform URLs defined', () => {
      expect(PLATFORM_URLS.CODEFORCES).toBe('https://codeforces.com/api');
      expect(PLATFORM_URLS.LEETCODE).toBe('https://leetcode.com/graphql');
      expect(PLATFORM_URLS.CODECHEF).toBe(
        'https://www.codechef.com/api/list/contests/all',
      );
      expect(PLATFORM_URLS.ATCODER).toBe(
        'https://atcoder.jp/contests/?lang=en',
      );
      expect(PLATFORM_URLS.ATCODER_PROBLEMS).toBe(
        'https://kenkoooo.com/atcoder/resources/contests.json',
      );
    });

    it('should have valid URL format for all platforms', () => {
      Object.values(PLATFORM_URLS).forEach((url) => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('HTTP_CONFIG', () => {
    it('should have USER_AGENT', () => {
      expect(HTTP_CONFIG.USER_AGENT).toBe('CodeNotify/1.0');
    });

    it('should have DEFAULT_TIMEOUT', () => {
      expect(HTTP_CONFIG.DEFAULT_TIMEOUT).toBe(15000);
      expect(typeof HTTP_CONFIG.DEFAULT_TIMEOUT).toBe('number');
    });

    it('should have DEFAULT_RETRY_ATTEMPTS', () => {
      expect(HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS).toBe(3);
      expect(typeof HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS).toBe('number');
    });

    it('should have DEFAULT_RETRY_DELAY', () => {
      expect(HTTP_CONFIG.DEFAULT_RETRY_DELAY).toBe(1000);
      expect(typeof HTTP_CONFIG.DEFAULT_RETRY_DELAY).toBe('number');
    });

    it('should have positive timeout and retry values', () => {
      expect(HTTP_CONFIG.DEFAULT_TIMEOUT).toBeGreaterThan(0);
      expect(HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(HTTP_CONFIG.DEFAULT_RETRY_DELAY).toBeGreaterThan(0);
    });
  });

  describe('PLATFORM_TIMEOUTS', () => {
    it('should have timeout for each platform', () => {
      expect(PLATFORM_TIMEOUTS.CODEFORCES).toBe(10000);
      expect(PLATFORM_TIMEOUTS.LEETCODE).toBe(15000);
      expect(PLATFORM_TIMEOUTS.CODECHEF).toBe(15000);
      expect(PLATFORM_TIMEOUTS.ATCODER).toBe(15000);
    });

    it('should have all timeouts as numbers', () => {
      Object.values(PLATFORM_TIMEOUTS).forEach((timeout) => {
        expect(typeof timeout).toBe('number');
        expect(timeout).toBeGreaterThan(0);
      });
    });

    it('should have reasonable timeout values', () => {
      Object.values(PLATFORM_TIMEOUTS).forEach((timeout) => {
        expect(timeout).toBeGreaterThanOrEqual(5000);
        expect(timeout).toBeLessThanOrEqual(30000);
      });
    });
  });

  describe('PLATFORM_ADAPTERS_TOKEN', () => {
    it('should be defined as string', () => {
      expect(PLATFORM_ADAPTERS_TOKEN).toBe('PLATFORM_ADAPTERS');
      expect(typeof PLATFORM_ADAPTERS_TOKEN).toBe('string');
    });
  });

  describe('CONTEST_LIMITS', () => {
    it('should have CODECHEF_PAST_CONTESTS limit', () => {
      expect(CONTEST_LIMITS.CODECHEF_PAST_CONTESTS).toBe(20);
      expect(typeof CONTEST_LIMITS.CODECHEF_PAST_CONTESTS).toBe('number');
    });

    it('should have ATCODER_DAYS_FILTER', () => {
      expect(CONTEST_LIMITS.ATCODER_DAYS_FILTER).toBe(30);
      expect(typeof CONTEST_LIMITS.ATCODER_DAYS_FILTER).toBe('number');
    });

    it('should have positive limit values', () => {
      expect(CONTEST_LIMITS.CODECHEF_PAST_CONTESTS).toBeGreaterThan(0);
      expect(CONTEST_LIMITS.ATCODER_DAYS_FILTER).toBeGreaterThan(0);
    });
  });

  describe('LEETCODE_HEADERS', () => {
    it('should have CONTENT_TYPE', () => {
      expect(LEETCODE_HEADERS.CONTENT_TYPE).toBe('application/json');
    });

    it('should have ORIGIN', () => {
      expect(LEETCODE_HEADERS.ORIGIN).toBe('https://leetcode.com');
    });

    it('should have REFERER', () => {
      expect(LEETCODE_HEADERS.REFERER).toBe('https://leetcode.com');
    });

    it('should have valid header values', () => {
      expect(LEETCODE_HEADERS.CONTENT_TYPE).toMatch(/^[a-z]+\/[a-z]+$/);
      expect(LEETCODE_HEADERS.ORIGIN).toMatch(/^https:\/\/.+/);
      expect(LEETCODE_HEADERS.REFERER).toMatch(/^https:\/\/.+/);
    });
  });

  describe('PLATFORM_METADATA', () => {
    it('should have Codeforces metadata', () => {
      expect(PLATFORM_METADATA.CODEFORCES_API_BASE).toBe(
        'https://codeforces.com/api',
      );
      expect(PLATFORM_METADATA.CODEFORCES_CONTEST_ENDPOINT).toBe(
        '/contest.list',
      );
    });

    it('should have LeetCode metadata', () => {
      expect(PLATFORM_METADATA.LEETCODE_GRAPHQL_ENDPOINT).toBe(
        'https://leetcode.com/graphql',
      );
      expect(PLATFORM_METADATA.LEETCODE_CONTEST_URL_BASE).toBe(
        'https://leetcode.com/contest/',
      );
    });

    it('should have CodeChef metadata', () => {
      expect(PLATFORM_METADATA.CODECHEF_CONTEST_URL_BASE).toBe(
        'https://www.codechef.com/',
      );
    });

    it('should have AtCoder metadata', () => {
      expect(PLATFORM_METADATA.ATCODER_CONTEST_URL_BASE).toBe(
        'https://atcoder.jp/contests/',
      );
    });

    it('should have valid URL formats', () => {
      expect(PLATFORM_METADATA.CODEFORCES_API_BASE).toMatch(/^https:\/\/.+/);
      expect(PLATFORM_METADATA.LEETCODE_GRAPHQL_ENDPOINT).toMatch(
        /^https:\/\/.+/,
      );
      expect(PLATFORM_METADATA.CODECHEF_CONTEST_URL_BASE).toMatch(
        /^https:\/\/.+/,
      );
      expect(PLATFORM_METADATA.ATCODER_CONTEST_URL_BASE).toMatch(
        /^https:\/\/.+/,
      );
    });
  });

  describe('TIME_CONSTANTS', () => {
    it('should have SECONDS_TO_MS conversion', () => {
      expect(TIME_CONSTANTS.SECONDS_TO_MS).toBe(1000);
    });

    it('should have MINUTES_TO_SECONDS conversion', () => {
      expect(TIME_CONSTANTS.MINUTES_TO_SECONDS).toBe(60);
    });

    it('should have HOURS_TO_SECONDS conversion', () => {
      expect(TIME_CONSTANTS.HOURS_TO_SECONDS).toBe(3600);
    });

    it('should have DAYS_TO_SECONDS conversion', () => {
      expect(TIME_CONSTANTS.DAYS_TO_SECONDS).toBe(86400);
    });

    it('should have correct time conversion calculations', () => {
      expect(
        TIME_CONSTANTS.MINUTES_TO_SECONDS * TIME_CONSTANTS.SECONDS_TO_MS,
      ).toBe(60000);
      expect(
        TIME_CONSTANTS.HOURS_TO_SECONDS * TIME_CONSTANTS.SECONDS_TO_MS,
      ).toBe(3600000);
      expect(
        TIME_CONSTANTS.DAYS_TO_SECONDS * TIME_CONSTANTS.SECONDS_TO_MS,
      ).toBe(86400000);
    });

    it('should have all positive values', () => {
      Object.values(TIME_CONSTANTS).forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Const Assertions', () => {
    it('should have ENV as readonly object', () => {
      expect(typeof ENV).toBe('object');
      expect(ENV).toBeDefined();
    });

    it('should have DATABASE as readonly object', () => {
      expect(typeof DATABASE).toBe('object');
      expect(DATABASE).toBeDefined();
    });

    it('should have AUTH as readonly object', () => {
      expect(typeof AUTH).toBe('object');
      expect(AUTH).toBeDefined();
    });

    it('should have PLATFORM_URLS as readonly object', () => {
      expect(typeof PLATFORM_URLS).toBe('object');
      expect(PLATFORM_URLS).toBeDefined();
    });
  });
});
