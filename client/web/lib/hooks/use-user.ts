'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { UserService } from '@/lib/api';
import type {
  UserProfile,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '@/lib/types/user.types';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// ==================== User Profile Hook ====================

export function useProfile(
  options?: Omit<UseQueryOptions<UserProfile, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserProfile, Error>({
    queryKey: userKeys.profile(),
    queryFn: () => UserService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ==================== Update Profile Hook ====================

export function useUpdateProfile(
  options?: UseMutationOptions<UserProfile, Error, UpdateUserDto>
) {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdateUserDto>({
    mutationFn: (data) => UserService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
}

// ==================== Update Preferences Hook ====================

export function useUpdatePreferences(
  options?: UseMutationOptions<UserProfile, Error, UpdatePreferencesDto>
) {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdatePreferencesDto>({
    mutationFn: (data) => UserService.updatePreferences(data),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
}

// ==================== Deactivate Account Hook ====================

export function useDeactivateAccount(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => UserService.deactivateAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
}

// ==================== Activate Account Hook ====================

export function useActivateAccount(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => UserService.activateAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
}

// ==================== Test Notifications Hooks ====================

export function useTestEmailNotification(
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (email) => UserService.testEmailNotification(email),
    ...options,
  });
}

export function useTestWhatsAppNotification(
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (phoneNumber) => UserService.testWhatsAppNotification(phoneNumber),
    ...options,
  });
}
