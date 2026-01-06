'use client';

import { useCallback, useState } from 'react';
import { ContestList } from '@/components/core/contests/contest-list';
import { ContestFilters } from '@/components/core/contests/contest-filters';
import { ContestSearch } from '@/components/core/contests/contest-search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, Trophy } from 'lucide-react';
import { useContests } from '@/lib/hooks/use-contests';
import type {
  ContestQueryDto,
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '@/lib/types/contest.types';
import { useUIStore } from '@/lib/store/ui-store';
import { downloadContestICS } from '@/lib/utils';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-16 z-30">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title and Mobile Filter */}
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                    Contests
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track contests across multiple platforms
                </p>
              </div>

              {/* Mobile filter toggle */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden shrink-0 h-9"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
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
                      className="border-0 p-0"
                    />
                  </div>
                </SheetContent>
              </Sheet>
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
                  className="shrink-0 hidden sm:flex"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
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
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <div className="rounded-full bg-destructive/10 p-4 sm:p-6 mb-4">
                  <X className="h-8 w-8 sm:h-12 sm:w-12 text-destructive" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-destructive mb-2">
                  Failed to load contests
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
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
