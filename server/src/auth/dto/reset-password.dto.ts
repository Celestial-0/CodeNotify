import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schemas for password reset
export const RequestPasswordResetSchema = z.object({
    email: z.email({ message: 'Invalid email format' }),
});

export const ResetPasswordSchema = z.object({
    email: z.email({ message: 'Invalid email format' }),
    code: z.string().length(6, 'OTP code must be 6 digits'),
    newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters long'),
});

// Create DTO classes using nestjs-zod
export class RequestPasswordResetDto extends createZodDto(
    RequestPasswordResetSchema,
) { }
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) { }

// Response DTOs
export interface PasswordResetResponse {
    message: string;
    expiresIn?: number;
}
