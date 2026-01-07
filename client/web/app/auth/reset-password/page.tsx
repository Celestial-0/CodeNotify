import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/core/auth/reset-password-form";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
