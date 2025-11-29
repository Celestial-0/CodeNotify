'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { AdminService, ContestService, NotificationService } from '@/lib/api';
import type {
  AdminUser,
  AdminUsersResponse,
  PlatformSyncResult,
  AllPlatformsSyncResult,
  SendCustomEmailDto,
  SendBulkEmailDto,
  SendAnnouncementDto,
  SendContestReminderDto,
  EmailSendResult,
  ServiceStatus,
  HealthCheckResult,
} from '@/lib/types/admin.types';
import type { CreateContestDto, ContestResponseDto } from '@/lib/types/contest.types';

// ==================== Query Keys ====================

export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (limit: number, offset: number) =>
    [...adminKeys.users(), 'list', limit, offset] as const,
  user: (id: string) => [...adminKeys.users(), 'detail', id] as const,
  serviceStatus: () => [...adminKeys.all, 'service-status'] as const,
  healthCheck: () => [...adminKeys.all, 'health-check'] as const,
};

// ==================== User Management Hooks ====================

export function useAdminUsers(
  limit: number = 20,
  offset: number = 0,
  options?: Omit<
    UseQueryOptions<AdminUsersResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<AdminUsersResponse, Error>({
    queryKey: adminKeys.usersList(limit, offset),
    queryFn: () => AdminService.getAllUsers(limit, offset),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useAdminUser(
  id: string,
  options?: Omit<UseQueryOptions<AdminUser, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AdminUser, Error>({
    queryKey: adminKeys.user(id),
    queryFn: () => AdminService.getUserById(id) as Promise<AdminUser>,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    ...options,
  });
}

export function useUpdateUserRole(
  options?: UseMutationOptions<
    { id: string; email: string; name: string; role: string; message: string },
    Error,
    { userId: string; role: 'user' | 'admin' }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; email: string; name: string; role: string; message: string },
    Error,
    { userId: string; role: 'user' | 'admin' }
  >({
    mutationFn: ({ userId, role }) => AdminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    ...options,
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<{ message: string }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (userId) => AdminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    ...options,
  });
}

// ==================== Contest Sync Hooks ====================

export function useSyncAllPlatforms(
  options?: UseMutationOptions<AllPlatformsSyncResult, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<AllPlatformsSyncResult, Error, void>({
    mutationFn: () => ContestService.syncAllPlatforms(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    ...options,
  });
}

export function useSyncPlatform(
  options?: UseMutationOptions<
    PlatformSyncResult,
    Error,
    { platform: string; forceSync?: boolean }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    PlatformSyncResult,
    Error,
    { platform: string; forceSync?: boolean }
  >({
    mutationFn: ({ platform, forceSync }) =>
      ContestService.syncPlatform(platform, forceSync),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    ...options,
  });
}

export function useDeleteContest(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (contestId) => ContestService.deleteContest(contestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    ...options,
  });
}

export function useBulkCreateContests(
  options?: UseMutationOptions<ContestResponseDto[], Error, CreateContestDto[]>
) {
  const queryClient = useQueryClient();

  return useMutation<ContestResponseDto[], Error, CreateContestDto[]>({
    mutationFn: (contests) => ContestService.bulkCreateContests(contests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    ...options,
  });
}

// ==================== Email Management Hooks ====================

export function useSendCustomEmail(
  options?: UseMutationOptions<EmailSendResult, Error, SendCustomEmailDto>
) {
  return useMutation<EmailSendResult, Error, SendCustomEmailDto>({
    mutationFn: (data) => NotificationService.sendCustomEmail(data),
    ...options,
  });
}

export function useSendBulkEmail(
  options?: UseMutationOptions<EmailSendResult, Error, SendBulkEmailDto>
) {
  return useMutation<EmailSendResult, Error, SendBulkEmailDto>({
    mutationFn: (data) => NotificationService.sendBulkEmail(data),
    ...options,
  });
}

export function useSendAnnouncement(
  options?: UseMutationOptions<EmailSendResult, Error, SendAnnouncementDto>
) {
  return useMutation<EmailSendResult, Error, SendAnnouncementDto>({
    mutationFn: (data) => NotificationService.sendAnnouncement(data),
    ...options,
  });
}

export function useSendContestReminder(
  options?: UseMutationOptions<EmailSendResult, Error, SendContestReminderDto>
) {
  return useMutation<EmailSendResult, Error, SendContestReminderDto>({
    mutationFn: (data) => NotificationService.sendContestReminder(data),
    ...options,
  });
}

// ==================== Service Status Hooks ====================

export function useServiceStatus(
  options?: Omit<UseQueryOptions<ServiceStatus, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ServiceStatus, Error>({
    queryKey: adminKeys.serviceStatus(),
    queryFn: () => NotificationService.getServiceStatus(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

export function useHealthCheck(
  options?: Omit<
    UseQueryOptions<HealthCheckResult, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<HealthCheckResult, Error>({
    queryKey: adminKeys.healthCheck(),
    queryFn: () => NotificationService.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// ==================== Invalidation Helpers ====================

export function useInvalidateAdminData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.all });
  };
}
