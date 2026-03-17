/**
 * Platform-specific metadata type definitions
 * Replaces Record<string, any> with strongly typed metadata
 */

/**
 * Codeforces-specific contest metadata
 */
export interface CodeforcesPlatformMetadata {
  phase?: string;
  frozen?: boolean;
  durationSeconds?: number;
  relativeTimeSeconds?: number;
  preparedBy?: string;
  websiteUrl?: string;
  description?: string;
  difficulty?: string;
  kind?: string;
  icpcRegion?: string;
  country?: string;
  city?: string;
  season?: string;
}

/**
 * LeetCode-specific contest metadata
 */
export interface LeetCodePlatformMetadata {
  titleSlug?: string;
  cardImg?: string;
  description?: string;
  isVirtual?: boolean;
  originStartTime?: number;
  duration?: number;
}

/**
 * AtCoder-specific contest metadata
 */
export interface AtCoderPlatformMetadata {
  ratedRange?: string;
  duration?: number;
  startEpochSecond?: number;
  rate_change?: string;
  contest_id?: string;
}

/**
 * CodeChef-specific contest metadata
 */
export interface CodeChefPlatformMetadata {
  code?: string;
  division?: string;
  bannerFile?: string;
  parent?: string;
  contest_code?: string;
  contest_type?: string;
  distinct_users?: number;
}

/**
 * Union type for all platform metadata types
 */
export type PlatformMetadata =
  | CodeforcesPlatformMetadata
  | LeetCodePlatformMetadata
  | AtCoderPlatformMetadata
  | CodeChefPlatformMetadata;

/**
 * Type-safe platform metadata map
 */
export type PlatformMetadataMap = {
  codeforces: CodeforcesPlatformMetadata;
  leetcode: LeetCodePlatformMetadata;
  atcoder: AtCoderPlatformMetadata;
  codechef: CodeChefPlatformMetadata;
};

/**
 * Get platform metadata type based on platform name
 */
export type MetadataForPlatform<T extends keyof PlatformMetadataMap> =
  PlatformMetadataMap[T];
