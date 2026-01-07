import { VerifyEmailForm } from "@/components/core/auth/verify-email-form";
import { Suspense } from "react";

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyEmailForm />
                </Suspense>
            </div>
        </div>
    );
}
