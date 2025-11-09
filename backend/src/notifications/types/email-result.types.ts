/**
 * Result of sending email to a single recipient
 */
export interface EmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Result of sending email to a user
 */
export interface UserEmailResult {
  userId: string;
  email: string;
  username: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Response for custom email sending
 */
export interface CustomEmailResponse {
  total: number;
  successful: number;
  failed: number;
  results: EmailResult[];
}

/**
 * Response for bulk email sending
 */
export interface BulkEmailResponse {
  total: number;
  successful: number;
  failed: number;
  results: UserEmailResult[];
}

/**
 * Response for announcement sending
 */
export interface AnnouncementResponse {
  total: number;
  successful: number;
  failed: number;
  filters?: {
    platforms?: string[];
    isActive?: boolean;
  };
  results: UserEmailResult[];
}

/**
 * Response for contest reminder sending
 */
export interface ContestReminderResponse {
  contest: {
    id: string;
    name: string;
    platform: string;
    startTime: Date;
  };
  total: number;
  successful: number;
  failed: number;
  results: UserEmailResult[];
}

/**
 * User query filters
 */
export interface UserFilters {
  'preferences.platforms'?: { $in: string[] };
  isActive?: boolean;
}
