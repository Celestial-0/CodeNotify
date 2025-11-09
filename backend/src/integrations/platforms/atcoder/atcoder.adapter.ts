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
  TIME_CONSTANTS,
} from '../../../common/common.constants';

/**
 * AtCoder API response types
 */
interface AtCoderContest {
  id: string;
  start_epoch_second: number; // Unix timestamp
  duration_second: number;
  title: string;
  rate_change: string; // e.g., "All", "1200 - 1999", etc.
}

/**
 * AtCoder platform adapter
 * Fetches contest data from AtCoder's JSON API
 */
@Injectable()
export class AtCoderAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.ATCODER;
  private readonly apiEndpoint = PLATFORM_URLS.ATCODER;

  constructor() {
    const config: PlatformConfig = {
      enabled: true, // Now enabled with implementation
      apiUrl: PLATFORM_URLS.ATCODER,
      timeout: PLATFORM_TIMEOUTS.ATCODER,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }

  /**
   * Fetch all contests from AtCoder
   * Note: AtCoder doesn't have a public JSON API, so we use a community-maintained endpoint
   */
  async fetchContests(): Promise<ContestData[]> {
    this.logger.log('Fetching contests from AtCoder');

    try {
      // Using AtCoder Problems API (community-maintained)
      const contests = await this.makeRequest<AtCoderContest[]>(
        PLATFORM_URLS.ATCODER_PROBLEMS,
      );

      if (!Array.isArray(contests)) {
        this.logger.warn('Invalid response from AtCoder API');
        return [];
      }

      // Filter to only include recent and upcoming contests (last N days and future)
      const thirtyDaysAgo =
        Date.now() / TIME_CONSTANTS.SECONDS_TO_MS -
        CONTEST_LIMITS.ATCODER_DAYS_FILTER * TIME_CONSTANTS.DAYS_TO_SECONDS;
      const recentContests = contests.filter(
        (contest) => contest.start_epoch_second >= thirtyDaysAgo,
      );

      const transformedContests = recentContests.map((contest) =>
        this.transformToInternalFormat(contest),
      );

      this.logger.log(
        `Successfully fetched ${transformedContests.length} contests from AtCoder`,
      );

      return transformedContests;
    } catch (error) {
      this.logger.error(
        `Failed to fetch contests from AtCoder: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Fetch upcoming contests from AtCoder
   */
  async fetchUpcomingContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterUpcoming(contests);
  }

  /**
   * Fetch running contests from AtCoder
   */
  async fetchRunningContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterRunning(contests);
  }

  /**
   * Transform AtCoder contest to internal format
   */
  transformToInternalFormat(acContest: any): ContestData {
    const contest = acContest as AtCoderContest;
    const startTime = this.unixToDate(contest.start_epoch_second);
    const endTime = new Date(
      startTime.getTime() + contest.duration_second * 1000,
    );
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
    let type: ContestType = ContestType.ABC;
    const title = contest.title.toUpperCase();

    if (title.includes('ABC') || title.includes('BEGINNER')) {
      type = ContestType.ABC;
    } else if (title.includes('ARC') || title.includes('REGULAR')) {
      type = ContestType.ARC;
    } else if (title.includes('AGC') || title.includes('GRAND')) {
      type = ContestType.AGC;
    } else if (title.includes('AHC') || title.includes('HEURISTIC')) {
      type = ContestType.AHC;
    }

    // Determine difficulty based on contest type
    let difficulty: DifficultyLevel | undefined;
    if (type === ContestType.ABC) {
      difficulty = DifficultyLevel.BEGINNER;
    } else if (type === ContestType.ARC) {
      difficulty = DifficultyLevel.MEDIUM;
    } else if (type === ContestType.AGC) {
      difficulty = DifficultyLevel.EXPERT;
    } else if (type === ContestType.AHC) {
      difficulty = DifficultyLevel.HARD;
    }

    return {
      platformId: contest.id,
      platform: ContestPlatform.ATCODER,
      name: contest.title,
      type,
      phase,
      startTime,
      endTime,
      durationMinutes: Math.floor(contest.duration_second / 60),
      websiteUrl: `${PLATFORM_METADATA.ATCODER_CONTEST_URL_BASE}${contest.id}`,
      difficulty,
      isActive: phase === ContestPhase.BEFORE || phase === ContestPhase.CODING,
      platformMetadata: {
        rate_change: contest.rate_change,
        contest_id: contest.id,
      },
      lastSyncedAt: new Date(),
    };
  }
}
