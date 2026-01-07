import { z } from 'zod';

// Change password with current password verification (no OTP)
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export interface ChangePasswordResponse {
    message: string;
}
