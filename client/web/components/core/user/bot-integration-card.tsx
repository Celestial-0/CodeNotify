'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link2, Unlink, Send, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { BotConnection } from '@/lib/types/user.types';
import type { ServiceHealth } from '@/lib/types/notification.types';

// Platform-specific icons (using simple SVG components)
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
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface BotIntegrationCardProps {
  platform: 'discord' | 'telegram' | 'whatsapp';
  connection?: BotConnection;
  onLink: () => void | Promise<void>;
  onUnlink: () => void | Promise<void>;
  onTest?: () => Promise<void>;
  isLoading?: boolean;
  serviceHealth?: ServiceHealth | null;
}

const platformConfig = {
  discord: {
    name: 'Discord',
    icon: DiscordIcon,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500',
    description: 'Receive contest notifications via Discord DM',
    linkText: 'Link Discord',
    instructions: 'Connect your Discord account to receive notifications directly in your DMs.',
  },
  telegram: {
    name: 'Telegram',
    icon: TelegramIcon,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
    description: 'Receive contest notifications via Telegram bot',
    linkText: 'Link Telegram',
    instructions: 'Start a chat with our Telegram bot to receive notifications.',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    description: 'Receive contest notifications via WhatsApp',
    linkText: 'Link WhatsApp',
    instructions: 'Connect your WhatsApp number to receive contest reminders.',
  },
};

export function BotIntegrationCard({
  platform,
  connection,
  onLink,
  onUnlink,
  onTest,
  isLoading = false,
  serviceHealth,
}: BotIntegrationCardProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const config = platformConfig[platform];
  const Icon = config.icon;
  const isConnected = connection?.connected || connection?.isConnected || false;

  const handleLink = async () => {
    setIsLinking(true);
    try {
      await onLink();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to link ${config.name}`);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      await onUnlink();
      toast.success(`${config.name} unlinked successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to unlink ${config.name}`);
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleTest = async () => {
    if (!onTest) return;
    setIsTesting(true);
    try {
      await onTest();
      toast.success(`Test notification sent to ${config.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to send test notification`);
    } finally {
      setIsTesting(false);
    }
  };

  const isServiceDown = serviceHealth?.status === 'down';
  const isDisabled = isLoading || isLinking || isUnlinking || isTesting;

  return (
    <Card className={`relative overflow-hidden ${isServiceDown ? 'opacity-75' : ''}`}>
      {/* Service status indicator */}
      {serviceHealth && (
        <div className="absolute top-3 right-3">
          {serviceHealth.status === 'up' ? (
            <Badge variant="outline" className="text-green-500 border-green-500/50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-500 border-red-500/50">
              <XCircle className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}/10`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{config.name}</CardTitle>
            <CardDescription className="text-sm">{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            {/* Connected state */}
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Connected
                </p>
                {connection?.username && (
                  <p className="text-xs text-muted-foreground">
                    {connection.username}
                  </p>
                )}
              </div>
            </div>

            {/* Actions for connected state */}
            <div className="flex flex-wrap gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={isDisabled || isServiceDown}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Test
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                disabled={isDisabled}
                className="text-destructive hover:text-destructive"
              >
                {isUnlinking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Unlink
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected state */}
            <p className="text-sm text-muted-foreground">
              {config.instructions}
            </p>

            <Button
              onClick={handleLink}
              disabled={isDisabled || isServiceDown}
              className={`w-full ${config.bgColor} hover:${config.bgColor}/90`}
            >
              {isLinking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              {config.linkText}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>

            {isServiceDown && (
              <p className="text-xs text-muted-foreground text-center">
                Service temporarily unavailable
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
