# State Management

CodeNotify Client uses **Zustand** for global client state management due to its simplicity and performance.

## Stores

### 1. Auth Store (`useAuthStore`)
Manages the user's authentication session.

- **State**:
  - `user`: UserProfile object or null.
  - `isAuthenticated`: boolean.
  - `isLoading`: boolean (initial check).
- **Actions**:
  - `setUser(user)`: Updates user state.
  - `logout()`: Clears state.
  - `checkAuth()`: Async action to verify session on app load.

**Persistence**:
- We deliberately DO NOT persist the sensitive `user` object in `localStorage` to avoid staleness. Instead, we rely on `checkAuth()` to hydrate the store from the server on first load.

### 2. UI Store (`useUIStore`)
Manages global UI state (optional/future).

- **State**:
  - `theme`: 'light' | 'dark' | 'system'.
  - `sidebarOpen`: boolean (mobile).
- **Actions**:
  - `toggleSidebar()`
  - `setTheme(theme)`

## Server State vs Client State

We strictly separate server state and client state:

- **Server State** (Contests, Notifications, User Profile Source): Managed by **React Query**.
- **Client State** (Auth Session, UI Toggles, Form Inputs): Managed by **Zustand**.

This separation ensures data consistency and reduces complexity.
