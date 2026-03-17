'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { IntegrationService } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { toast } from 'sonner';
import type { BotConnection } from '@/lib/types/user.types';

interface TelegramLinkWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (connection: BotConnection) => void;
  onError?: (error: Error) => void;
}

type FlowState = 'idle' | 'loading' | 'waiting' | 'verifying' | 'success' | 'error';

// Get bot username from environment
const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'CodeNotifyBot';

export function TelegramLinkWidget({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TelegramLinkWidgetProps) {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const flowStateRef = useRef<FlowState>('idle');

  const { fetchBotConnections } = useUserStore();

  // Keep flowStateRef in sync
  useEffect(() => {
    flowStateRef.current = flowState;
  }, [flowState]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    setFlowState('idle');
    setError(null);
    setVerificationCode(null);
    setDeepLink(null);
    onClose();
  }, [onClose]);

  const startPolling = useCallback((code: string) => {
    // Poll every 3 seconds for verification status
    pollingRef.current = setInterval(async () => {
      try {
        const status = await IntegrationService.checkTelegramVerification(code);
        
        if (status.verified) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          
          setFlowState('verifying');
          
          await fetchBotConnections();
          
          setFlowState('success');
          
          const connection: BotConnection = {
            connected: true,
            isConnected: true,
            connectedAt: new Date().toISOString(),
            username: status.username,
          };
          
          onSuccess?.(connection);
          
          // Close after short delay
          setTimeout(() => {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
            setFlowState('idle');
            setError(null);
            setVerificationCode(null);
            setDeepLink(null);
            onClose();
          }, 1500);
        }
      } catch (err) {
        // Silently continue polling on errors
        console.error('Telegram verification poll error:', err);
      }
    }, 3000);
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        if (flowStateRef.current === 'waiting') {
          setError('Verification timed out. Please try again.');
          setFlowState('error');
        }
      }
    }, 5 * 60 * 1000);
  }, [fetchBotConnections, onSuccess, onClose]);

  const generateVerificationCode = useCallback(async () => {
    setFlowState('loading');
    setError(null);

    try {
      // Request a verification code from the backend
      const { code, deepLink: generatedDeepLink } = await IntegrationService.getTelegramVerificationCode();
      setVerificationCode(code);
      setDeepLink(generatedDeepLink);
      setFlowState('waiting');
      
      // Start polling for verification
      startPolling(code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate verification code';
      setError(errorMessage);
      setFlowState('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [onError, startPolling]);

  const copyCode = useCallback(() => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      toast.success('Copied!', {
        description: 'Verification code copied to clipboard',
      });
    }
  }, [verificationCode]);

  const openTelegramBot = useCallback(() => {
    const url = deepLink || `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${verificationCode || ''}`;
    window.open(url, '_blank');
  }, [deepLink, verificationCode]);

  const dialogMaxWidthClass =
    flowState === 'waiting' ? 'sm:max-w-4xl' : 'sm:max-w-md';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`w-[95vw] max-w-[95vw] ${dialogMaxWidthClass} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="h-6 w-6 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Link Telegram Account
          </DialogTitle>
          <DialogDescription className="wrap-break-word">
            Connect your Telegram account to receive contest notifications via messages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {flowState === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to start the Telegram linking process.
                You&apos;ll receive a verification code to send to our bot.
              </p>
              <Button onClick={generateVerificationCode} className="w-full bg-sky-500 hover:bg-sky-600">
                Start Telegram Link
              </Button>
            </div>
          )}

          {flowState === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              <p className="mt-4 text-sm text-muted-foreground">
                Generating verification code...
              </p>
            </div>
          )}

          {flowState === 'waiting' && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Step 1: Copy your verification code</h4>
                <div className="flex min-w-0 items-center gap-2">
                  <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap bg-background rounded px-3 py-2 font-mono text-sm sm:text-base text-left">
                    {verificationCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Step 2: Send to our Telegram bot</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Open our Telegram bot and send the verification code:
                </p>
                <Button onClick={openTelegramBot} variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open @{TELEGRAM_BOT_USERNAME}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription >
                  Waiting for verification... This page will update automatically once you send the code.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-sky-500 mr-2" />
                <span className="text-sm text-muted-foreground">Listening for verification...</span>
              </div>

              <Button variant="outline" onClick={handleClose} className="w-full">
                Cancel
              </Button>
            </div>
          )}

          {flowState === 'verifying' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              <p className="mt-4 text-sm text-muted-foreground">
                Verifying your account...
              </p>
            </div>
          )}

          {flowState === 'success' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium text-green-600">
                Telegram Connected!
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll now receive notifications via Telegram.
              </p>
            </div>
          )}

          {flowState === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription >{error}</AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={generateVerificationCode} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            By linking your Telegram account, you agree to receive notifications from CodeNotify.
            You can unlink at any time from your profile settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
