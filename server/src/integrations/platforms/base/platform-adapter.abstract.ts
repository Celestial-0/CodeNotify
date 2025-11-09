import { Logger } from '@nestjs/common';
import {
  PlatformAdapter,
  PlatformConfig,
  ContestData,
} from './platform.interface';
import { ContestPlatform } from '../../../contests/schemas/contest.schema';
import { HTTP_CONFIG } from '../../../common/common.constants';

/**
 * Abstract base class for platform adapters
 * Provides common functionality for all platform integrations
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  protected readonly logger: Logger;

  constructor(public readonly config: PlatformConfig) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract readonly platformName: ContestPlatform;
  abstract fetchContests(): Promise<ContestData[]>;
  abstract fetchUpcomingContests(): Promise<ContestData[]>;
  abstract fetchRunningContests(): Promise<ContestData[]>;
  abstract transformToInternalFormat(data: any): ContestData;

  /**
   * Make HTTP request with retry logic and error handling
   */
  protected async makeRequest<T>(
    url: string,
    options?: RequestInit,
  ): Promise<T> {
    const maxAttempts = this.config.retryAttempts || 3;
    const retryDelay = this.config.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout,
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'User-Agent': HTTP_CONFIG.USER_AGENT,
            ...options?.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        this.logger.error(
          `Request failed (attempt ${attempt}/${maxAttempts}): ${this.getErrorMessage(error)}`,
        );

        if (attempt === maxAttempts) {
          throw new Error(
            `Failed to fetch data from ${this.platformName} after ${maxAttempts} attempts`,
          );
        }

        // Wait before retrying
        await this.sleep(retryDelay * attempt);
      }
    }

    throw new Error(`Failed to fetch data from ${this.platformName}`);
  }

  /**
   * Health check implementation
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest(this.config.apiUrl);
      return true;
    } catch (error) {
      this.logger.error(
        `Health check failed for ${this.platformName}: ${this.getErrorMessage(error)}`,
      );
      return false;
    }
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Utility: Extract error message from unknown error
   */
  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      return JSON.stringify(error);
    }
    return String(error);
  }

  /**
   * Utility: Convert Unix timestamp to Date
   */
  protected unixToDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Utility: Calculate duration in minutes between two dates
   */
  protected calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Utility: Filter contests by time
   */
  protected filterUpcoming(contests: ContestData[]): ContestData[] {
    const now = new Date();
    return contests.filter((contest) => contest.startTime > now);
  }

  /**
   * Utility: Filter running contests
   */
  protected filterRunning(contests: ContestData[]): ContestData[] {
    const now = new Date();
    return contests.filter(
      (contest) => contest.startTime <= now && contest.endTime >= now,
    );
  }
}
