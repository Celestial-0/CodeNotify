'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Bell } from 'lucide-react';
import type { NotificationChannels } from '@/lib/types/user.types';

interface ChannelTogglesProps {
  channels: NotificationChannels;
  onChange: (channels: NotificationChannels) => void;
  disabled?: boolean;
}

export function ChannelToggles({
  channels,
  onChange,
  disabled = false,
}: ChannelTogglesProps) {
  const handleToggle = (channel: keyof NotificationChannels) => {
    onChange({
      ...channels,
      [channel]: !channels[channel],
    });
  };

  const channelConfig = [
    {
      key: 'email' as const,
      label: 'Email Notifications',
      description: 'Receive contest alerts via email',
      icon: Mail,
      color: 'text-blue-500',
    },
    {
      key: 'whatsapp' as const,
      label: 'WhatsApp Notifications',
      description: 'Receive contest alerts via WhatsApp',
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      key: 'push' as const,
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
          return (
            <Card
              key={channel.key}
              className={`p-4 ${disabled || channel.comingSoon ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`h-5 w-5 mt-0.5 ${channel.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={channel.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {channel.label}
                      </Label>
                      {channel.comingSoon && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={channel.key}
                  checked={channels[channel.key]}
                  onCheckedChange={() => handleToggle(channel.key)}
                  disabled={disabled || channel.comingSoon}
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
