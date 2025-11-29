"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthService } from "@/lib/api/auth.service";
import { useAuthStore } from "@/lib/store/auth-store";
import { UserService } from "@/lib/api/user.service";

type CallbackStatus = "loading" | "success" | "error";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { setUser, setError } = useAuthStore();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the OAuth callback - extract tokens from URL
        const result = AuthService.handleOAuthCallback();

        if (!result.success) {
          setStatus("error");
          setErrorMessage(result.error || "Authentication failed");
          setError(result.error || "Authentication failed");
          toast.error("Authentication failed", {
            description: result.error || "Could not complete Google sign in",
          });
          
          // Redirect to signin page after a delay
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
          return;
        }

        // Fetch user profile with the new tokens
        try {
          const userProfile = await UserService.getProfile();
          setUser(userProfile);
          
          setStatus("success");
          toast.success("Welcome!", {
            description: `Signed in as ${userProfile.email}`,
          });

          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } catch (profileError) {
          console.error("Failed to fetch user profile:", profileError);
          // Even if profile fetch fails, tokens are stored, redirect to dashboard
          setStatus("success");
          toast.success("Signed in successfully!");
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        const message = error instanceof Error ? error.message : "Authentication failed";
        setErrorMessage(message);
        setError(message);
        
        toast.error("Authentication failed", {
          description: message,
        });

        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, setUser, setError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Completing sign in...</h1>
            <p className="text-muted-foreground">
              Please wait while we authenticate your account
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-semibold">Sign in successful!</h1>
            <p className="text-muted-foreground">
              Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-semibold">Sign in failed</h1>
            <p className="text-muted-foreground max-w-md">
              {errorMessage || "An error occurred during authentication"}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you back to sign in...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
