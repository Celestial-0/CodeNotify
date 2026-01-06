import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  ContestPlatform,
  ContestPhase,
  ContestType,
  DifficultyLevel,
} from '../schemas/contest.schema';

// Platform metadata schemas
const PlatformMetadataSchema = z
  .object({
    // Codeforces specific
    frozen: z.boolean().optional(),
    relativeTimeSeconds: z.number().optional(),
    icpcRegion: z.string().optional(),
    season: z.string().optional(),

    // LeetCode specific
    titleSlug: z.string().optional(),
    premiumOnly: z.boolean().optional(),

    // CodeChef specific
    division: z.string().optional(),
    rated: z.boolean().optional(),

    // AtCoder specific
    ratedRange: z.string().optional(),
    penalty: z.number().optional(),
  })
  .optional();

// Create Contest Schema
export const CreateContestSchema = z
  .object({
    platformId: z.string().min(1, 'Platform ID is required'),
    name: z.string().min(1, 'Contest name is required'),
    platform: z.enum(ContestPlatform),
    phase: z.enum(ContestPhase),
    type: z.enum(ContestType),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    durationMinutes: z.number().positive('Duration must be positive'),
    description: z.string().optional(),
    websiteUrl: z.url().optional(),
    registrationUrl: z.url().optional(),
    preparedBy: z.string().optional(),
    difficulty: z.enum(DifficultyLevel).optional(),
    participantCount: z.number().min(0).optional(),
    problemCount: z.number().min(0).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    platformMetadata: PlatformMetadataSchema,
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

// Update Contest Schema
export const UpdateContestSchema = z
  .object({
    name: z.string().min(1).optional(),
    phase: z.enum(ContestPhase).optional(),
    type: z.enum(ContestType).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    durationMinutes: z.number().positive().optional(),
    description: z.string().optional(),
    websiteUrl: z.url().optional(),
    registrationUrl: z.string().url().optional(),
    preparedBy: z.string().optional(),
    difficulty: z.enum(DifficultyLevel).optional(),
    participantCount: z.number().min(0).optional(),
    problemCount: z.number().min(0).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    platformMetadata: PlatformMetadataSchema,
    isActive: z.boolean().optional(),
    isNotified: z.boolean().optional(),
  })
  .partial()
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

// Contest Query Schema
export const ContestQuerySchema = z.object({
  platform: z.enum(ContestPlatform).optional(),
  phase: z.enum(ContestPhase).optional(),
  type: z.enum(ContestType).optional(),
  difficulty: z.enum(DifficultyLevel).optional(),
  isActive: z.boolean().optional(),
  isNotified: z.boolean().optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z
    .enum(['startTime', 'endTime', 'name', 'participantCount'])
    .default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Contest Stats Schema
export const ContestStatsSchema = z.object({
  totalContests: z.number(),
  upcomingContests: z.number(),
  runningContests: z.number(),
  finishedContests: z.number(),
  platformBreakdown: z.record(z.string(), z.number()),
  typeBreakdown: z.record(z.string(), z.number()),
  difficultyBreakdown: z.record(z.string(), z.number()),
});

// Platform Stats Schema
export const PlatformStatsSchema = z.object({
  platform: z.enum(ContestPlatform),
  totalContests: z.number(),
  upcomingContests: z.number(),
  runningContests: z.number(),
  finishedContests: z.number(),
  averageDuration: z.number(),
  averageParticipants: z.number(),
  lastSyncTime: z.date().optional(),
});

// Bulk Create Schema
export const BulkCreateContestSchema = z.object({
  contests: z.array(CreateContestSchema).min(1).max(100),
});

// Sync Request Schema
export const SyncRequestSchema = z.object({
  forceSync: z.boolean().optional().default(false),
}).optional().default({ forceSync: false });

// Create DTO classes using nestjs-zod
export class CreateContestDto extends createZodDto(CreateContestSchema) { }
export class UpdateContestDto extends createZodDto(UpdateContestSchema) { }
export class ContestQueryDto extends createZodDto(ContestQuerySchema) { }
export class ContestStatsDto extends createZodDto(ContestStatsSchema) { }
export class PlatformStatsDto extends createZodDto(PlatformStatsSchema) { }
export class BulkCreateContestDto extends createZodDto(
  BulkCreateContestSchema,
) { }
export class SyncRequestDto extends createZodDto(SyncRequestSchema) { }

// Response DTOs
export interface ContestResponseDto {
  id: string;
  platformId: string;
  name: string;
  platform: ContestPlatform;
  phase: ContestPhase;
  type: ContestType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata: Record<string, any>;
  isActive: boolean;
  isNotified: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  isUpcoming?: boolean;
  isRunning?: boolean;
  isFinished?: boolean;
  timeUntilStart?: number;
  timeUntilEnd?: number;
}

export interface PaginatedContestResponseDto {
  data: ContestResponseDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
