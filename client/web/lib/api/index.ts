/**
 * API Services Index
 * Central export point for all API services
 */

// Core HTTP client
export { httpClient, APIError } from './http.client';

// Services
export { AuthService } from './auth.service';
export { ContestService } from './contest.service';
export { UserService } from './user.service';
export { NotificationService } from './notification.service';
export { AdminService } from './admin.service';
export { IntegrationService } from './integration.service';

// Re-export types
export type { SigninFormData, SignupFormData, AuthResponse } from './auth.service';
export type { AdminUser, PaginatedUsersResponse } from './admin.service';
export type {
  LinkDiscordDto,
  LinkTelegramDto,
  LinkWhatsAppDto,
  LinkResponse,
  UnlinkResponse,
  TestNotificationResult,
} from './integration.service';
