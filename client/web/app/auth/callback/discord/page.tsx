'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CallbackStatus = 'loading' | 'success' | 'error';

function DiscordCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription || error || 'Discord authorization failed');
          
          // Send error to opener
          if (window.opener) {
            window.opener.postMessage({
              type: 'discord-oauth-callback',
              error: errorDescription || error,
            }, window.location.origin);
            
            // Close popup after short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          }
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }

        // Success - send code to opener
        if (window.opener) {
          window.opener.postMessage({
            type: 'discord-oauth-callback',
            code,
          }, window.location.origin);

          setStatus('success');
          
          // Close popup after short delay
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // Opened in same window, redirect with code
          const returnUrl = sessionStorage.getItem('discord-oauth-return');
          if (returnUrl) {
            sessionStorage.removeItem('discord-oauth-return');
            sessionStorage.setItem('discord-oauth-code', code);
            window.location.href = returnUrl;
          } else {
            // Fallback to dashboard
            sessionStorage.setItem('discord-oauth-code', code);
            window.location.href = '/dashboard/profile?tab=integrations';
          }
        }
      } catch (err) {
        console.error('Discord callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Connecting Discord...'}
            {status === 'success' && 'Discord Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete the connection'}
            {status === 'success' && 'You can close this window now'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        
        {status === 'error' && (
          <CardContent className="text-center">
            <Button
              variant="outline"
              onClick={() => window.close()}
            >
              Close Window
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function DiscordCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
              </div>
              <CardTitle>Connecting Discord...</CardTitle>
              <CardDescription>Please wait while we complete the connection</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <DiscordCallbackContent />
    </Suspense>
  );
}
