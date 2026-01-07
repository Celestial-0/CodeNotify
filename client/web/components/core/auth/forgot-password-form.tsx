"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, Code2, AtSign, Mail } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { ForgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/types/auth.types";
import { AuthService } from "@/lib/api/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Floating background paths component
function FloatingPaths({ position }: { position: number }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`grid-pattern-${position}`}
          width={200}
          height={200}
          x="50%"
          y={-1}
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <svg x="50%" y={-1} className="overflow-visible fill-gray-800/20">
        <path
          d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
          strokeWidth={0}
        />
      </svg>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#grid-pattern-${position})`}
      />
    </svg>
  );
}

// Auth separator component
function AuthSeparator() {
  return (
    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
      <span className="relative z-10 bg-background px-2 text-muted-foreground">
        Or
      </span>
    </div>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await AuthService.requestPasswordResetOtp(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success("OTP sent to your email!", {
        description: `Check your email at ${data.email}`,
      });

      // Redirect to reset password page after a short delay
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);

      let errorMessage = "Failed to send OTP. Please try again.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Request failed", {
        description: errorMessage,
      });
    }
  };

  // Success state - email sent
  if (submitted) {
    return (
      <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
        {/* Left Panel - Hidden on mobile */}
        <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
          <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
          <div className="z-10 flex items-center gap-2">
            <Code2 className="size-6" />
            <p className="text-xl font-semibold">CodeNotify</p>
          </div>
          <div className="z-10 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-xl">
                &ldquo;Check your email for the verification code. We've sent it to help you reset your password securely.&rdquo;
              </p>
              <footer className="font-mono text-sm font-semibold">
                ~ CodeNotify Security Team
              </footer>
            </blockquote>
          </div>
          <div className="absolute inset-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        </div>

        {/* Right Panel - Success Message */}
        <div className="relative flex min-h-screen flex-col justify-center p-4">
          <div
            aria-hidden
            className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
          >
            <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
            <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
            <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
          </div>

          <Button variant="ghost" className="absolute top-7 left-5" asChild>
            <Link href="/">
              <ChevronLeft className="size-4 me-2" />
              Home
            </Link>
          </Button>

          <div className="mx-auto space-y-6 sm:w-sm">
            {/* Mobile Branding */}
            <div className="flex items-center gap-2 lg:hidden">
              <Code2 className="size-6" />
              <p className="text-xl font-semibold">CodeNotify</p>
            </div>

            {/* Success Message */}
            <div className="flex flex-col space-y-2 text-center">
              <Mail className="mx-auto size-12 text-primary" />
              <h1 className="font-heading text-2xl font-bold tracking-wide">
                Check your email
              </h1>
              <p className="text-muted-foreground text-base">
                We've sent a verification code to <strong>{submittedEmail}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code in the next page to reset your password.
                If you don't see the email, check your spam folder.
              </p>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/auth/signin">Back to Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Initial form state
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Panel - Hidden on mobile */}
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <Code2 className="size-6" />
          <p className="text-xl font-semibold">CodeNotify</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;We'll help you get back on track. Reset your password and continue receiving contest notifications.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold">
              ~ CodeNotify Team
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
        </div>

        <Button variant="ghost" className="absolute top-7 left-5" asChild>
          <Link href="/">
            <ChevronLeft className="size-4 me-2" />
            Home
          </Link>
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm">
          {/* Mobile Branding */}
          <div className="flex items-center gap-2 lg:hidden">
            <Code2 className="size-6" />
            <p className="text-xl font-semibold">CodeNotify</p>
          </div>

          {/* Header */}
          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground text-base">
              Enter your email address and we'll send you a verification code
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative h-max">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="peer ps-9"
                  autoComplete="email"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSign className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="size-4 me-2 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
