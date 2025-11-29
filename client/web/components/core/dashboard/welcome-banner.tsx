'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export function WelcomeBanner() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/80 shadow-lg backdrop-blur-xl">
      {/* Gradient glow background */}
      <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-primary/20 via-primary/10 to-primary/5 opacity-50 blur-2xl" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <CardTitle className="text-3xl font-bold">
            <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getGreeting()}, {profile?.name || 'User'}!
            </span>
          </CardTitle>
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <CardDescription className="text-base text-muted-foreground mt-2">
          Welcome to your CodeNotify dashboard. Stay updated with the latest
          competitive programming contests across all platforms.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
