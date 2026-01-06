# Admin Dashboard

The Admin Dashboard provides a powerful interface for administrators to manage the entire CodeNotify system.

**Route**: `/admin` (Protected by `RolesGuard` ensuring only 'admin' users can access)

## Sections

### 1. Overview
- **Stats Card**: Total Users, Active Contests, Notifications Sent.
- **Recent Activity**: Log of recent system events or user signups.

### 2. Contests Management (`/admin/contests`)
- **List View**: Paginated table of all contests.
- **Actions**:
  - **Sync**: Manually trigger sync for specific platforms.
  - **Delete**: Remove invalid contests.
  - **Edit**: Modify contest details (e.g., duration, URL).
- **Filtering**: By platform, status (upcoming, running).

### 3. Users Management (`/admin/users`)
- **User Table**: View all registered users.
- **Search**: Find users by email or name.
- **Role Management**: Promote users to 'admin' or demote to 'user'.
- **Status Control**: Deactivate/Ban users.

### 4. Notifications (`/admin/notifications`)
- **Blast**: Send system-wide announcements to all users.
- **History**: View log of all sent system notifications.
- **Stats**: Delivery success rates per channel.

## Technical Implementation

- **Layout**: Uses a specialized `AdminLayout` with a persistent sidebar.
- **Data Fetching**: Heavy reliance on React Query for caching list data.
- **Mutations**: Optimistic updates for actions like "Delete Contest" to ensure UI responsiveness.
- **Components**: Reuses `DataTable` (TanStack Table) for all list views with sorting and pagination built-in.
