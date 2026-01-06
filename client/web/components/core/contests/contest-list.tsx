'use client';

import { ContestResponseDto, PaginatedContestResponseDto } from '@/lib/types/contest.types';
import { ContestCard } from './contest-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestListProps {
  contests: ContestResponseDto[];
  loading?: boolean;
  pagination?: PaginatedContestResponseDto['pagination'];
  onPageChange?: (offset: number) => void;
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
  onContestClick?: (contest: ContestResponseDto) => void;
  onAddToCalendar?: (contest: ContestResponseDto) => void;
  className?: string;
}

function ContestCardSkeleton({ variant }: { variant: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex gap-2 mb-3 flex-wrap">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-7 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-12 w-full mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function ContestList({
  contests,
  loading = false,
  pagination,
  onPageChange,
  view = 'grid',
  onViewChange,
  onContestClick,
  onAddToCalendar,
  className,
}: ContestListProps) {
  const handlePrevPage = () => {
    if (pagination && pagination.hasPrev && onPageChange) {
      onPageChange(Math.max(0, pagination.offset - pagination.limit));
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.hasNext && onPageChange) {
      onPageChange(pagination.offset + pagination.limit);
    }
  };

  const currentPage = pagination
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 1;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* View Toggle and Info */}
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              {pagination ? (
                <>
                  <span className="hidden sm:inline">Showing </span>
                  {pagination.offset + 1} -{' '}
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total}
                  <span className="hidden sm:inline"> contests</span>
                </>
              ) : (
                <>{contests.length} contests</>
              )}
            </>
          )}
        </div>

        {onViewChange && (
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('grid')}
              className="h-8 w-8 p-0"
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('list')}
              className="h-8 w-8 p-0"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Contest Grid/List */}
      {loading ? (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ContestCardSkeleton
              key={i}
              variant={view === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
            <List className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No contests found</h3>
          <p className="text-sm text-muted-foreground max-w-md px-4">
            Try adjusting your filters or search criteria to find contests.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
          )}
        >
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              variant={view === 'list' ? 'compact' : 'default'}
              onViewDetails={onContestClick}
              onAddToCalendar={onAddToCalendar}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 sm:pt-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!pagination.hasPrev || loading}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNext || loading}
              className="h-9"
            >
              <span className="hidden xs:inline">Next</span>
              <span className="xs:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
