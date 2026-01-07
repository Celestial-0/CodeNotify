"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, Code2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { z } from "zod";

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

// Validation schema
const ResetPasswordSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(ResetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await AuthService.verifyPasswordResetOtp(
                email,
                data.otp,
                data.password
            );

            toast.success("Password reset successful!", {
                description: "You can now sign in with your new password",
            });

            // Redirect to signin page
            setTimeout(() => {
                router.push("/auth/signin");
            }, 1500);
        } catch (error) {
            console.error("Reset password error:", error);

            let errorMessage = "Failed to reset password. Please try again.";
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error("Reset failed", {
                description: errorMessage,
            });
        }
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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
                            &ldquo;Almost there! Enter the verification code we sent to your email and choose a new secure password.&rdquo;
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
                            Reset your password
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Enter the 6-digit code sent to <strong>{email}</strong>
                        </p>
                    </div>

                    {/* Reset Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                autoComplete="one-time-code"
                                {...register("otp")}
                                disabled={isSubmitting}
                            />
                            {errors.otp && (
                                <p className="text-sm text-destructive">{errors.otp.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password (min 6 characters)"
                                    autoComplete="new-password"
                                    className="pe-10"
                                    {...register("password")}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="size-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="size-4 me-2 animate-spin" />}
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        Didn't receive the code?{" "}
                        <Link
                            href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
                            className="text-primary hover:underline font-medium"
                        >
                            Resend
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
