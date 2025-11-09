/**
 * Dashboard Layout
 * Protected layout for dashboard pages with navigation
 */

"use client";

import { ProtectedRoute } from "@/components/core/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen flex flex-col">
        {/* TODO: Add navigation/header component */}
        <main className="flex-1 container mx-auto py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
