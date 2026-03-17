import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Re-export CreateUserDto from users module for backward compatibility
export {
  CreateUserDto,
  CreateUserSchema,
} from '../../users/dto/create-user.dto';
export type { UserResponse } from '../../users/dto/create-user.dto';

// Auth-specific schemas
export const SigninSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

export const SignoutSchema = z.object({});

// Create DTO classes using nestjs-zod
export class SigninDto extends createZodDto(SigninSchema) {}
export class SignoutDto extends createZodDto(SignoutSchema) {}

// Auth Response DTOs
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
