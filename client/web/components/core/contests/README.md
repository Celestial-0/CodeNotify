# Contest Components

Complete contest management components built to match the CodeNotify server API.

## 📁 Structure

```
components/core/contests/
├── contest-card.tsx           # Individual contest display card
├── contest-list.tsx           # List container with pagination
├── contest-filters.tsx        # Advanced filter sidebar
├── contest-search.tsx         # Search bar component
├── contest-detail-view.tsx    # Full contest details page
├── contest-stats-charts.tsx   # Analytics and statistics
├── contest-countdown.tsx      # Real-time countdown timer
├── platform-badge.tsx         # Platform identification badge
├── difficulty-badge.tsx       # Difficulty level badge
└── index.ts                   # Barrel exports
```

## 🎯 Components Overview

### Core Components

#### `ContestCard`
Individual contest display card with all metadata.

**Props:**
- `contest: ContestResponseDto` - Contest data
- `onAddToCalendar?: (contest) => void` - Calendar action
- `onViewDetails?: (contest) => void` - View detail action
- `showActions?: boolean` - Show action buttons
- `variant?: 'default' | 'compact'` - Display variant
- `className?: string` - Additional styles

**Features:**
- Platform and difficulty badges
- Real-time countdown timer
- Participant and problem count
- Location display
- External links (website, registration)
- Responsive design

**Usage:**
```tsx
import { ContestCard } from '@/components/core/contests';

<ContestCard
  contest={contest}
  onViewDetails={(contest) => router.push(`/contests/${contest.id}`)}
  onAddToCalendar={handleAddToCalendar}
  showActions
/>
```

---

#### `ContestList`
List container with pagination and view toggle.

**Props:**
- `contests: ContestResponseDto[]` - Array of contests
- `loading?: boolean` - Loading state
- `pagination?: PaginatedContestResponseDto['pagination']` - Pagination data
- `onPageChange?: (offset: number) => void` - Page change handler
- `view?: 'grid' | 'list'` - Current view mode
- `onViewChange?: (view) => void` - View toggle handler
- `onContestClick?: (contest) => void` - Contest click handler
- `onAddToCalendar?: (contest) => void` - Calendar action

**Features:**
- Grid and list view modes
- Pagination controls
- Loading skeletons
- Empty state
- Responsive grid layout

**Usage:**
```tsx
import { ContestList } from '@/components/core/contests';

<ContestList
  contests={contests}
  loading={isLoading}
  pagination={pagination}
  onPageChange={handlePageChange}
  view={view}
  onViewChange={setView}
  onContestClick={(contest) => router.push(`/contests/${contest.id}`)}
/>
```

---

#### `ContestFilters`
Advanced filter sidebar with all filtering options.

**Props:**
- `filters: ContestQueryDto` - Current filter state
- `onFilterChange: (filters) => void` - Filter change handler
- `onReset: () => void` - Reset filters handler
- `className?: string` - Additional styles

**Features:**
- Platform selection (Codeforces, LeetCode, CodeChef, AtCoder)
- Status/Phase filter (Upcoming, Running, Finished)
- Difficulty filter (Beginner, Easy, Medium, Hard, Expert)
- Date range picker (start/end dates)
- Sort options (Start Time, End Time, Name, Participants)
- Sort order (Ascending/Descending)
- Active filter indicator
- Reset all filters button

**Usage:**
```tsx
import { ContestFilters } from '@/components/core/contests';

<ContestFilters
  filters={filters}
  onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
  onReset={() => setFilters(defaultFilters)}
/>
```

---

#### `ContestSearch`
Search bar with query input and clear functionality.

**Props:**
- `onSearch: (query: string) => void` - Search handler
- `placeholder?: string` - Input placeholder
- `defaultValue?: string` - Initial value
- `className?: string` - Additional styles

**Features:**
- Search icon
- Clear button
- Form submission
- Responsive design

