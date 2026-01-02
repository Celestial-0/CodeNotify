import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schemas for validation
export const CreateUserSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phoneNumber: z.string().optional(),
});

export const SigninSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

export const SignoutSchema = z.object({});

// Create DTO classes using nestjs-zod
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class SigninDto extends createZodDto(SigninSchema) {}
export class SignoutDto extends createZodDto(SignoutSchema) {}

// Response DTOs
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
