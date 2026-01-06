# Client Authentication

Authentication in the client is handled by `AuthService` and `useAuthStore` (Zustand), providing a seamless and secure user experience.

## Authentication Flow

### 1. Sign Up
- User enters details in `AuthUI` component.
- `AuthService.signup` calls server API.
- On success, redirects to `/auth/verify-email`.
- **Note**: User is NOT logged in immediately. Email verification is mandatory.

### 2. Email Verification
- Route: `/auth/verify-email`
- User enters the 6-digit OTP sent to their email.
- `AuthService.verifyEmail({ email, otp })` verifies the code.
- On success, redirects to Sign In or optionally auto-logs in (current implementation redirects to Sign In).

### 3. Sign In
- User enters credentials.
- `AuthService.signin` authenticates and returns `accessToken` + `refreshToken`.
- Tokens are stored:
  - `accessToken`: In-memory (axios interceptor).
  - `refreshToken`: HttpOnly cookie (handled by server) or secure storage.
- User profile is stored in `useAuthStore`.

### 4. Protected Routes
- `AuthGuard` component wraps protected routes (e.g., `/dashboard`).
- Checks if `api/auth/me` succeeds or if `useAuthStore` has user.
- Redirects to `/auth/signin` if unauthorized.

## Components

### AuthUI
The specialized `AuthUI` component handles both Sign In and Sign Up forms with toggle functionality.

**Location**: `components/core/auth/auth-ui.tsx`

**Features**:
- **Zod Validation**: Real-time form validation.
- **Micro-interactions**: Password visibility toggle, loading states.
- **Responsive**: Split-screen layout on desktop with dynamic quotes.

### VerifyEmailForm
A dedicated form for OTP entry.

**Location**: `app/auth/verify-email/page.tsx`

**Features**:
- OTP Input handling.
- Resend OTP functionality (timer based).
- Error handling for invalid/expired OTPs.

## Validation Schemas

Defined in `lib/types/auth.types.ts`:

- `SigninSchema`: Email + Password.
- `SignupSchema`: Name, Email, Password, PhoneNumber (optional).
- `VerifyEmailSchema`: Email + 6-digit OTP.
