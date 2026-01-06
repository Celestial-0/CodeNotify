import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schemas for OTP validation
export const RequestOtpSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
});

export const VerifyOtpSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  code: z
    .string()
    .length(6, 'OTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only digits'),
});

export const ResendOtpSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
});

// Create DTO classes using nestjs-zod
export class RequestOtpDto extends createZodDto(RequestOtpSchema) { }
export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) { }
export class ResendOtpDto extends createZodDto(ResendOtpSchema) { }

// Response DTOs
export interface OtpResponse {
  message: string;
  expiresIn?: number; // seconds until expiry
}

export class UserResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  isEmailVerified: boolean;
}

export class VerifyOtpResponse {
  message: string;
  isEmailVerified: boolean;
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}
