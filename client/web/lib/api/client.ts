/**
 * API Client
 * Axios instance with interceptors for authentication
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { AuthResponse, RefreshTokenResponse } from '@/lib/types/auth';

class APIClient {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add access token to headers
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = this.getAccessToken();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.handleTokenRefresh();
            
            // Update the failed request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            return this.api(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, clear auth and redirect to login
            this.clearAuthData();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh(): Promise<string> {
    // If a refresh is already in progress, wait for it
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        const userId = this.getUserId();

        if (!refreshToken || !userId) {
          throw new Error('No refresh token or user ID available');
        }

        const response = await axios.post<RefreshTokenResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/refresh`,
          { refreshToken, userId }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        this.setAccessToken(accessToken);
        this.setRefreshToken(newRefreshToken);

        return accessToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Token management methods
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }

  private setUserId(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
  }

  // Public API method
  public getApi(): AxiosInstance {
    return this.api;
  }

  // Store auth tokens after successful login
  public storeAuthData(response: AuthResponse): void {
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setUserId(response.user.id);
  }

  // Clear auth tokens on logout
  public clearAuth(): void {
    this.clearAuthData();
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export const api = apiClient.getApi();
