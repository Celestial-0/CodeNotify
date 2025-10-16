import { z } from 'zod';

// Zod schemas for user operations
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phoneNumber: z.string().optional(),
  preferences: z
    .object({
      platforms: z
        .array(z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder']))
        .optional(),
      alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
      contestTypes: z.array(z.string()).optional(),
    })
    .optional(),
});

export const GetUserByIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// TypeScript types
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type GetUserByIdDto = z.infer<typeof GetUserByIdSchema>;

// User preferences interface
export interface UserPreferences {
  platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  contestTypes: string[];
}