**Usage:**
```tsx
import { ContestSearch } from '@/components/core/contests';

<ContestSearch
  onSearch={handleSearch}
  placeholder="Search contests..."
/>
```

---

#### `ContestDetailView`
Full contest details page with comprehensive information.

**Props:**
- `contest: ContestResponseDto` - Contest data
- `onAddToCalendar?: (contest) => void` - Calendar action
- `onBack?: () => void` - Back navigation handler
- `className?: string` - Additional styles

**Features:**
- Complete contest header with badges
- Real-time countdown
- Action buttons (Add to Calendar, Visit Website, Register)
- Detailed information cards:
  - Start/End times with timezone
  - Duration
  - Participants and problems count
  - Prepared by information
  - Location
- Platform-specific metadata display
- External links section
- System information (IDs, sync status)

**Usage:**
```tsx
import { ContestDetailView } from '@/components/core/contests';

<ContestDetailView
  contest={contest}
  onAddToCalendar={handleAddToCalendar}
  onBack={() => router.back()}
/>
```

---

#### `ContestStatsCharts`
Analytics and statistics visualization.

**Props:**
- `stats?: ContestStatsDto` - Statistics data
- `loading?: boolean` - Loading state
- `className?: string` - Additional styles

**Features:**
- Overview stat cards (Total, Upcoming, Running, Finished)
- Platform distribution chart
- Difficulty breakdown
- Contest type distribution
- Percentage calculations
- Progress bars
- Color-coded visuals

**Usage:**
```tsx
import { ContestStatsCharts } from '@/components/core/contests';

<ContestStatsCharts
  stats={stats}
  loading={isLoading}
/>
```

---

### Utility Components

#### `ContestCountdown`
Real-time countdown timer for contests.

**Props:**
- `startTime: Date | string` - Contest start time
- `endTime: Date | string` - Contest end time
- `className?: string` - Additional styles
- `showIcon?: boolean` - Show status icon

**Features:**
- Automatic status detection (upcoming/running/finished)
- Live countdown updates (1s interval)
- Colored status indicators
- Formatted time display (days, hours, minutes, seconds)
- Responsive design

---

#### `PlatformBadge`
Platform identification badge.

**Props:**
- `platform: ContestPlatform` - Platform enum
- `variant?: 'default' | 'outline'` - Badge variant
- `size?: 'sm' | 'md' | 'lg'` - Badge size
- `showIcon?: boolean` - Show platform icon
- `className?: string` - Additional styles

**Features:**
- Platform-specific colors
- Platform icons (CF, LC, CC, AC)
- Multiple sizes
- Outline variant support

---

#### `DifficultyBadge`
Difficulty level badge.

**Props:**
- `difficulty: DifficultyLevel` - Difficulty enum
- `variant?: 'default' | 'outline'` - Badge variant
- `size?: 'sm' | 'md' | 'lg'` - Badge size
- `className?: string` - Additional styles

**Features:**
- Color-coded by difficulty
- Multiple sizes
- Outline variant support
- Labels: Beginner, Easy, Medium, Hard, Expert

---

## 🎨 Types & Configurations

### Enums

```typescript
enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
}

enum ContestPhase {
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  FINISHED = 'FINISHED',
  // ... more phases
}

enum ContestType {
  CF = 'CF',
  IOI = 'IOI',
  WEEKLY = 'WEEKLY',
  // ... more types
}

enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}
```

### Main Interfaces

```typescript
interface ContestResponseDto {
  id: string;
  platformId: string;
  name: string;
  platform: ContestPlatform;
  phase: ContestPhase;
  type: ContestType;
  startTime: Date | string;
  endTime: Date | string;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata: PlatformMetadata;
  isActive: boolean;
  isNotified: boolean;
  // ... virtual fields
}

interface ContestQueryDto {
  platform?: ContestPlatform;
  phase?: ContestPhase;
  type?: ContestType;
  difficulty?: DifficultyLevel;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
  sortBy?: 'startTime' | 'endTime' | 'name' | 'participantCount';
  sortOrder?: 'asc' | 'desc';
}
```

