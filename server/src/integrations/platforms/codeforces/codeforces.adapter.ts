import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  PLATFORM_METADATA,
} from '../../../common/common.constants';

// Codeforces API response types
interface CodeforcesContest {
  id: number;
  name: string;
  type: string; // CF, ICPC, IOI, etc.
  phase: string; // BEFORE, CODING, FINISHED, etc.
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

interface CodeforcesApiResponse {
  status: string;
  result: CodeforcesContest[];
}

@Injectable()
export class CodeforcesAdapter extends BasePlatformAdapter {
  readonly platformName = ContestPlatform.CODEFORCES;
  private readonly apiBaseUrl = PLATFORM_URLS.CODEFORCES;

  constructor(private readonly configService: ConfigService) {
    const config: PlatformConfig = {
      enabled: true,
      apiUrl: PLATFORM_URLS.CODEFORCES,
      timeout: PLATFORM_TIMEOUTS.CODEFORCES,
      retryAttempts: HTTP_CONFIG.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: HTTP_CONFIG.DEFAULT_RETRY_DELAY,
    };
    super(config);
  }

  /**
   * Fetch all contests from Codeforces API
   */
  async fetchContests(): Promise<ContestData[]> {
    this.logger.log('Fetching contests from Codeforces API');

    try {
      const data = await this.makeRequest<CodeforcesApiResponse>(
        `${this.apiBaseUrl}${PLATFORM_METADATA.CODEFORCES_CONTEST_ENDPOINT}`,
      );

      if (data.status !== 'OK') {
        throw new Error('Codeforces API returned error status');
      }

      this.logger.log(
        `Successfully fetched ${data.result.length} contests from Codeforces`,
      );

      return data.result.map((contest) =>
        this.transformToInternalFormat(contest),
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch contests from Codeforces: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * Fetch upcoming contests (BEFORE phase)
   */
  async fetchUpcomingContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterUpcoming(contests);
  }

  /**
   * Fetch running contests (CODING phase)
   */
  async fetchRunningContests(): Promise<ContestData[]> {
    const contests = await this.fetchContests();
    return this.filterRunning(contests);
  }

  /**
   * Transform Codeforces contest to our internal format
   */
  transformToInternalFormat(cfContest: CodeforcesContest): ContestData {
    const startTime = cfContest.startTimeSeconds
      ? this.unixToDate(cfContest.startTimeSeconds)
      : new Date();

    const endTime = cfContest.startTimeSeconds
      ? this.unixToDate(cfContest.startTimeSeconds + cfContest.durationSeconds)
      : new Date(Date.now() + cfContest.durationSeconds * 1000);

    // Map Codeforces phase to our phase enum
    const phaseMap: Record<string, ContestPhase> = {
      BEFORE: ContestPhase.BEFORE,
      CODING: ContestPhase.CODING,
      PENDING_SYSTEM_TEST: ContestPhase.PENDING_SYSTEM_TEST,
      SYSTEM_TEST: ContestPhase.SYSTEM_TEST,
      FINISHED: ContestPhase.FINISHED,
    };

    // Map Codeforces type to our type enum
    const typeMap: Record<string, ContestType> = {
      CF: ContestType.CF,
      IOI: ContestType.IOI,
      ICPC: ContestType.ICPC,
    };

    return {
      platformId: cfContest.id.toString(),
      platform: ContestPlatform.CODEFORCES,
      name: cfContest.name,
      type: typeMap[cfContest.type] || ContestType.CF,
      phase: phaseMap[cfContest.phase] || ContestPhase.BEFORE,
      startTime,
      endTime,
      durationMinutes: Math.floor(cfContest.durationSeconds / 60),
      websiteUrl: `https://codeforces.com/contest/${cfContest.id}`,
      isActive: cfContest.phase === 'BEFORE' || cfContest.phase === 'CODING',
      platformMetadata: {
        frozen: cfContest.frozen,
        relativeTimeSeconds: cfContest.relativeTimeSeconds,
      },
      lastSyncedAt: new Date(),
    };
  }
}
