/**
 * Notification Store
 * Global state management for notifications and service health using Zustand
 */

import { create } from 'zustand';
import { NotificationService } from '@/lib/api';
import type {
  Notification,
  NotificationQueryDto,
  NotificationHealthResponse,
  NotificationServiceStatusResponse,
  NotificationChannel,
  ServiceHealth,
  NotificationStats,
} from '@/lib/types/notification.types';

interface NotificationState {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  serviceHealth: NotificationHealthResponse | null;
  serviceStatus: NotificationServiceStatusResponse | null;
  stats: NotificationStats | null;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchNotifications: (query?: NotificationQueryDto) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  fetchServiceHealth: () => Promise<void>;
  fetchServiceStatus: () => Promise<void>;
  fetchStats: (userId?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  retryNotification: (id: string) => Promise<void>;
  getChannelHealth: (channel: NotificationChannel) => ServiceHealth | null;
  isChannelAvailable: (channel: NotificationChannel) => boolean;
  clearNotifications: () => void;
  clearError: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

const initialState: NotificationState = {
  notifications: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  serviceHealth: null,
  serviceStatus: null,
  stats: null,
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  ...initialState,

  fetchNotifications: async (query?: NotificationQueryDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await NotificationService.getNotifications(query);
      const unreadCount = response.notifications.filter((n) => !n.isRead).length;
      set({
        notifications: response.notifications,
        pagination: response.pagination,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMoreNotifications: async () => {
    const { pagination, notifications } = get();
    if (pagination.page >= pagination.totalPages) return;

    set({ isRefreshing: true });
    try {
      const response = await NotificationService.getNotifications({
        page: pagination.page + 1,
        limit: pagination.limit,
      });
      set({
        notifications: [...notifications, ...response.notifications],
        pagination: response.pagination,
        isRefreshing: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more notifications';
      set({ error: errorMessage, isRefreshing: false });
    }
  },

  fetchServiceHealth: async () => {
    try {
      const health = await NotificationService.healthCheck();
      set({ serviceHealth: health });
    } catch (error) {
      console.error('Failed to fetch service health:', error);
    }
  },

  fetchServiceStatus: async () => {
    try {
      const status = await NotificationService.getServiceStatus();
      set({ serviceStatus: status });
    } catch (error) {
      console.error('Failed to fetch service status:', error);
    }
  },

  fetchStats: async (userId?: string) => {
    try {
      const stats = await NotificationService.getNotificationStats({ userId });
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    const previousNotifications = get().notifications;
    const previousUnreadCount = get().unreadCount;

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id || n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await NotificationService.markNotificationAsRead(id);
    } catch (error) {
      // Rollback on failure
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount,
      });
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    // Optimistic update
    const previousNotifications = get().notifications;

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    try {
      await NotificationService.markAllNotificationsAsRead(userId);
    } catch (error) {
      // Rollback on failure
      set({ notifications: previousNotifications });
      throw error;
    }
  },

  retryNotification: async (id: string) => {
    try {
      const result = await NotificationService.retryNotification(id);
      // Update the notification in the list
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id || n._id === id ? result.notification : n
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retry notification';
      set({ error: errorMessage });
      throw error;
    }
  },

  getChannelHealth: (channel: NotificationChannel) => {
    const health = get().serviceHealth;
    if (!health) return null;
    
    const channelKey = channel.toLowerCase() as keyof typeof health.services;
    return health.services[channelKey] || null;
  },

  isChannelAvailable: (channel: NotificationChannel) => {
    const status = get().serviceStatus;
    if (!status) return false;
    
    const channelKey = channel.toLowerCase() as keyof typeof status;
    const channelStatus = status[channelKey];
    return channelStatus?.available && channelStatus?.configured;
  },

  clearNotifications: () => set({ notifications: [], pagination: initialState.pagination }),

  clearError: () => set({ error: null }),
}));

// Selector hooks for specific state slices
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useNotificationPagination = () => useNotificationStore((state) => state.pagination);
export const useServiceHealth = () => useNotificationStore((state) => state.serviceHealth);
export const useServiceStatus = () => useNotificationStore((state) => state.serviceStatus);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useNotificationStats = () => useNotificationStore((state) => state.stats);
