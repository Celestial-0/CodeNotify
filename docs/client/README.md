# Client Documentation

The client is a modern **Next.js 15** application built with proper architectural patterns and type safety.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React

## Directory Structure

```
client/web/
├── app/                  # App Router pages and layouts
│   ├── (auth)/          # Authentication routes (signin, signup)
│   ├── (dashboard)/     # Protected user dashboard
│   ├── (admin)/         # Protected admin dashboard
│   └── contests/        # Public contest pages
├── components/           # React components
│   ├── ui/              # Reusable UI components (Shadcn)
│   └── core/            # Domain-specific components
├── lib/                  # Utilities and core logic
│   ├── api/             # API services and Axios setup
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript definitions
│   └── utils.ts         # Helper functions
└── hooks/                # Custom React hooks
```

## Key Features

- **Robust Authentication**: JWT handling, automatic token refresh, Email OTP verification.
- **Admin Dashboard**: Comprehensive management for Contests, Users, and Notifications.
- **User Dashboard**: Personal profile, preferences, and notification history.
- **Responsive Design**: Mobile-first approach with Dark Mode support.
