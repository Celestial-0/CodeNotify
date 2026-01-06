# Contests

The Contests section is the core public interface for users to discover and track competitive programming contests.

**Routes**:
- `/contests` (All)
- `/contests/upcoming`
- `/contests/running`

## Features

### 1. Contest Listing
- **Cards**: Each contest is displayed as a rich card showing:
  - Platform Icon (Codeforces, LeetCode, etc.)
  - Contest Name
  - Duration & Start Time
  - "Add to Calendar" button
  - Register Link
- **Responsive Grid**: Adapts from 1 column (mobile) to 3 columns (desktop).

### 2. Filtering & Search
- **Platform Filter**: Toggle visibility of Codeforces, LeetCode, AtCoder, CodeChef.
- **Search Bar**: Real-time filtering by contest name.
- **Duration Filter**: Filter by short (< 2h), medium, or long contests.

## Technical Implementation

### Data Fetching
- Uses `useContests` hook which wraps React Query.
- **Caching**: Contest data is cached for 5 minutes to reduce server load.
- **Prefetching**: Next.js generic `page.tsx` serverside prefetching (optional) or hydration.

### State
- **URL Sync**: Filter state (platform, search) is synced to URL search params (e.g., `?platform=codeforces&q=div2`). This allows users to share filtered views.

### Components
- `ContestCard`: Atomic component for display.
- `ContestFilter`: Sidebar or top-bar filter component.
- `ContestList`: Grid container.
