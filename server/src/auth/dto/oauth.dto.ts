import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Google OAuth Response DTO
export interface GoogleAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

// OAuth Login DTO for future OAuth providers
export const OAuthLoginSchema = z.object({
  provider: z.enum(['google', 'github', 'facebook']),
  accessToken: z.string().min(1, 'Access token is required'),
});

export class OAuthLoginDto extends createZodDto(OAuthLoginSchema) {}

// OAuth Link DTO for linking OAuth accounts to existing users
export const OAuthLinkSchema = z.object({
  provider: z.enum(['google', 'github', 'facebook']),
  accessToken: z.string().min(1, 'Access token is required'),
});

export class OAuthLinkDto extends createZodDto(OAuthLinkSchema) {}
