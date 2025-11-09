/**
 * Example Contest Browse Page
 * 
 * This is a complete example showing how to use all contest components together.
 * Copy this to app/contests/page.tsx when ready to implement.
 */

'use client';

import { useState } from 'react';
import {
  ContestList,
  ContestFilters,
  ContestSearch,
  ContestStatsCharts,
} from '@/components/core/contests';
import {
  ContestQueryDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
  ContestStatsDto,
} from '@/lib/types/contest.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

// NOTE: Install Sheet component with: npx shadcn@latest add sheet
// Or create a Dialog-based mobile filter instead

// TODO: Replace with actual API calls
const mockContests: ContestResponseDto[] = [];
const mockPagination: PaginatedContestResponseDto['pagination'] = {
  total: 0,
  limit: 20,
  offset: 0,
  hasNext: false,
  hasPrev: false,
};
const mockStats: ContestStatsDto | undefined = undefined;

export default function ContestsPage() {
  const [filters, setFilters] = useState<ContestQueryDto>({
    limit: 20,
    offset: 0,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('browse');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // TODO: Replace with actual API hooks (React Query)
  const contests = mockContests;
  const pagination = mockPagination;
  const stats = mockStats;
  const loading = false;

  const handleFilterChange = (newFilters: Partial<ContestQueryDto>) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query, offset: 0 });
  };

  const handlePageChange = (offset: number) => {
    setFilters({ ...filters, offset });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
  };

  const handleContestClick = (contest: ContestResponseDto) => {
    // TODO: Navigate to contest detail page
    console.log('Navigate to:', `/contests/${contest.id}`);
    // router.push(`/contests/${contest.id}`);
  };

  const handleAddToCalendar = (contest: ContestResponseDto) => {
    // TODO: Implement ICS file generation and download
    console.log('Add to calendar:', contest.name);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Contest Browser</h1>
        <p className="text-muted-foreground">
          Discover and track programming contests from top platforms
        </p>
      </div>

      {/* Tabs for Browse/Statistics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="browse">Browse Contests</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search Bar - Full Width */}
          <ContestSearch onSearch={handleSearch} defaultValue={filters.search} />

          <div className="flex gap-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-4">
                <ContestFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <ContestList
                contests={contests}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                view={view}
                onViewChange={setView}
                onContestClick={handleContestClick}
                onAddToCalendar={handleAddToCalendar}
              />
            </main>
          </div>

          {/* Mobile Filter Button - TODO: Implement with Sheet or Dialog component */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-full max-w-md bg-background p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
                    Close
                  </Button>
                </div>
                <ContestFilters
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    handleFilterChange(newFilters);
                    setMobileFiltersOpen(false);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="fixed bottom-6 right-6 lg:hidden shadow-lg"
            size="lg"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <ContestStatsCharts stats={stats} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * IMPLEMENTATION CHECKLIST:
 * 
 * 1. API Integration:
 *    - Create API client in lib/api/contests.ts
 *    - Implement React Query hooks in lib/hooks/use-contests.ts
 *    - Replace mock data with actual API calls
 * 
 * 2. Routing:
 *    - Move this file to app/contests/page.tsx
 *    - Create app/contests/[id]/page.tsx for detail view
 *    - Import useRouter from 'next/navigation'
 * 
 * 3. State Management (optional):
 *    - Create Zustand store for filters persistence
 *    - Save view preference to localStorage
 * 
 * 4. Add to Calendar:
 *    - Implement ICS file generation utility
 *    - Add download functionality
 * 
 * 5. Error Handling:
 *    - Add error boundaries
 *    - Handle API errors gracefully
 *    - Show error messages to users
 * 
 * 6. Loading States:
 *    - Already implemented with skeleton loaders
 *    - Ensure proper loading prop is passed
 * 
 * 7. SEO & Meta:
 *    - Add metadata export for Next.js
 *    - Set proper page title and description
 */
