import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import {
  ContestQueryDto,
  ContestResponseDto,
  PaginatedContestResponseDto,
  ContestStatsDto,
  PlatformStatsDto,
  ContestPlatform,
  CreateContestDto,
  UpdateContestDto,
} from '@/lib/types/contest.types';
import type {
  UserProfile,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '@/lib/types/user.types';
import type {
  Notification,
  NotificationQueryDto,
  PaginatedNotificationsResponse,
  NotificationStats,
  NotificationStatsQuery,
} from '@/lib/types/notification.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Custom error class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: Record<string, string | number | boolean | string[]>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Request/Response Types
export interface SigninDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}

class APIClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    }
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while refresh is in progress
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            this.isRefreshing = false;

            // Retry all queued requests
            this.refreshSubscribers.forEach((callback) =>
              callback(newAccessToken)
            );
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            this.clearTokensFromStorage();
            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): APIError {
    if (error.response) {
      const data = error.response.data as {
        message?: string;
        statusCode?: number;
        error?: string;
        [key: string]: string | number | boolean | string[] | undefined;
      };
      return new APIError(
        data.message || 'An error occurred',
        error.response.status,
        data.error,
        data as Record<string, string | number | boolean | string[]>
      );
    } else if (error.request) {
      return new APIError('No response from server', undefined, 'NETWORK_ERROR');
    } else {
      return new APIError(error.message, undefined, 'REQUEST_ERROR');
    }
  }

  // ==================== Auth Endpoints ====================

  async signin(data: SigninDto): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>(
      '/auth/signin',
      data
    );
    this.saveTokensToStorage(
      response.data.accessToken,
      response.data.refreshToken
    );
    return response.data;
  }

  async signup(data: SignupDto): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>(
      '/auth/signup',
      data
    );
    this.saveTokensToStorage(
      response.data.accessToken,
      response.data.refreshToken
    );
    return response.data;
  }

  async signout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/signout');
    } finally {
      this.clearTokensFromStorage();
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new APIError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    const response = await this.axiosInstance.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken: this.refreshToken }
    );

    this.accessToken = response.data.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response.data.accessToken;
  }

  // ==================== Contest Endpoints ====================

  async getContests(
    query?: ContestQueryDto
  ): Promise<PaginatedContestResponseDto> {
    const response = await this.axiosInstance.get<PaginatedContestResponseDto>(
      '/contests',
      { params: query }
    );
    return response.data;
  }

  async getContestById(id: string): Promise<ContestResponseDto> {
    const response = await this.axiosInstance.get<ContestResponseDto>(
      `/contests/${id}`
    );
    return response.data;
  }

  async getUpcomingContests(
    platform?: ContestPlatform
  ): Promise<ContestResponseDto[]> {
    const response = await this.axiosInstance.get<ContestResponseDto[]>(
      '/contests/upcoming',
      { params: { platform } }
    );
    return response.data;
  }

  async getRunningContests(
    platform?: ContestPlatform
  ): Promise<ContestResponseDto[]> {
    const response = await this.axiosInstance.get<ContestResponseDto[]>(
      '/contests/running',
      { params: { platform } }
    );
    return response.data;
  }

  async getFinishedContests(
    platform?: ContestPlatform
  ): Promise<ContestResponseDto[]> {
    const response = await this.axiosInstance.get<ContestResponseDto[]>(
      '/contests/finished',
      { params: { platform } }
    );
    return response.data;
  }

  async searchContests(query: string): Promise<ContestResponseDto[]> {
    const response = await this.axiosInstance.get<ContestResponseDto[]>(
      '/contests/search',
      { params: { q: query } }
    );
    return response.data;
  }

  async getContestStats(): Promise<ContestStatsDto> {
    const response =
      await this.axiosInstance.get<ContestStatsDto>('/contests/stats');
    return response.data;
  }

  async getPlatformStats(
    platform: ContestPlatform
  ): Promise<PlatformStatsDto> {
    const response = await this.axiosInstance.get<PlatformStatsDto>(
      `/contests/stats/${platform}`
    );
    return response.data;
  }

  // ==================== User Endpoints ====================

  async getProfile(): Promise<UserProfile> {
    const response = await this.axiosInstance.get<UserProfile>('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    const response = await this.axiosInstance.put<UserProfile>(
      '/users/profile',
      data
    );
    return response.data;
  }

  async updatePreferences(data: UpdatePreferencesDto): Promise<UserProfile> {
    const response = await this.axiosInstance.put<UserProfile>(
      '/users/profile',
      { preferences: data }
    );
    return response.data;
  }

  async deactivateAccount(): Promise<{ message: string }> {
    const response = await this.axiosInstance.delete<{ message: string }>(
      '/users/profile'
    );
    return response.data;
  }

  async activateAccount(): Promise<{ message: string }> {
    const response = await this.axiosInstance.put<{ message: string }>(
      '/users/activate'
    );
    return response.data;
  }

  // ==================== Notification Endpoints ====================

  async getNotifications(
    query?: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponse> {
    const response = await this.axiosInstance.get<PaginatedNotificationsResponse>(
      '/notifications/notifications',
      { params: query }
    );
    return response.data;
  }

  async getNotificationById(id: string): Promise<Notification> {
    const response = await this.axiosInstance.get<Notification>(
      `/notifications/notifications/${id}`
    );
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await this.axiosInstance.patch<{ success: boolean; notification: Notification }>(
      `/notifications/notifications/${id}/read`
    );
    return response.data;
  }

  async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; modifiedCount: number }> {
    const response = await this.axiosInstance.patch<{ success: boolean; modifiedCount: number }>(
      `/notifications/notifications/user/${userId}/read-all`
    );
    return response.data;
  }

  async getNotificationStats(
    query?: NotificationStatsQuery
  ): Promise<NotificationStats> {
    const response = await this.axiosInstance.get<NotificationStats>(
      '/notifications/notifications/stats',
      { params: query }
    );
    return response.data;
  }

  async retryNotification(id: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await this.axiosInstance.post<{ success: boolean; notification: Notification }>(
      `/notifications/notifications/${id}/retry`
    );
    return response.data;
  }

  async testEmailNotification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.axiosInstance.post<{ success: boolean; message: string }>(
      '/notifications/test/email',
      { email }
    );
    return response.data;
  }

  async testWhatsAppNotification(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const response = await this.axiosInstance.post<{ success: boolean; message: string }>(
      '/notifications/test/whatsapp',
      { phoneNumber }
    );
    return response.data;
  }

  // ==================== Admin User Management ====================

  async getAllUsers(limit: number = 20, offset: number = 0): Promise<{
    users: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      role: 'user' | 'admin';
      preferences: {
        platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
        alertFrequency: 'immediate' | 'daily' | 'weekly';
        contestTypes: string[];
        notificationChannels?: {
          whatsapp: boolean;
          email: boolean;
          push: boolean;
        };
        notifyBefore?: number;
      };
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.axiosInstance.get('/users', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getUserById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: {
      platforms: ('codeforces' | 'leetcode' | 'codechef' | 'atcoder')[];
      alertFrequency: 'immediate' | 'daily' | 'weekly';
      contestTypes: string[];
      notificationChannels?: {
        whatsapp: boolean;
        email: boolean;
        push: boolean;
      };
      notifyBefore?: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const response = await this.axiosInstance.get(`/users/${id}`);
    return response.data;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    message: string;
  }> {
    const response = await this.axiosInstance.patch(`/users/${userId}/role`, { role });
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.axiosInstance.delete(`/users/${userId}`);
    return response.data;
  }

  // ==================== Admin Contest Management ====================

  async syncAllPlatforms(): Promise<{
    message: string;
    results: Record<string, { synced: number; updated: number; failed: number }>;
  }> {
    const response = await this.axiosInstance.post('/contests/sync/all');
    return response.data;
  }

  async syncPlatform(platform: string, forceSync: boolean = false): Promise<{
    message: string;
    platform: string;
    synced: number;
    updated: number;
    failed: number;
  }> {
    const response = await this.axiosInstance.post(`/contests/sync/${platform}`, { forceSync });
    return response.data;
  }

  async createContest(data: CreateContestDto): Promise<ContestResponseDto> {
    const response = await this.axiosInstance.post('/contests', data);
    return response.data;
  }

  async updateContest(id: string, data: UpdateContestDto): Promise<ContestResponseDto> {
    const response = await this.axiosInstance.patch(`/contests/${id}`, data);
    return response.data;
  }

  async deleteContest(id: string): Promise<void> {
    await this.axiosInstance.delete(`/contests/${id}`);
  }

  async bulkCreateContests(contests: CreateContestDto[]): Promise<ContestResponseDto[]> {
    const response = await this.axiosInstance.post('/contests/bulk', { contests });
    return response.data;
  }

  // ==================== Admin Email Management ====================

  async sendCustomEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; sent: number; failed: number; errors?: Array<{ userId?: string; email?: string; error: string }> }> {
    const response = await this.axiosInstance.post('/notifications/emails/custom', data);
    return response.data;
  }

  async sendBulkEmail(data: {
    userIds: string[];
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; sent: number; failed: number; errors?: Array<{ userId?: string; email?: string; error: string }> }> {
    const response = await this.axiosInstance.post('/notifications/emails/bulk', data);
    return response.data;
  }

  async sendAnnouncement(data: {
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    filters?: {
      platforms?: string[];
      isActive?: boolean;
    };
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    const response = await this.axiosInstance.post('/notifications/emails/announcement', data);
    return response.data;
  }

  async sendContestReminder(data: {
    contestId: string;
    userIds: string[];
    customMessage?: string;
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    const response = await this.axiosInstance.post('/notifications/emails/contest-reminder', data);
    return response.data;
  }

  // ==================== Admin Service Status ====================

  async getServiceStatus(): Promise<{
    email: { available: boolean; configured: boolean; provider?: string };
    whatsapp: { available: boolean; configured: boolean; provider?: string };
    push: { available: boolean; configured: boolean; provider?: string };
  }> {
    const response = await this.axiosInstance.get('/notifications/status');
    return response.data;
  }

  async healthCheckNotifications(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      email: {
        status: 'up' | 'down';
        responseTime?: number;
        lastChecked: string;
      };
      whatsapp: {
        status: 'up' | 'down';
        responseTime?: number;
        lastChecked: string;
      };
      push: {
        status: 'up' | 'down';
        responseTime?: number;
        lastChecked: string;
      };
    };
  }> {
    const response = await this.axiosInstance.get('/notifications/health');
    return response.data;
  }

  // ==================== Utility Methods ====================

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
