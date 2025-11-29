// Contest Types - Based on Server Schema

// Enums matching server
export enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
}

export enum ContestPhase {
  // Codeforces
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  PENDING_SYSTEM_TEST = 'PENDING_SYSTEM_TEST',
  SYSTEM_TEST = 'SYSTEM_TEST',
  FINISHED = 'FINISHED',
  // LeetCode
  UPCOMING = 'UPCOMING',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
  // CodeChef
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export enum ContestType {
  // Codeforces
  CF = 'CF',
  IOI = 'IOI',
  ICPC = 'ICPC',
  // LeetCode
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  // CodeChef
  LONG = 'LONG',
  COOK_OFF = 'COOK_OFF',
  LUNCH_TIME = 'LUNCH_TIME',
  STARTERS = 'STARTERS',
  // AtCoder
  ABC = 'ABC',
  ARC = 'ARC',
  AGC = 'AGC',
  AHC = 'AHC',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

// Platform-specific metadata interface
export interface PlatformMetadata {
  // Codeforces specific
  frozen?: boolean;
  relativeTimeSeconds?: number;
  icpcRegion?: string;
  season?: string;

  // LeetCode specific
  titleSlug?: string;
  premiumOnly?: boolean;

  // CodeChef specific
  division?: string;
  rated?: boolean;

  // AtCoder specific
  ratedRange?: string;
  penalty?: number;
}

// Main Contest Response DTO
export interface ContestResponseDto {
  id: string;
  platformId: string;
  name: string;
  platform: ContestPlatform;
  phase: ContestPhase;
  type: ContestType;
  startTime: Date | string;
  endTime: Date | string;
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
  platformMetadata: PlatformMetadata;
  isActive: boolean;
  isNotified: boolean;
  lastSyncedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Virtual fields
  isUpcoming?: boolean;
  isRunning?: boolean;
  isFinished?: boolean;
  timeUntilStart?: number;
  timeUntilEnd?: number;
}

// Paginated Response
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

// Query DTO
export interface ContestQueryDto {
  platform?: ContestPlatform;
  phase?: ContestPhase;
  type?: ContestType;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  isNotified?: boolean;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  country?: string;
  city?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'startTime' | 'endTime' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Create Contest DTO
export interface CreateContestDto {
  platformId: string;
  name: string;
  platform: ContestPlatform;
  type: ContestType;
  startTime: Date | string;
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
  platformMetadata?: PlatformMetadata;
}

// Update Contest DTO
export interface UpdateContestDto {
  name?: string;
  type?: ContestType;
  startTime?: Date | string;
  durationMinutes?: number;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  preparedBy?: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  problemCount?: number;
  country?: string;
  city?: string;
  platformMetadata?: PlatformMetadata;
  isActive?: boolean;
  isNotified?: boolean;
}

// Stats DTOs
export interface ContestStatsDto {
  totalContests: number;
  upcomingContests: number;
  runningContests: number;
  finishedContests: number;
  platformBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export interface PlatformStatsDto {
  platform: ContestPlatform;
  totalContests: number;
  upcomingContests: number;
  runningContests: number;
  finishedContests: number;
  averageDuration: number;
  averageParticipants: number;
  lastSyncTime?: Date | string;
}

// Utility type for filter options
export interface ContestFilterOptions {
  platforms: ContestPlatform[];
  phases: ContestPhase[];
  types: ContestType[];
  difficulties: DifficultyLevel[];
}

// UI-specific types
export interface ContestCardProps {
  contest: ContestResponseDto;
  onAddToCalendar?: (contest: ContestResponseDto) => void;
  onNotifyToggle?: (contest: ContestResponseDto) => void;
  showActions?: boolean;
}

export interface ContestListProps {
  contests: ContestResponseDto[];
  loading?: boolean;
  pagination?: PaginatedContestResponseDto['pagination'];
  onPageChange?: (offset: number) => void;
  view?: 'grid' | 'list';
}

export interface ContestFilterProps {
  filters: ContestQueryDto;
  onFilterChange: (filters: Partial<ContestQueryDto>) => void;
  onReset: () => void;
}

// Platform display names and colors
export const PLATFORM_CONFIG = {
  [ContestPlatform.CODEFORCES]: {
    name: 'Codeforces',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: 'CF',
  },
  [ContestPlatform.LEETCODE]: {
    name: 'LeetCode',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: 'LC',
  },
  [ContestPlatform.CODECHEF]: {
    name: 'CodeChef',
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    icon: 'CC',
  },
  [ContestPlatform.ATCODER]: {
    name: 'AtCoder',
    color: 'bg-gray-700',
    textColor: 'text-gray-700',
    icon: 'AC',
  },
} as const;

// Difficulty colors
export const DIFFICULTY_CONFIG = {
  [DifficultyLevel.BEGINNER]: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    label: 'Beginner',
  },
  [DifficultyLevel.EASY]: {
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    label: 'Easy',
  },
  [DifficultyLevel.MEDIUM]: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    label: 'Medium',
  },
  [DifficultyLevel.HARD]: {
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    label: 'Hard',
  },
  [DifficultyLevel.EXPERT]: {
    color: 'bg-red-500',
    textColor: 'text-red-500',
    label: 'Expert',
  },
} as const;

// Phase status colors
export const PHASE_CONFIG: Record<
  ContestPhase,
  { color: string; label: string }
> = {
  [ContestPhase.BEFORE]: { color: 'bg-blue-500', label: 'Upcoming' },
  [ContestPhase.UPCOMING]: { color: 'bg-blue-500', label: 'Upcoming' },
  [ContestPhase.NOT_STARTED]: { color: 'bg-blue-500', label: 'Not Started' },
  [ContestPhase.CODING]: { color: 'bg-green-500', label: 'Running' },
  [ContestPhase.RUNNING]: { color: 'bg-green-500', label: 'Running' },
  [ContestPhase.STARTED]: { color: 'bg-green-500', label: 'Running' },
  [ContestPhase.PENDING_SYSTEM_TEST]: {
    color: 'bg-yellow-500',
    label: 'Testing',
  },
  [ContestPhase.SYSTEM_TEST]: { color: 'bg-yellow-500', label: 'Testing' },
  [ContestPhase.FINISHED]: { color: 'bg-gray-500', label: 'Finished' },
  [ContestPhase.ENDED]: { color: 'bg-gray-500', label: 'Finished' },
  [ContestPhase.COMPLETED]: { color: 'bg-gray-500', label: 'Finished' },
};
