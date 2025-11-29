/**
 * Dashboard Layout
 * Protected layout for dashboard pages with navigation
 */

"use client";

import { ProtectedRoute } from "@/components/core/auth/protected-route";
import { DashboardNavbar } from "@/components/core/dashboard/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen flex flex-col bg-background">
        <DashboardNavbar />
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
