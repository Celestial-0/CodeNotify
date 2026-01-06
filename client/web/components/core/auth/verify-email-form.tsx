"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthService } from "@/lib/api/auth.service";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const { setUser } = useAuthStore();

    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [expiresIn, setExpiresIn] = useState<number | null>(null);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const hasRequested = useRef(false);

    // Request OTP on mount
    useEffect(() => {
        if (!hasRequested.current && email) {
            hasRequested.current = true;
            requestOtp();
        } else if (!email) {
            setError("Email address is required. Please sign up again.");
        }
    }, []);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Expiration timer
    useEffect(() => {
        if (expiresIn !== null && expiresIn > 0) {
            const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [expiresIn]);

    const requestOtp = async () => {
        try {
            setError("");
            const response = await AuthService.requestOtp(email);
            if (response.expiresIn) {
                setExpiresIn(response.expiresIn);
            }
            setResendCountdown(60); // 60 second cooldown
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
            setError(errorMessage);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setIsResending(true);
        setError("");
        try {
            const response = await AuthService.resendOtp(email);
            if (response.expiresIn) {
                setExpiresIn(response.expiresIn);
            }
            setResendCountdown(60);
            setCode(""); // Clear the input
            setRemainingAttempts(null); // Reset attempts display
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to resend OTP";
            setError(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await AuthService.verifyOtp(email, code);
            setSuccess(true);

            // Store user data in auth store (tokens are already stored by AuthService)
            setUser(response.user);

            // Show success toast
            toast.success("Email verified successfully!", {
                description: `Welcome ${response.user.name}! You're now logged in.`,
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Verification failed";
            setError(errorMessage);

            // Extract remaining attempts from error message if available
            const attemptsMatch = errorMessage.match(/(\d+)\s+attempt\(s\)\s+remaining/);
            if (attemptsMatch) {
                setRemainingAttempts(parseInt(attemptsMatch[1]));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (success) {
        return (
            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
                    <CardDescription className="text-center">
                        Your email has been successfully verified. Redirecting to dashboard...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary-foreground" />
                    </div>
                </div>
                <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
                <CardDescription className="text-center">
                    We&apos;ve sent a 6-digit verification code to
                    <br />
                    <strong>{email}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            placeholder="000000"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setCode(value);
                            }}
                            className="text-center text-2xl tracking-widest"
                            required
                            autoFocus
                        />
                        {expiresIn !== null && expiresIn > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Code expires in {formatTime(expiresIn)}
                            </p>
                        )}
                        {remainingAttempts !== null && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                {remainingAttempts} attempt(s) remaining
                            </p>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                    Didn&apos;t receive the code?
                </p>
                <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || isResending}
                    className="w-full"
                >
                    {isResending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : resendCountdown > 0 ? (
                        `Resend in ${resendCountdown}s`
                    ) : (
                        "Resend Code"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
