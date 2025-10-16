import { z } from 'zod';

// Zod schemas for validation
export const CreateUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phoneNumber: z.string().optional(),
});

export const SigninSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const SignoutSchema = z.object({});

// TypeScript types derived from Zod schemas
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type SigninDto = z.infer<typeof SigninSchema>;
export type SignoutDto = z.infer<typeof SignoutSchema>;

// Response DTOs
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
