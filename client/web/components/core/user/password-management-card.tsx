'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProfile } from '@/lib/hooks/use-user';
import { AuthService } from '@/lib/api/auth.service';
import { toast } from 'sonner';
import { Loader2, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import { AxiosError } from 'axios';

export function PasswordManagementCard() {
    const { data: profile } = useProfile();
    const router = useRouter();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    // Determine if user has a password (OAuth users without password won't have isEmailVerified)
    const hasPassword = profile?.isEmailVerified === true;

    return (
        <Card>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear,
                input[type="password"]::-webkit-credentials-auto-fill-button,
                input[type="password"]::-webkit-contacts-auto-fill-button {
                    display: none !important;
                }
            `}</style>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <CardTitle>Password Management</CardTitle>
                </div>
                <CardDescription>
                    {hasPassword
                        ? 'Update your password or use forgot password for OTP-based reset'
                        : 'Create a password to enable email-based login'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {!hasPassword ? (
                    <PasswordCreationSection profile={profile} router={router} />
                ) : (
                    <PasswordResetSection
                        profile={profile}
                        router={router}
                        showCurrentPassword={showCurrentPassword}
                        setShowCurrentPassword={setShowCurrentPassword}
                        showNewPassword={showNewPassword}
                        setShowNewPassword={setShowNewPassword}
                        isSubmittingPassword={isSubmittingPassword}
                        setIsSubmittingPassword={setIsSubmittingPassword}
                    />
                )}
            </CardContent>
        </Card>
    );
}

// Password Creation Section for OAuth users
function PasswordCreationSection({ profile, router }: { profile: any; router: any }) {
    return (
        <div className="space-y-4">
            <Alert>
                <KeyRound className="h-4 w-4" />
                <AlertTitle>Create Your Password</AlertTitle>
                <AlertDescription>
                    You signed up with Google. Create a password to enable email-based login as an alternative.
                </AlertDescription>
            </Alert>

            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    To create a password, we'll send a verification code to your email address.
                </p>
                <Button
                    type="button"
                    className="w-full"
                    onClick={() => router.push(`/auth/forgot-password?email=${encodeURIComponent(profile?.email || '')}`)}
                >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Create Password via Email Verification
                </Button>
            </div>
        </div>
    );
}

// Password Reset Section for users with existing passwords
function PasswordResetSection({
    profile,
    router,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    isSubmittingPassword,
    setIsSubmittingPassword,
}: any) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsSubmittingPassword(true);
        try {
            // Direct password change with current password verification
            await AuthService.changePassword(currentPassword, newPassword);

            toast.success('Password changed successfully!');

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password change error:', error);
            let errorMessage = 'Failed to change password';
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    return (
        <div className="space-y-4">
            <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Change Your Password</AlertTitle>
                <AlertDescription>
                    Enter your current password and choose a new one. For security, you can also use the OTP-based reset option below if you prefer.
                </AlertDescription>
            </Alert>

            <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            disabled={isSubmittingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground"
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                            disabled={isSubmittingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground"
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={isSubmittingPassword}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground"
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmittingPassword}>
                    {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmittingPassword ? 'Processing...' : 'Change Password'}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/auth/forgot-password?email=${encodeURIComponent(profile?.email || '')}`)}
            >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset via Email Verification (OTP)
            </Button>
        </div>
    );
}
