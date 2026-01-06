# User Dashboard

The User Dashboard allows authenticated users to manage their personal CodeNotify experience.

**Route**: `/dashboard` (Protected)

## Features

### 1. Profile Management
- **Personal Info**: Update Name, Phone Number.
- **Account Status**: View verification status.

### 2. Notification Preferences
This is the most critical section for users.
- **Platform Selection**: Checkbox list of platforms to track (Codeforces, LeetCode, etc.).
- **Channels**: Toggle Email, WhatsApp, Push.
- **Alert Frequency**:
  - `Immediate`: Notify as soon as contest window hits.
  - `Daily`: Digest email.
- **Notify Before**: Slider to set hours before contest (e.g., notify me 2 hours before).

### 3. Notification History
- A timeline view of all notifications sent to the user.
- Status indicators (Sent, Failed, Read).

## Technical Implementation

- **Forms**: Uses `react-hook-form` with a comprehensive `UpdateProfileSchema`.
- **Optimistic UI**: When a user toggles a preference (e.g., "Email"), the UI updates immediately while the API request fires in the background.
- **Store Sync**: On successful update, `useAuthStore` is updated with the new user object to ensure consistency across the app.
