/**
 * Auth Initializer
 * Component to initialize auth state on app load
 */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the app loads
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
