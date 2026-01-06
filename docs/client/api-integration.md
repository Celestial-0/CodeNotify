# API Integration

The client uses a sophisticated API layer to handle communication with the NestJS backend.

## Axios Setup (`lib/api`)

We use a central `axios` instance configured in `lib/api/http.client.ts`.

### Base Configuration
- **Base URL**: Set via environment variable `NEXT_PUBLIC_API_URL`.
- **Timeout**: 10s default.
- **Headers**: `Content-Type: application/json`.

### Interceptors

#### Request Interceptor
- Automatically attaches `Authorization: Bearer <token>` if `accessToken` exists in memory.

#### Response Interceptor (Token Refresh)
- Intercepts **401 Unauthorized** responses.
- **Logic**:
  1. Checks if the error is from an original request (not a retry).
  2. Calls `AuthService.refresh()` to get a new access token using the HttpOnly Refresh Token.
  3. If refresh succeeds: Updates memory token and retries original request.
  4. If refresh fails: Clears auth state and redirects to `/auth/signin`.

## React Query (`providers/query-provider.tsx`)

We wrap the application in `QueryClientProvider` to manage server state.

### Configuration
- **Stale Time**: 1 minute (default).
- **Refetch on Window Focus**: False (to prevent spam).
- **Retry**: 1 time on failure.

### Custom Hooks
We encapsulate API calls in custom hooks for reusability:

- `useUser`: Fetches current user profile.
- `useContests`: Fetches filtered contest list.
- `useNotifications`: Fetches user notifications.

Example:
```typescript
export const useContests = (filters) => {
  return useQuery({
    queryKey: ['contests', filters],
    queryFn: () => ContestService.getAll(filters)
  });
};
```
