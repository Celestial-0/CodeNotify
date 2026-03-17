import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Schema for creating a new user
 * Used by both auth signup and admin user creation
 */
export const CreateUserSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phoneNumber: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

/**
 * User response interface (without sensitive fields)
 */
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
