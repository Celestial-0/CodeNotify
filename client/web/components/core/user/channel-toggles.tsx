'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Bell, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NotificationChannels, BotIntegrations } from '@/lib/types/user.types';

// Platform icons as SVG components
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface ChannelTogglesProps {
  channels: NotificationChannels;
  onChange: (channels: NotificationChannels) => void;
  disabled?: boolean;
  disabledChannels?: Partial<Record<keyof NotificationChannels, boolean>>;
  botIntegrations?: BotIntegrations;
  onLinkBot?: (platform: 'discord' | 'telegram' | 'whatsapp') => void;
}

interface ChannelConfigItem {
  key: keyof NotificationChannels;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  comingSoon?: boolean;
  requiresBot?: boolean;
  botPlatform?: 'discord' | 'telegram' | 'whatsapp';
}

export function ChannelToggles({
  channels,
  onChange,
  disabled = false,
  disabledChannels,
  botIntegrations,
  onLinkBot,
}: ChannelTogglesProps) {
  const handleToggle = (channel: keyof NotificationChannels) => {
    onChange({
      ...channels,
      [channel]: !channels[channel],
    });
  };

  const isBotConnected = (platform: 'discord' | 'telegram' | 'whatsapp'): boolean => {
    if (!botIntegrations) return false;
    const conn = botIntegrations[platform];
    return conn?.connected || conn?.isConnected || false;
  };

  const channelConfig: ChannelConfigItem[] = [
    {
      key: 'email',
      label: 'Email Notifications',
      description: 'Receive contest alerts via email',
      icon: Mail,
      color: 'text-blue-500',
    },
    {
      key: 'discord',
      label: 'Discord Notifications',
      description: 'Receive contest alerts via Discord DM',
      icon: DiscordIcon,
      color: 'text-indigo-500',
      requiresBot: true,
      botPlatform: 'discord',
    },
    {
      key: 'telegram',
      label: 'Telegram Notifications',
      description: 'Receive contest alerts via Telegram',
      icon: TelegramIcon,
      color: 'text-sky-500',
      requiresBot: true,
      botPlatform: 'telegram',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Notifications',
      description: 'Receive contest alerts via WhatsApp',
      icon: WhatsAppIcon,
      color: 'text-green-500',
      requiresBot: true,
      botPlatform: 'whatsapp',
    },
    {
      key: 'push',
      label: 'Push Notifications',
      description: 'Receive browser push notifications (coming soon)',
      icon: Bell,
      color: 'text-purple-500',
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Notification Channels</Label>
      <div className="space-y-3">
        {channelConfig.map((channel) => {
          const Icon = channel.icon;
          const botConnected = channel.requiresBot && channel.botPlatform
            ? isBotConnected(channel.botPlatform)
            : true;
          const isFeatureDisabled = !!disabledChannels?.[channel.key];
          const isDisabled =
            disabled ||
            isFeatureDisabled ||
            channel.comingSoon ||
            (channel.requiresBot && !botConnected);

          return (
            <Card
              key={channel.key}
              className={`p-4 ${isDisabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`h-5 w-5 mt-0.5 ${channel.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor={channel.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {channel.label}
                      </Label>
                      {channel.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                      {channel.requiresBot && botConnected && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                          Connected
                        </Badge>
                      )}
                      {channel.requiresBot && !botConnected && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className="text-xs text-amber-600 border-amber-200 bg-amber-50 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                if (channel.botPlatform && onLinkBot) {
                                  onLinkBot(channel.botPlatform);
                                }
                              }}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Linked
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Link your {channel.label.replace(' Notifications', '')} account to enable notifications</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {isFeatureDisabled && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled by admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {channel.description}
                    </p>
                    {channel.requiresBot && !botConnected && onLinkBot && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline mt-1"
                        onClick={() => channel.botPlatform && onLinkBot(channel.botPlatform)}
                      >
                        Link your account →
                      </button>
                    )}
                  </div>
                </div>
                <Switch
                  id={channel.key}
                  checked={channels[channel.key]}
                  onCheckedChange={() => handleToggle(channel.key)}
                  disabled={isDisabled}
                />
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        At least one channel must be enabled to receive notifications
      </p>
    </div>
  );
}
