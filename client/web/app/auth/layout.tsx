"use client";

import { ReactNode, useEffect } from "react";
import { Activity } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function AuthLayoutPage({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // ensure store initializes auth state on mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity>Checking your session…</Activity>
        </div>  
      </div>
    );
  }

  if (isAuthenticated) {
    // Render nothing while redirecting
    return null;
  }

  return <>{children}</>;
}
