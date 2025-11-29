/**
 * Protected Route Component
 * Wrapper component to protect routes that require authentication
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand store to hydrate from localStorage
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      // Initialize auth state after hydration
      initialize();
    }
  }, [isHydrated, initialize]);

  useEffect(() => {
    if (isHydrated && !isLoading && requireAuth && !isAuthenticated) {
      // Redirect to sign in if not authenticated
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, isHydrated]);

  // Show loading spinner while hydrating or checking authentication
  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
