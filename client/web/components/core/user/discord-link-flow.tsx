'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { IntegrationService } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import type { BotConnection } from '@/lib/types/user.types';

interface DiscordLinkFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (connection: BotConnection) => void;
  onError?: (error: Error) => void;
}

type FlowState = 'idle' | 'loading' | 'waiting' | 'success' | 'error';

export function DiscordLinkFlow({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: DiscordLinkFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<Window | null>(null);

  const { fetchBotConnections } = useUserStore();

  const waitForDiscordConnection = useCallback(async () => {
    const startedAt = Date.now();
    const timeoutMs = 120000;

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const connection = await IntegrationService.getPlatformStatus('discord');
        if (connection.connected || connection.isConnected) {
          await fetchBotConnections();
          setFlowState('success');
          onSuccess?.(connection);

          setTimeout(() => {
            onClose();
            setFlowState('idle');
          }, 1200);
          return;
        }
      } catch {
        // Keep polling while OAuth finishes in popup
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setError('Discord linking did not complete in time. Please try again.');
    setFlowState('error');
    onError?.(new Error('Discord linking timeout'));
  }, [fetchBotConnections, onClose, onError, onSuccess]);

  // Listen for OAuth callback message
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin in production
      if (event.data?.type === 'discord-oauth-callback') {
        const { error: oauthError } = event.data;

        if (oauthError) {
          setError(oauthError);
          setFlowState('error');
          onError?.(new Error(oauthError));
          return;
        }

        if (event.data?.code) {
          setFlowState('loading');
          await waitForDiscordConnection();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError, waitForDiscordConnection]);

  // Check if popup is closed
  useEffect(() => {
    if (!popup) return;

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setPopup(null);
        if (flowState === 'waiting') {
          setFlowState('loading');
          void waitForDiscordConnection();
        }
      }
    }, 500);

    return () => clearInterval(checkPopup);
  }, [popup, flowState, waitForDiscordConnection]);

  const initiateOAuth = useCallback(async () => {
    setFlowState('loading');
    setError(null);

    try {
      const { url } = await IntegrationService.getDiscordAuthUrl();

      // Open popup window
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const newPopup = window.open(
        url,
        'discord-oauth',
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      if (!newPopup || newPopup.closed || typeof newPopup.closed === 'undefined') {
        // Popup was blocked
        setError(
          'Popup was blocked by your browser. Please allow popups for this site or click the link below.'
        );
        setFlowState('error');
        
        // Store the URL for manual redirect
        sessionStorage.setItem('discord-oauth-return', window.location.href);
        sessionStorage.setItem('discord-oauth-url', url);
        return;
      }

      setPopup(newPopup);
      setFlowState('waiting');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Discord login';
      setError(errorMessage);
      setFlowState('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [onError]);

  const handleManualRedirect = () => {
    const url = sessionStorage.getItem('discord-oauth-url');
    if (url) {
      window.location.href = url;
    }
  };

  const handleClose = () => {
    if (popup && !popup.closed) {
      popup.close();
    }
    setPopup(null);
    setFlowState('idle');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Link Discord Account
          </DialogTitle>
          <DialogDescription>
            Connect your Discord account to receive contest notifications via DM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {flowState === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to authorize CodeNotify to send you Discord messages.
                You&apos;ll be redirected to Discord to complete the authorization.
              </p>
              <Button onClick={initiateOAuth} className="w-full bg-indigo-500 hover:bg-indigo-600">
                <ExternalLink className="h-4 w-4 mr-2" />
                Continue with Discord
              </Button>
            </div>
          )}

          {flowState === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="mt-4 text-sm text-muted-foreground">
                Connecting to Discord...
              </p>
            </div>
          )}

          {flowState === 'waiting' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  A popup window has opened for Discord authorization.
                  Please complete the login in the popup window.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                Waiting for authorization...
              </p>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Cancel
              </Button>
            </div>
          )}

          {flowState === 'success' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium text-green-600">
                Discord Connected!
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll now receive notifications via Discord DM.
              </p>
            </div>
          )}

          {flowState === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              {error?.includes('Popup was blocked') && (
                <Button
                  variant="outline"
                  onClick={handleManualRedirect}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Discord Login Page
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={initiateOAuth} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
