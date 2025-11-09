'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export function WelcomeBanner() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Card className="bg-linear-to-r from-primary/10 via-primary/5 to-background">
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
    <Card className="bg-linear-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">
          {getGreeting()}, {profile?.name || 'User'}! 👋
        </CardTitle>
        <CardDescription className="text-base">
          Welcome to your CodeNotify dashboard. Stay updated with the latest
          competitive programming contests.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
