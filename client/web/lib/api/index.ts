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

// Re-export types
export type { SigninFormData, SignupFormData, AuthResponse } from './auth.service';
export type { AdminUser, PaginatedUsersResponse } from './admin.service';
