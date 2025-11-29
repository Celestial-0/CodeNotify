'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { NotificationService } from '@/lib/api';
import type {
  Notification,
  NotificationQueryDto,
  PaginatedNotificationsResponse,
  NotificationStats,
  NotificationStatsQuery,
} from '@/lib/types/notification.types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationQueryDto) =>
    [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: (query?: NotificationStatsQuery) =>
    [...notificationKeys.all, 'stats', query] as const,
};

// ==================== Notifications List Hook ====================

export function useNotifications(
  query: NotificationQueryDto = { page: 1, limit: 20 },
  options?: Omit<
    UseQueryOptions<PaginatedNotificationsResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedNotificationsResponse, Error>({
    queryKey: notificationKeys.list(query),
    queryFn: () => NotificationService.getNotifications(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ==================== Notification Detail Hook ====================

export function useNotification(
  id: string,
  options?: Omit<
    UseQueryOptions<Notification, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Notification, Error>({
    queryKey: notificationKeys.detail(id),
    queryFn: () => NotificationService.getNotificationById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
    ...options,
  });
}

// ==================== Notification Stats Hook ====================

export function useNotificationStats(
  query?: NotificationStatsQuery,
  options?: Omit<
    UseQueryOptions<NotificationStats, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<NotificationStats, Error>({
    queryKey: notificationKeys.stats(query),
    queryFn: () => NotificationService.getNotificationStats(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ==================== Mark as Read Hook ====================

export function useMarkAsRead(
  options?: UseMutationOptions<
    { success: boolean; notification: Notification },
    Error,
    string
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; notification: Notification },
    Error,
    string
  >({
    mutationFn: (id) => NotificationService.markNotificationAsRead(id),
    onSuccess: (data, id) => {
      // Update the notification in the cache
      queryClient.setQueryData(notificationKeys.detail(id), data.notification);
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
}

// ==================== Mark All as Read Hook ====================

export function useMarkAllAsRead(
  options?: UseMutationOptions<
    { success: boolean; modifiedCount: number },
    Error,
    string
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; modifiedCount: number },
    Error,
    string
  >({
    mutationFn: (userId) => NotificationService.markAllNotificationsAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    ...options,
  });
}

// ==================== Retry Notification Hook ====================

export function useRetryNotification(
  options?: UseMutationOptions<
    { success: boolean; notification: Notification },
    Error,
    string
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; notification: Notification },
    Error,
    string
  >({
    mutationFn: (id) => NotificationService.retryNotification(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(notificationKeys.detail(id), data.notification);
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
}

// ==================== Prefetch Helpers ====================

export function usePrefetchNotification() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: notificationKeys.detail(id),
      queryFn: () => NotificationService.getNotificationById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchNotifications() {
  const queryClient = useQueryClient();

  return (query: NotificationQueryDto) => {
    queryClient.prefetchQuery({
      queryKey: notificationKeys.list(query),
      queryFn: () => NotificationService.getNotifications(query),
      staleTime: 1 * 60 * 1000,
    });
  };
}

// ==================== Invalidation Helper ====================

export function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };
}
