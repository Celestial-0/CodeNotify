import { Injectable } from '@nestjs/common';
import { BasePlatformAdapter } from '../base/platform-adapter.abstract';
import { ContestData, PlatformConfig } from '../base/platform.interface';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '../../../contests/schemas/contest.schema';
import {
  PLATFORM_URLS,
  PLATFORM_TIMEOUTS,
  HTTP_CONFIG,
  CONTEST_LIMITS,
  PLATFORM_METADATA,
} from '../../../common/common.constants';

/**
 * CodeChef API response types
 */
interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date: string; // ISO date string
  contest_end_date: string; // ISO date string
  contest_start_date_iso: string;
  contest_end_date_iso: string;
  contest_duration: string; // Duration in format like "180" (minutes)
  distinct_users: number;
  contest_type?: string;
}

interface CodeChefApiResponse {
  status: string;
  present_contests?: CodeChefContest[];
  future_contests?: CodeChefContest[];
  past_contests?: CodeChefContest[];
}

/**
 * CodeChef platform adapter
 * Fetches contest data from CodeChef's public API
 */
@Injectable()
export class CodeChefAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.CODECHEF;
  private readonly apiEndpoint = PLATFORM_URLS.CODECHEF;

  constructor() {
    const config: PlatformConfig = {
      enabled: true, // Now enabled with implementation
      apiUrl: PLATFORM_URLS.CODECHEF,
      timeout: PLATFORM_TIMEOUTS.CODECHEF,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }

  /**
   * Fetch all contests from CodeChef API
   */
  async fetchContests(): Promise<ContestData[]> {
    this.logger.log('Fetching contests from CodeChef API');

    try {
      const response = await this.makeRequest<CodeChefApiResponse>(
        this.apiEndpoint,
      );

      if (response.status !== 'success') {
        this.logger.warn('CodeChef API returned non-success status');
        return [];
      }

      const allContests: ContestData[] = [];

      // Process present (running) contests
      if (response.present_contests) {
        allContests.push(
          ...response.present_contests.map((contest) =>
            this.transformCodeChefContest(contest, 'present'),
          ),
        );
      }

      // Process future (upcoming) contests
      if (response.future_contests) {
        allContests.push(
          ...response.future_contests.map((contest) =>
            this.transformCodeChefContest(contest, 'future'),
          ),
        );
      }

      // Process past contests (limited to recent ones)
      if (response.past_contests) {
        const recentPast = response.past_contests.slice(
          0,
          CONTEST_LIMITS.CODECHEF_PAST_CONTESTS,
        ); // Only recent contests
        allContests.push(
          ...recentPast.map((contest) =>
            this.transformCodeChefContest(contest, 'past'),
          ),
        );
      }

      this.logger.log(
        `Successfully fetched ${allContests.length} contests from CodeChef`,
      );

      return allContests;
    } catch (error) {
      this.logger.error(
        `Failed to fetch contests from CodeChef: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Fetch upcoming contests from CodeChef
   */
  async fetchUpcomingContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterUpcoming(contests);
  }

  /**
   * Fetch running contests from CodeChef
   */
  async fetchRunningContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterRunning(contests);
  }

  /**
   * Transform CodeChef contest to internal format
   */
  transformToInternalFormat(data: any): ContestData {
    // For CodeChef, data is directly a CodeChefContest
    // We default to 'future' category since this is only called
    // when we need the base interface implementation
    return this.transformCodeChefContest(
      data as CodeChefContest,
      'future' as 'present' | 'future' | 'past',
    );
  }

  /**
   * Internal method to transform CodeChef contest with category
   */
  private transformCodeChefContest(
    ccContest: CodeChefContest,
    category: 'present' | 'future' | 'past',
  ): ContestData {
    const startTime = new Date(ccContest.contest_start_date_iso);
    const endTime = new Date(ccContest.contest_end_date_iso);
    const now = new Date();

    // Determine contest phase
    let phase: ContestPhase;
    if (category === 'future' || startTime > now) {
      phase = ContestPhase.BEFORE;
    } else if (category === 'present' || (startTime <= now && endTime > now)) {
      phase = ContestPhase.CODING;
    } else {
      phase = ContestPhase.FINISHED;
    }

    // Determine contest type based on name/code
    let type: ContestType = ContestType.LONG;
    const name = ccContest.contest_name.toLowerCase();
    const code = ccContest.contest_code.toLowerCase();

    if (name.includes('starters') || code.includes('start')) {
      type = ContestType.STARTERS;
    } else if (
      name.includes('lunchtime') ||
      name.includes('lunch time') ||
      code.includes('ltime')
    ) {
      type = ContestType.LUNCH_TIME;
    } else if (
      name.includes('cookoff') ||
      name.includes('cook-off') ||
      name.includes('cook off') ||
      code.includes('cook')
    ) {
      type = ContestType.COOK_OFF;
    } else if (name.includes('long')) {
      type = ContestType.LONG;
    }

    // Determine difficulty based on contest type
    let difficulty: DifficultyLevel | undefined;
    if (type === ContestType.STARTERS) {
      difficulty = DifficultyLevel.BEGINNER;
    } else if (type === ContestType.LUNCH_TIME) {
      difficulty = DifficultyLevel.MEDIUM;
    } else if (type === ContestType.COOK_OFF) {
      difficulty = DifficultyLevel.MEDIUM;
    } else if (type === ContestType.LONG) {
      difficulty = DifficultyLevel.HARD;
    }

    return {
      platformId: ccContest.contest_code,
      platform: ContestPlatform.CODECHEF,
      name: ccContest.contest_name,
      type,
      phase,
      startTime,
      endTime,
      durationMinutes: this.calculateDuration(startTime, endTime),
      websiteUrl: `${PLATFORM_METADATA.CODECHEF_CONTEST_URL_BASE}${ccContest.contest_code}`,
      participantCount: ccContest.distinct_users || 0,
      difficulty,
      isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
      platformMetadata: {
        contest_code: ccContest.contest_code,
        contest_type: ccContest.contest_type,
        distinct_users: ccContest.distinct_users,
      },
      lastSyncedAt: new Date(),
    };
  }
}
