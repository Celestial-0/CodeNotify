/**
 * Authentication Types
 * Type definitions matching server DTOs for type safety
 */

import { z } from 'zod';

// Zod validation schemas matching server
export const SigninSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  phoneNumber: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

// TypeScript types from schemas
export type SigninFormData = z.infer<typeof SigninSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

// Response types matching server
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
