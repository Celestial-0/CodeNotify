'use client';

import { useCallback, useState } from 'react';
import { ContestList } from '@/components/core/contests/contest-list';
import { ContestFilters } from '@/components/core/contests/contest-filters';
import { ContestSearch } from '@/components/core/contests/contest-search';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useContests } from '@/lib/hooks/use-contests';
import type {
  ContestQueryDto,
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '@/lib/types/contest.types';
import { useUIStore } from '@/lib/store/ui-store';
import { cn, downloadContestICS } from '@/lib/utils';
import { ContestResponseDto } from '@/lib/types/contest.types';

export default function ContestsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const { contestView } = useUIStore();

  // Query state
  const [query, setQuery] = useState<ContestQueryDto>({
    limit: 20,
    offset: 0,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Fetch contests with React Query
  const {
    data: contestsData,
    isLoading,
    isError,
    error,
  } = useContests(query, {
    placeholderData: (previousData) => previousData,
  });

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filters: Partial<ContestQueryDto>) => {
      setQuery((prev) => ({
        ...prev,
        ...filters,
        offset: 0, // Reset pagination when filters change
      }));
    },
    []
  );

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery((prev) => ({
      ...prev,
      search: searchQuery || undefined,
      offset: 0,
    }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setQuery((prev) => ({
      ...prev,
      offset: (newPage - 1) * (prev.limit || 20),
    }));
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view: 'grid' | 'list') => {
    useUIStore.setState({ contestView: view });
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setQuery({
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
  }, []);

  // Calculate active filters count
  const activeFiltersCount = [
    query.platform,
    query.phase,
    query.type,
    query.difficulty,
    query.search,
    query.startDate,
    query.endDate,
  ].filter(Boolean).length;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Programming Contests
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track contests across multiple platforms
                </p>
              </div>

              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ContestSearch onSearch={handleSearch} />
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="shrink-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside
            className={cn(
              'lg:block lg:w-72 shrink-0',
              showFilters ? 'block' : 'hidden'
            )}
          >
            <div className="sticky top-40">
              <ContestFilters
                filters={{
                  platform: query.platform as ContestPlatform | undefined,
                  phase: query.phase as ContestPhase | undefined,
                  type: query.type as ContestType | undefined,
                  difficulty: query.difficulty as DifficultyLevel | undefined,
                  startDate: query.startDate,
                  endDate: query.endDate,
                }}
                onFilterChange={handleFilterChange}
                onReset={handleClearFilters}
              />
            </div>
          </aside>

          {/* Contest List */}
          <main className="flex-1 min-w-0">
            {isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-semibold text-destructive mb-2">
                  Failed to load contests
                </p>
                <p className="text-sm text-muted-foreground">
                  {error?.message || 'An unknown error occurred'}
                </p>
              </div>
            ) : (
              <ContestList
                contests={contestsData?.data || []}
                loading={isLoading}
                view={contestView}
                onViewChange={handleViewChange}
                pagination={contestsData?.pagination}
                onPageChange={(offset) => handlePageChange(Math.floor(offset / (query.limit || 20)) + 1)}
                onAddToCalendar={(contest: ContestResponseDto) => downloadContestICS(contest)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