### Platform Configuration

```typescript
const PLATFORM_CONFIG = {
  [ContestPlatform.CODEFORCES]: {
    name: 'Codeforces',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: 'CF',
  },
  // ... other platforms
};

const DIFFICULTY_CONFIG = {
  [DifficultyLevel.BEGINNER]: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    label: 'Beginner',
  },
  // ... other difficulties
};
```

---

## 📖 Complete Example Usage

### Contest Browse Page

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ContestList,
  ContestFilters,
  ContestSearch,
} from '@/components/core/contests';
import { ContestQueryDto } from '@/lib/types/contest.types';

export default function ContestsPage() {
  const [filters, setFilters] = useState<ContestQueryDto>({
    limit: 20,
    offset: 0,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Fetch contests based on filters
  const { contests, pagination, loading } = useContests(filters);

  const handleFilterChange = (newFilters: Partial<ContestQueryDto>) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query, offset: 0 });
  };

  const handlePageChange = (offset: number) => {
    setFilters({ ...filters, offset });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-80 shrink-0">
          <ContestFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters({ limit: 20, offset: 0 })}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <ContestSearch onSearch={handleSearch} />
          <ContestList
            contests={contests}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            view={view}
            onViewChange={setView}
            onContestClick={(contest) =>
              router.push(`/contests/${contest.id}`)
            }
          />
        </main>
      </div>
    </div>
  );
}
```

### Contest Detail Page

```tsx
'use client';

import { ContestDetailView } from '@/components/core/contests';

export default function ContestPage({ params }: { params: { id: string } }) {
  const { contest, loading } = useContest(params.id);

  if (loading) return <div>Loading...</div>;
  if (!contest) return <div>Contest not found</div>;

  return (
    <div className="container mx-auto py-8">
      <ContestDetailView
        contest={contest}
        onAddToCalendar={handleAddToCalendar}
        onBack={() => router.back()}
      />
    </div>
  );
}
```

---

## 🎯 Features Checklist

- ✅ **Platform Support**: Codeforces, LeetCode, CodeChef, AtCoder
- ✅ **Real-time Countdowns**: Live updates for contest timing
- ✅ **Advanced Filtering**: Platform, status, difficulty, date range, type
- ✅ **Search**: Full-text search across contests
- ✅ **Pagination**: Efficient data loading
- ✅ **View Modes**: Grid and list views
- ✅ **Responsive Design**: Mobile, tablet, desktop optimized
- ✅ **Loading States**: Skeleton loaders for better UX
- ✅ **Empty States**: Helpful messages when no data
- ✅ **Badges & Indicators**: Visual status and metadata display
- ✅ **External Links**: Direct navigation to contest websites
- ✅ **Statistics**: Analytics and breakdown charts
- ✅ **Accessibility**: Semantic HTML and ARIA labels
- ✅ **TypeScript**: Full type safety
- ✅ **Date Formatting**: Localized date/time display

---

## 🚀 Next Steps

1. **API Integration**: Connect components to server API endpoints
2. **State Management**: Implement Zustand stores for contest data
3. **React Query**: Add server state management and caching
4. **Add to Calendar**: Implement ICS file generation
5. **Notifications**: Add notification preference toggles
6. **Admin Features**: Contest CRUD operations for admins
7. **Testing**: Add unit and integration tests
8. **Documentation**: API endpoint documentation

---

## 📦 Dependencies Used

- `@/components/ui/*` - shadcn/ui components
- `date-fns` - Date formatting and manipulation
- `lucide-react` - Icon library
- `@/lib/utils` - Utility functions (cn)
- `@/lib/types/contest.types` - TypeScript types

---

## 🎨 Design System

All components follow the application's design system:
- Theme support (light/dark mode)
- Consistent spacing and typography
- Color-coded platform and difficulty indicators
- Responsive breakpoints
- Hover and focus states
- Smooth transitions
