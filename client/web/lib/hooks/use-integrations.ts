import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntegrationService } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import type { BotConnection } from '@/lib/types/user.types';

// Query keys for integration operations
export const integrationKeys = {
  all: ['integrations'] as const,
  discord: () => [...integrationKeys.all, 'discord'] as const,
  telegram: () => [...integrationKeys.all, 'telegram'] as const,
  whatsapp: () => [...integrationKeys.all, 'whatsapp'] as const,
  status: (platform: string) => [...integrationKeys.all, 'status', platform] as const,
};

/**
 * Hook to get Discord connection status
 */
export function useDiscordStatus() {
  return useQuery({
    queryKey: integrationKeys.discord(),
    queryFn: () => IntegrationService.getPlatformStatus('discord'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to get Telegram connection status
 */
export function useTelegramStatus() {
  return useQuery({
    queryKey: integrationKeys.telegram(),
    queryFn: () => IntegrationService.getPlatformStatus('telegram'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to get WhatsApp connection status
 */
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: integrationKeys.whatsapp(),
    queryFn: () => IntegrationService.getPlatformStatus('whatsapp'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to get all integration statuses
 */
export function useIntegrationStatuses() {
  return useQuery({
    queryKey: integrationKeys.all,
    queryFn: () => IntegrationService.getConnectionStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to link Discord account
 */
export function useLinkDiscord() {
  const queryClient = useQueryClient();
  const { linkDiscord: storeLinkDiscord } = useUserStore();

  return useMutation({
    mutationFn: async (code: string) => {
      const result = await IntegrationService.linkDiscord({ code });
      return result;
    },
    onSuccess: async (data) => {
      // Update store - pass the OAuth code, store will handle the full linking
      await storeLinkDiscord(data.userId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: integrationKeys.discord() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

/**
 * Hook to unlink Discord account
 */
export function useUnlinkDiscord() {
  const queryClient = useQueryClient();
  const { unlinkDiscord } = useUserStore();

  return useMutation({
    mutationFn: () => IntegrationService.unlinkDiscord(),
    onSuccess: async () => {
      // Update store
      await unlinkDiscord();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: integrationKeys.discord() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

/**
 * Hook to link Telegram account
 */
export function useLinkTelegram() {
  const queryClient = useQueryClient();
  const { linkTelegram: storeLinkTelegram } = useUserStore();

  return useMutation({
    mutationFn: async (telegramData: string) => {
      const result = await IntegrationService.linkTelegram({ telegramData });
      return result;
    },
    onSuccess: async (data) => {
      // Update store with telegramData JSON
      await storeLinkTelegram(JSON.stringify({ userId: data.userId, username: data.username }));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: integrationKeys.telegram() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

/**
 * Hook to unlink Telegram account
 */
export function useUnlinkTelegram() {
  const queryClient = useQueryClient();
  const { unlinkTelegram } = useUserStore();

  return useMutation({
    mutationFn: () => IntegrationService.unlinkTelegram(),
    onSuccess: async () => {
      // Update store
      await unlinkTelegram();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: integrationKeys.telegram() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

/**
 * Hook to test Discord notification
 */
export function useTestDiscordNotification() {
  return useMutation({
    mutationFn: (discordId: string) => IntegrationService.testDiscord(discordId),
  });
}

/**
 * Hook to test Telegram notification
 */
export function useTestTelegramNotification() {
  return useMutation({
    mutationFn: (chatId: number) => IntegrationService.testTelegram(chatId),
  });
}

/**
 * Combined hook for all bot integration operations
 */
export function useBotIntegrations() {
  const discordStatus = useDiscordStatus();
  const telegramStatus = useTelegramStatus();
  const whatsappStatus = useWhatsAppStatus();
  
  const linkDiscordMutation = useLinkDiscord();
  const unlinkDiscordMutation = useUnlinkDiscord();
  const linkTelegramMutation = useLinkTelegram();
  const unlinkTelegramMutation = useUnlinkTelegram();
  
  const testDiscord = useTestDiscordNotification();
  const testTelegram = useTestTelegramNotification();

  const isLoading = 
    discordStatus.isLoading || 
    telegramStatus.isLoading || 
    whatsappStatus.isLoading;

  const connections: Record<string, BotConnection | undefined> = {
    discord: discordStatus.data,
    telegram: telegramStatus.data,
    whatsapp: whatsappStatus.data,
  };

  // Helper to check if connected using both property names
  const isConnected = (conn?: BotConnection) => conn?.connected || conn?.isConnected || false;

  return {
    // Status queries
    discordStatus,
    telegramStatus,
    whatsappStatus,
    isLoading,
    connections,
    
    // Mutations
    linkDiscord: linkDiscordMutation,
    unlinkDiscord: unlinkDiscordMutation,
    linkTelegram: linkTelegramMutation,
    unlinkTelegram: unlinkTelegramMutation,
    testDiscord,
    testTelegram,
    
    // Helper methods
    isDiscordConnected: isConnected(discordStatus.data),
    isTelegramConnected: isConnected(telegramStatus.data),
    isWhatsAppConnected: isConnected(whatsappStatus.data),
  };
}
