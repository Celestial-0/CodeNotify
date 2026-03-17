/**
 * User Store
 * Global state management for user profile and bot integrations using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserService, IntegrationService } from '@/lib/api';
import type { UserProfile, BotIntegrations, BotConnection } from '@/lib/types/user.types';

interface UserState {
  profile: UserProfile | null;
  botConnections: BotIntegrations | null;
  isLoading: boolean;
  isLinking: boolean;
  error: string | null;
}

interface UserActions {
  setProfile: (profile: UserProfile | null) => void;
  setBotConnections: (connections: BotIntegrations) => void;
  updateBotConnection: (
    platform: keyof BotIntegrations,
    connection: BotConnection
  ) => void;
  fetchProfile: () => Promise<UserProfile | null>;
  fetchBotConnections: () => Promise<BotIntegrations | null>;
  linkDiscord: (code: string) => Promise<void>;
  unlinkDiscord: () => Promise<void>;
  linkTelegram: (telegramData: string) => Promise<void>;
  unlinkTelegram: () => Promise<void>;
  unlinkWhatsApp: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  profile: null,
  botConnections: null,
  isLoading: false,
  isLinking: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      setBotConnections: (connections) => set({ botConnections: connections }),

      updateBotConnection: (platform, connection) => {
        const current = get().botConnections;
        if (current) {
          set({
            botConnections: {
              ...current,
              [platform]: connection,
            },
          });
        } else {
          // Initialize with default values if botConnections is null
          set({
            botConnections: {
              discord: { connected: false, isConnected: false },
              telegram: { connected: false, isConnected: false },
              whatsapp: { connected: false, isConnected: false },
              [platform]: connection,
            },
          });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const profile = await UserService.getProfile();
          set({ profile, isLoading: false });
          return profile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      fetchBotConnections: async () => {
        try {
          const connections = await IntegrationService.getConnectionStatus();
          set({ botConnections: connections });
          return connections;
        } catch (error) {
          console.error('Failed to fetch bot connections:', error);
          // Set default empty connections on error
          const defaultConnections: BotIntegrations = {
            discord: { connected: false, isConnected: false },
            telegram: { connected: false, isConnected: false },
            whatsapp: { connected: false, isConnected: false },
          };
          set({ botConnections: defaultConnections });
          return null;
        }
      },

      linkDiscord: async (code) => {
        set({ isLinking: true, error: null });
        try {
          const result = await IntegrationService.linkDiscord({ code });
          get().updateBotConnection('discord', {
            connected: true,
            isConnected: true,
            userId: result.userId,
            username: result.username,
            connectedAt: result.linkedAt?.toString(),
          });
          await get().fetchBotConnections();
          // Refresh profile to get updated discordId
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to link Discord';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLinking: false });
        }
      },

      unlinkDiscord: async () => {
        set({ isLinking: true, error: null });
        try {
          await IntegrationService.unlinkDiscord();
          get().updateBotConnection('discord', { connected: false, isConnected: false });
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to unlink Discord';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLinking: false });
        }
      },

      linkTelegram: async (telegramData) => {
        set({ isLinking: true, error: null });
        try {
          const result = await IntegrationService.linkTelegram({ telegramData });
          get().updateBotConnection('telegram', {
            connected: true,
            isConnected: true,
            userId: result.userId,
            username: result.username,
            connectedAt: result.linkedAt?.toString(),
          });
          await get().fetchBotConnections();
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to link Telegram';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLinking: false });
        }
      },

      unlinkTelegram: async () => {
        set({ isLinking: true, error: null });
        try {
          await IntegrationService.unlinkTelegram();
          get().updateBotConnection('telegram', { connected: false, isConnected: false });
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to unlink Telegram';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLinking: false });
        }
      },

      unlinkWhatsApp: async () => {
        set({ isLinking: true, error: null });
        try {
          await IntegrationService.unlinkWhatsApp();
          get().updateBotConnection('whatsapp', { connected: false, isConnected: false });
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to unlink WhatsApp';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLinking: false });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        botConnections: state.botConnections,
      }),
    }
  )
);

// Selector hooks for specific state slices
export const useUserProfile = () => useUserStore((state) => state.profile);
export const useBotConnections = () => useUserStore((state) => state.botConnections);
export const useDiscordConnection = () => useUserStore((state) => state.botConnections?.discord);
export const useTelegramConnection = () => useUserStore((state) => state.botConnections?.telegram);
export const useWhatsAppConnection = () => useUserStore((state) => state.botConnections?.whatsapp);
