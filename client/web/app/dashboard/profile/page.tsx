'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/core/user/profile-form';
import { PreferencesForm } from '@/components/core/user/preferences-form';
import { PasswordManagementCard } from '@/components/core/user/password-management-card';
import { AccountDeletionDialog } from '@/components/core/user/account-deletion-dialog';
import { BotIntegrationCard } from '@/components/core/user/bot-integration-card';
import { DiscordLinkFlow } from '@/components/core/user/discord-link-flow';
import { TelegramLinkWidget } from '@/components/core/user/telegram-link-widget';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/lib/hooks/use-user';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { User, Settings, Shield, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BotIntegrations } from '@/lib/types/user.types';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { botConnections, unlinkDiscord, unlinkTelegram } = useUserStore();
  const { serviceHealth } = useNotificationStore();
  
  // Modal states for bot linking
  const [showDiscordLink, setShowDiscordLink] = useState(false);
  const [showTelegramLink, setShowTelegramLink] = useState(false);

  // Build bot integrations from store and profile
  const botIntegrations: BotIntegrations = {
    discord: botConnections?.discord || (profile?.discordId ? {
      connected: true,
      isConnected: true,
      username: profile.discordUsername,
      connectedAt: profile.updatedAt?.toString(),
    } : undefined),
    telegram: botConnections?.telegram || (profile?.telegramChatId ? {
      connected: true,
      isConnected: true,
      username: profile.telegramUsername,
      connectedAt: profile.updatedAt?.toString(),
    } : undefined),
    whatsapp: botConnections?.whatsapp,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link2 className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Integrations</CardTitle>
              <CardDescription>
                Connect your accounts to receive notifications via messaging platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BotIntegrationCard
                platform="discord"
                connection={botIntegrations.discord}
                serviceHealth={serviceHealth?.services.discord}
                onLink={() => setShowDiscordLink(true)}
                onUnlink={async () => {
                  await unlinkDiscord();
                  toast.success('Discord account unlinked');
                }}
              />
              
              <BotIntegrationCard
                platform="telegram"
                connection={botIntegrations.telegram}
                serviceHealth={serviceHealth?.services.telegram}
                onLink={() => setShowTelegramLink(true)}
                onUnlink={async () => {
                  await unlinkTelegram();
                  toast.success('Telegram account unlinked');
                }}
              />
              
              <BotIntegrationCard
                platform="whatsapp"
                connection={botIntegrations.whatsapp}
                serviceHealth={serviceHealth?.services.whatsapp}
                onLink={() => {
                  toast.info('WhatsApp integration coming soon!');
                }}
                onUnlink={async () => {
                  toast.info('WhatsApp unlink not available yet');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <PasswordManagementCard />

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deactivate Account</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable your account and stop receiving notifications
                  </p>
                </div>
                <AccountDeletionDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bot Linking Modals */}
      <DiscordLinkFlow
        isOpen={showDiscordLink}
        onClose={() => setShowDiscordLink(false)}
        onSuccess={() => {
          toast.success('Discord account linked successfully!');
        }}
        onError={(error) => {
          toast.error(error.message || 'Failed to link Discord account');
        }}
      />

      <TelegramLinkWidget
        isOpen={showTelegramLink}
        onClose={() => setShowTelegramLink(false)}
        onSuccess={() => {
          toast.success('Telegram account linked successfully!');
        }}
        onError={(error) => {
          toast.error(error.message || 'Failed to link Telegram account');
        }}
      />
    </div>
  );
}
