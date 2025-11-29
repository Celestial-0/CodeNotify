'use client';

import { useParams, useRouter } from 'next/navigation';
import { ContestDetailView } from '@/components/core/contests/contest-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { useContest } from '@/lib/hooks/use-contests';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';
import { PLATFORM_CONFIG } from '@/lib/types/contest.types';
import { downloadContestICS } from '@/lib/utils';

// Helper function to safely format dates
const formatDate = (date: Date | string | undefined, formatStr: string, fallback = 'TBD'): string => {
  if (!date) return fallback;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : fallback;
};

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const {
    data: contest,
    isLoading,
    isError,
    error,
  } = useContest(contestId);

  // Generate ICS file for calendar
  const handleAddToCalendar = () => {
    if (!contest) return;
    downloadContestICS(contest);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !contest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-destructive mb-4">
            Contest Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            {error?.message || 'The contest you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => router.push('/contests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  const platformConfig = PLATFORM_CONFIG[contest.platform] ?? {
    name: contest.platform,
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: '?',
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold text-white ${platformConfig.color}`}
                >
                  {platformConfig.icon} {contest.platform}
                </span>
                {contest.difficulty && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
                    {contest.difficulty}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {contest.name}
              </h1>
              <p className="text-muted-foreground">
                {formatDate(contest.startTime, 'PPP p')} -{' '}
                {formatDate(contest.endTime, 'p')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddToCalendar} variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              {contest.registrationUrl && (
                <Button asChild size="sm">
                  <a
                    href={contest.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
              {contest.websiteUrl && !contest.registrationUrl && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={contest.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Contest
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contest Details */}
      <div className="container mx-auto px-4 py-6">
        <ContestDetailView contest={contest} onAddToCalendar={handleAddToCalendar} />
      </div>
    </div>
  );
}
