import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '../../../contests/schemas/contest.schema';

/**
 * Unified contest data format that all platform adapters must return
 */
export interface ContestData {
  platformId: string;
  name: string;
  platform: ContestPlatform;
  phase: ContestPhase;
  type: ContestType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata?: Record<string, any>;
  isActive?: boolean;
  lastSyncedAt?: Date;
}

/**
 * Base interface that all platform adapters must implement
 * This ensures consistent behavior across all competitive programming platforms
 */
export interface PlatformAdapter {
  /**
   * Unique identifier for the platform (e.g., 'codeforces', 'leetcode')
   */
  readonly platformName: ContestPlatform;

  /**
   * Fetch all contests from the platform
   * @returns Array of contest data in unified format
   */
  fetchContests(): Promise<ContestData[]>;

  /**
   * Fetch only upcoming contests from the platform
   * @returns Array of upcoming contest data
   */
  fetchUpcomingContests(): Promise<ContestData[]>;

  /**
   * Fetch only currently running contests from the platform
   * @returns Array of running contest data
   */
  fetchRunningContests(): Promise<ContestData[]>;

  /**
   * Transform platform-specific data to internal unified format
   * @param data Raw data from platform API
   * @returns Transformed contest data
   */
  transformToInternalFormat(data: any): ContestData;

  /**
   * Check if the platform adapter is healthy and can connect to the API
   * @returns True if healthy, false otherwise
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Configuration interface for platform adapters
 */
export interface PlatformConfig {
  enabled: boolean;
  apiUrl: string;
  timeout: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Result of a platform sync operation
 */
export interface PlatformSyncResult {
  platform: ContestPlatform;
  synced: number;
  updated: number;
  failed: number;
  timestamp: Date;
  errors?: string[];
}
