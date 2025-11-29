'use client';

import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { ContestService } from '@/lib/api';
import {
  ContestQueryDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
  ContestStatsDto,
  PlatformStatsDto,
  ContestPlatform,
} from '@/lib/types/contest.types';

// Query keys for caching
export const contestKeys = {
  all: ['contests'] as const,
  lists: () => [...contestKeys.all, 'list'] as const,
  list: (filters: ContestQueryDto) =>
    [...contestKeys.lists(), filters] as const,
  details: () => [...contestKeys.all, 'detail'] as const,
  detail: (id: string) => [...contestKeys.details(), id] as const,
  upcoming: (platform?: ContestPlatform) =>
    [...contestKeys.all, 'upcoming', platform] as const,
  running: (platform?: ContestPlatform) =>
    [...contestKeys.all, 'running', platform] as const,
  finished: (platform?: ContestPlatform) =>
    [...contestKeys.all, 'finished', platform] as const,
  search: (query: string) => [...contestKeys.all, 'search', query] as const,
  stats: () => [...contestKeys.all, 'stats'] as const,
  platformStats: (platform: ContestPlatform) =>
    [...contestKeys.all, 'platformStats', platform] as const,
};

// ==================== Contest List Hook ====================

export function useContests(
  query: ContestQueryDto = { limit: 20, offset: 0 },
  options?: Omit<
    UseQueryOptions<PaginatedContestResponseDto, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedContestResponseDto, Error>({
    queryKey: contestKeys.list(query),
    queryFn: () => ContestService.getContests(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    ...options,
  });
}

// ==================== Contest Detail Hook ====================

export function useContest(
  id: string,
  options?: Omit<
    UseQueryOptions<ContestResponseDto, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestResponseDto, Error>({
    queryKey: contestKeys.detail(id),
    queryFn: () => ContestService.getContestById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
    ...options,
  });
}

// ==================== Upcoming Contests Hook ====================

export function useUpcomingContests(
  platform?: ContestPlatform,
  options?: Omit<
    UseQueryOptions<ContestResponseDto[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestResponseDto[], Error>({
    queryKey: contestKeys.upcoming(platform),
    queryFn: () => ContestService.getUpcomingContests(platform),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ==================== Running Contests Hook ====================

export function useRunningContests(
  platform?: ContestPlatform,
  options?: Omit<
    UseQueryOptions<ContestResponseDto[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestResponseDto[], Error>({
    queryKey: contestKeys.running(platform),
    queryFn: () => ContestService.getRunningContests(platform),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for running contests)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    ...options,
  });
}

// ==================== Finished Contests Hook ====================

export function useFinishedContests(
  platform?: ContestPlatform,
  options?: Omit<
    UseQueryOptions<ContestResponseDto[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestResponseDto[], Error>({
    queryKey: contestKeys.finished(platform),
    queryFn: () => ContestService.getFinishedContests(platform),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

// ==================== Search Contests Hook ====================

export function useSearchContests(
  searchQuery: string,
  options?: Omit<
    UseQueryOptions<ContestResponseDto[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestResponseDto[], Error>({
    queryKey: contestKeys.search(searchQuery),
    queryFn: () => ContestService.searchContests(searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: searchQuery.length > 0,
    ...options,
  });
}

// ==================== Contest Stats Hook ====================

export function useContestStats(
  options?: Omit<
    UseQueryOptions<ContestStatsDto, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ContestStatsDto, Error>({
    queryKey: contestKeys.stats(),
    queryFn: () => ContestService.getContestStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

// ==================== Platform Stats Hook ====================

export function usePlatformStats(
  platform: ContestPlatform,
  options?: Omit<
    UseQueryOptions<PlatformStatsDto, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PlatformStatsDto, Error>({
    queryKey: contestKeys.platformStats(platform),
    queryFn: () => ContestService.getPlatformStats(platform),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!platform,
    ...options,
  });
}

// ==================== Prefetch Helpers ====================

export function usePrefetchContest() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: contestKeys.detail(id),
      queryFn: () => ContestService.getContestById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

export function usePrefetchContests() {
  const queryClient = useQueryClient();

  return (query: ContestQueryDto) => {
    queryClient.prefetchQuery({
      queryKey: contestKeys.list(query),
      queryFn: () => ContestService.getContests(query),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// ==================== Mutation Hooks (for Admin) ====================

export function useInvalidateContests() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: contestKeys.all });
  };
}
