import { Injectable } from '@nestjs/common';
import { BasePlatformAdapter } from '../base/platform-adapter.abstract';
import { ContestData, PlatformConfig } from '../base/platform.interface';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
} from '../../../contests/schemas/contest.schema';
import {
  PLATFORM_URLS,
  PLATFORM_TIMEOUTS,
  HTTP_CONFIG,
  LEETCODE_HEADERS,
  PLATFORM_METADATA,
} from '../../../common/common.constants';

/**
 * LeetCode GraphQL API response types
 */
interface LeetCodeContest {
  title: string;
  titleSlug: string;
  startTime: number; // Unix timestamp
  duration: number; // Duration in seconds
  originStartTime: number;
  isVirtual: boolean;
  cardImg?: string;
  description?: string;
}

interface LeetCodeGraphQLResponse {
  data: {
    allContests?: LeetCodeContest[];
    topTwoContests?: LeetCodeContest[];
  };
}

/**
 * LeetCode platform adapter using GraphQL API
 * Fetches contest data from LeetCode's public GraphQL endpoint
 */
@Injectable()
export class LeetCodeAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.LEETCODE;
  private readonly graphqlEndpoint = PLATFORM_URLS.LEETCODE;

  constructor() {
    const config: PlatformConfig = {
      enabled: true, // Now enabled with implementation
      apiUrl: PLATFORM_URLS.LEETCODE,
      timeout: PLATFORM_TIMEOUTS.LEETCODE,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }

  /**
   * Fetch all contests from LeetCode GraphQL API
   */
  async fetchContests(): Promise<ContestData[]> {
    this.logger.log('Fetching contests from LeetCode GraphQL API');

    try {
      // GraphQL query to fetch all contests
      const query = `
        query allContests {
          allContests {
            title
            titleSlug
            startTime
            duration
            originStartTime
            isVirtual
            cardImg
            description
          }
        }
      `;

      const response =
        await this.makeGraphQLRequest<LeetCodeGraphQLResponse>(query);

      if (!response.data?.allContests) {
        this.logger.warn('No contests found in LeetCode response');
        return [];
      }

      const contests = response.data.allContests.map((contest) =>
        this.transformToInternalFormat(contest),
      );

      this.logger.log(
        `Successfully fetched ${contests.length} contests from LeetCode`,
      );

      return contests;
    } catch (error) {
      this.logger.error(
        `Failed to fetch contests from LeetCode: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Fetch upcoming contests from LeetCode
   */
  async fetchUpcomingContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterUpcoming(contests);
  }

  /**
   * Fetch running contests from LeetCode
   */
  async fetchRunningContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterRunning(contests);
  }

  /**
   * Transform LeetCode contest to internal format
   */
  transformToInternalFormat(lcContest: LeetCodeContest): ContestData {
    const startTime = this.unixToDate(lcContest.startTime);
    const endTime = new Date(startTime.getTime() + lcContest.duration * 1000);
    const now = new Date();

    // Determine contest phase
    let phase: ContestPhase;
    if (startTime > now) {
      phase = ContestPhase.BEFORE;
    } else if (endTime > now) {
      phase = ContestPhase.CODING;
    } else {
      phase = ContestPhase.FINISHED;
    }

    // Determine contest type based on title
    let type: ContestType = ContestType.WEEKLY;
    if (lcContest.title.toLowerCase().includes('biweekly')) {
      type = ContestType.BIWEEKLY;
    } else if (lcContest.title.toLowerCase().includes('weekly')) {
      type = ContestType.WEEKLY;
    }

    return {
      platformId: lcContest.titleSlug,
      platform: ContestPlatform.LEETCODE,
      name: lcContest.title,
      type,
      phase,
      startTime,
      endTime,
      durationMinutes: Math.floor(lcContest.duration / 60),
      description: lcContest.description,
      websiteUrl: `${PLATFORM_METADATA.LEETCODE_CONTEST_URL_BASE}${lcContest.titleSlug}`,
      isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
      platformMetadata: {
        titleSlug: lcContest.titleSlug,
        isVirtual: lcContest.isVirtual,
        cardImg: lcContest.cardImg,
        originStartTime: lcContest.originStartTime,
      },
      lastSyncedAt: new Date(),
    };
  }

  /**
   * Make a GraphQL request to LeetCode API with retry logic
   */
  private async makeGraphQLRequest<T>(query: string): Promise<T> {
    const maxAttempts = this.config.retryAttempts || 3;
    const retryDelay = this.config.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout,
        );

        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': LEETCODE_HEADERS.CONTENT_TYPE,
            'User-Agent': HTTP_CONFIG.USER_AGENT,
            Origin: LEETCODE_HEADERS.ORIGIN,
            Referer: LEETCODE_HEADERS.REFERER,
          },
          body: JSON.stringify({ query }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as T;
        return data;
      } catch (error) {
        this.logger.error(
          `GraphQL request failed (attempt ${attempt}/${maxAttempts}): ${this.getErrorMessage(error)}`,
        );

        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('LeetCode GraphQL request timed out');
        }

        if (attempt === maxAttempts) {
          throw new Error(
            `Failed to fetch data from LeetCode after ${maxAttempts} attempts`,
          );
        }

        // Wait before retrying
        await this.sleep(retryDelay * attempt);
      }
    }

    throw new Error('Failed to fetch data from LeetCode');
  }

  /**
   * Health check for LeetCode API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const query = `
        query {
          allContests {
            title
          }
        }
      `;
      await this.makeGraphQLRequest(query);
      return true;
    } catch (error) {
      this.logger.error(
        `Health check failed for LeetCode: ${this.getErrorMessage(error)}`,
      );
      return false;
    }
  }
}
