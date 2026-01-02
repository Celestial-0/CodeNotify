import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schemas for user operations
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  preferences: z
    .object({
      platforms: z
        .array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder']))
        .optional(),
      alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
      contestTypes: z.array(z.string()).optional(),
      notificationChannels: z
        .object({
          whatsapp: z.boolean().optional(),
          email: z.boolean().optional(),
          push: z.boolean().optional(),
        })
        .optional(),
      notifyBefore: z.number().min(1).max(168).optional(), // 1 hour to 7 days
    })
    .optional(),
});

export const GetUserByIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const GetAllUsersSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
});

export const UpdateUserRoleSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const UpdateUserRoleBodySchema = z.object({
  role: z.enum(['user', 'admin']),
});

export const DeleteUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Create DTO classes using nestjs-zod
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class GetUserByIdDto extends createZodDto(GetUserByIdSchema) {}
export class GetAllUsersDto extends createZodDto(GetAllUsersSchema) {}
export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {}
export class UpdateUserRoleBodyDto extends createZodDto(
  UpdateUserRoleBodySchema,
) {}
export class DeleteUserDto extends createZodDto(DeleteUserSchema) {}

// User preferences interface
export interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
  notificationChannels?: {
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  notifyBefore?: number; // Hours before contest to notify
}
