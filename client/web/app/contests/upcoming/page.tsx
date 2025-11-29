'use client';

import { useCallback, useState } from 'react';
import { ContestList } from '@/components/core/contests/contest-list';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import { useUpcomingContests } from '@/lib/hooks/use-contests';
import { useUIStore } from '@/lib/store/ui-store';
import { ContestPlatform, ContestResponseDto } from '@/lib/types/contest.types';
import { downloadContestICS } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { contestKeys } from '@/lib/hooks/use-contests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UpcomingContestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { contestView } = useUIStore();
  const [selectedPlatform, setSelectedPlatform] = useState<ContestPlatform | undefined>(undefined);

  // Fetch upcoming contests
  const {
    data: contests,
    isLoading,
    isError,
    error,
    isFetching,
  } = useUpcomingContests(selectedPlatform);

  // Handle view change
  const handleViewChange = useCallback((view: 'grid' | 'list') => {
    useUIStore.setState({ contestView: view });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: contestKeys.upcoming(selectedPlatform) });
  }, [queryClient, selectedPlatform]);

  // Handle platform filter change
  const handlePlatformChange = useCallback((value: string) => {
    setSelectedPlatform(value === 'all' ? undefined : value as ContestPlatform);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Upcoming Contests
                </h1>
                <p className="text-muted-foreground text-sm">
                  Contests starting soon across all platforms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Platform filter */}
              <Select
                value={selectedPlatform || 'all'}
                onValueChange={handlePlatformChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value={ContestPlatform.CODEFORCES}>Codeforces</SelectItem>
                  <SelectItem value={ContestPlatform.LEETCODE}>LeetCode</SelectItem>
                  <SelectItem value={ContestPlatform.CODECHEF}>CodeChef</SelectItem>
                  <SelectItem value={ContestPlatform.ATCODER}>AtCoder</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold text-destructive mb-2">
              Failed to load upcoming contests
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || 'An unknown error occurred'}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : contests?.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No upcoming contests</p>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedPlatform
                ? `No upcoming contests found for ${selectedPlatform}`
                : 'No upcoming contests found across any platform'}
            </p>
            <Button onClick={() => router.push('/contests')} variant="outline">
              Browse All Contests
            </Button>
          </div>
        ) : (
          <ContestList
            contests={contests || []}
            loading={isLoading}
            view={contestView}
            onViewChange={handleViewChange}
            onAddToCalendar={(contest: ContestResponseDto) => downloadContestICS(contest)}
          />
        )}
      </div>
    </div>
  );
}
