"use client";

import { ReactNode, useEffect } from "react";
import { Activity } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter, usePathname } from "next/navigation";

export default function AuthLayoutPage({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ensure store initializes auth state on mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Allow authenticated users to access password reset pages (for OAuth password creation)
    const isPasswordResetFlow = pathname === '/auth/forgot-password' || pathname === '/auth/reset-password';

    if (!isLoading && isAuthenticated && !isPasswordResetFlow) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity>Checking your session…</Activity>
        </div>
      </div>
    );
  }

  // Allow authenticated users to access password reset pages
  const isPasswordResetFlow = pathname === '/auth/forgot-password' || pathname === '/auth/reset-password';

  if (isAuthenticated && !isPasswordResetFlow) {
    // Render nothing while redirecting to dashboard
    return null;
  }

  return <>{children}</>;
}
