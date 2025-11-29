/**
 * Contests Layout
 * Layout for contest pages with navigation
 * Shows different navbar for authenticated vs unauthenticated users
 */

"use client";

import { DashboardNavbar } from "@/components/core/dashboard/dashboard-navbar";
import { Navbar } from "@/components/core/landing/navbar";
import { ContestsNav } from "@/components/core/contests/contests-nav";
import { useAuthStore } from "@/lib/store/auth-store";

export default function ContestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
      <ContestsNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
