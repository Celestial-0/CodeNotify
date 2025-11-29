/**
 * Contest Service
 * API calls for contest-related operations
 */

import { httpClient } from './http.client';
import type {
  ContestQueryDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
  ContestStatsDto,
  PlatformStatsDto,
  ContestPlatform,
  CreateContestDto,
  UpdateContestDto,
} from '@/lib/types/contest.types';

export class ContestService {
  /**
   * Get paginated list of contests
   */
  static async getContests(query?: ContestQueryDto): Promise<PaginatedContestResponseDto> {
    const response = await httpClient.api.get<PaginatedContestResponseDto>(
      '/contests',
      { params: query }
    );
    return response.data;
  }

  /**
   * Get a single contest by ID
   */
  static async getContestById(id: string): Promise<ContestResponseDto> {
    const response = await httpClient.api.get<ContestResponseDto>(`/contests/${id}`);
    return response.data;
  }

  /**
   * Get upcoming contests
   */
  static async getUpcomingContests(platform?: ContestPlatform): Promise<ContestResponseDto[]> {
    const response = await httpClient.api.get<ContestResponseDto[]>(
      '/contests/upcoming',
      { params: { platform } }
    );
    return response.data;
  }

  /**
   * Get currently running contests
   */
  static async getRunningContests(platform?: ContestPlatform): Promise<ContestResponseDto[]> {
    const response = await httpClient.api.get<ContestResponseDto[]>(
      '/contests/running',
      { params: { platform } }
    );
    return response.data;
  }

  /**
   * Get finished contests
   */
  static async getFinishedContests(platform?: ContestPlatform): Promise<ContestResponseDto[]> {
    const response = await httpClient.api.get<ContestResponseDto[]>(
      '/contests/finished',
      { params: { platform } }
    );
    return response.data;
  }

  /**
   * Search contests by query string
   */
  static async searchContests(query: string): Promise<ContestResponseDto[]> {
    const response = await httpClient.api.get<ContestResponseDto[]>(
      '/contests/search',
      { params: { q: query } }
    );
    return response.data;
  }

  /**
   * Get overall contest statistics
   */
  static async getContestStats(): Promise<ContestStatsDto> {
    const response = await httpClient.api.get<ContestStatsDto>('/contests/stats');
    return response.data;
  }

  /**
   * Get statistics for a specific platform
   */
  static async getPlatformStats(platform: ContestPlatform): Promise<PlatformStatsDto> {
    const response = await httpClient.api.get<PlatformStatsDto>(
      `/contests/stats/${platform}`
    );
    return response.data;
  }

  // ==================== Admin Methods ====================

  /**
   * Sync all platforms (Admin only)
   */
  static async syncAllPlatforms(): Promise<{
    message: string;
    results: Record<string, { synced: number; updated: number; failed: number }>;
  }> {
    const response = await httpClient.api.post('/contests/sync/all');
    return response.data;
  }

  /**
   * Sync a specific platform (Admin only)
   */
  static async syncPlatform(
    platform: string,
    forceSync: boolean = false
  ): Promise<{
    message: string;
    platform: string;
    synced: number;
    updated: number;
    failed: number;
  }> {
    const response = await httpClient.api.post(`/contests/sync/${platform}`, { forceSync });
    return response.data;
  }

  /**
   * Create a new contest (Admin only)
   */
  static async createContest(data: CreateContestDto): Promise<ContestResponseDto> {
    const response = await httpClient.api.post('/contests', data);
    return response.data;
  }

  /**
   * Update an existing contest (Admin only)
   */
  static async updateContest(id: string, data: UpdateContestDto): Promise<ContestResponseDto> {
    const response = await httpClient.api.patch(`/contests/${id}`, data);
    return response.data;
  }

  /**
   * Delete a contest (Admin only)
   */
  static async deleteContest(id: string): Promise<void> {
    await httpClient.api.delete(`/contests/${id}`);
  }

  /**
   * Bulk create contests (Admin only)
   */
  static async bulkCreateContests(contests: CreateContestDto[]): Promise<ContestResponseDto[]> {
    const response = await httpClient.api.post('/contests/bulk', { contests });
    return response.data;
  }
}
