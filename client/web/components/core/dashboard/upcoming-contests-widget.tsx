'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContestCard } from '@/components/core/contests/contest-card';
import { useUpcomingContests } from '@/lib/hooks/use-contests';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface UpcomingContestsWidgetProps {
  limit?: number;
}

export function UpcomingContestsWidget({ limit = 5 }: UpcomingContestsWidgetProps) {
  const { data: contests, isLoading, isError } = useUpcomingContests();

  const displayContests = contests?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Contests</CardTitle>
          <CardDescription>Your next contests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || displayContests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Contests</CardTitle>
          <CardDescription>Your next contests</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            No upcoming contests found
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/contests">
              Browse Contests
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border bg-card/80 shadow-sm backdrop-blur-xl">
      {/* Subtle gradient */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Contests
          </CardTitle>
          <CardDescription>Your next {displayContests.length} contests</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
          <Link href="/contests">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayContests.map((contest) => (
          <ContestCard
            key={contest.id}
            contest={contest}
            variant="compact"
            flexType="flex-col"
          />
        ))}
      </CardContent>
    </Card>
  );
}

