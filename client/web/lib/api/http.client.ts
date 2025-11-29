/**
 * HTTP Client
 * Base axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

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

// Token refresh response type
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

class HttpClient {
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
      
      // Validate tokens exist together - if only one exists, clear both
      if ((this.accessToken && !this.refreshToken) || (!this.accessToken && this.refreshToken)) {
        console.warn('Incomplete token pair detected, clearing all tokens');
        this.clearTokensFromStorage();
      }
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
    // Request interceptor - Add access token to headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh and errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If no refresh token exists, just clear tokens and reject without redirecting
          if (!this.refreshToken) {
            this.clearTokensFromStorage();
            return Promise.reject(this.handleError(error));
          }

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
            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            this.clearTokensFromStorage();
            
            // Redirect to signin for auth failures
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              const authPaths = ['/auth/signin', '/auth/signup', '/auth/callback'];
              const isAuthPath = authPaths.some(path => currentPath.startsWith(path));
              
              if (!isAuthPath) {
                console.warn('Token refresh failed, redirecting to signin');
                window.location.href = '/auth/signin';
              }
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

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new APIError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    const response = await this.axiosInstance.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken: this.refreshToken }
    );

    this.saveTokensToStorage(response.data.accessToken, response.data.refreshToken);
    return response.data.accessToken;
  }

  // ==================== Public Methods ====================

  /** Get the axios instance for making requests */
  get api(): AxiosInstance {
    return this.axiosInstance;
  }

  /** Store auth tokens after successful login */
  storeTokens(accessToken: string, refreshToken: string): void {
    this.saveTokensToStorage(accessToken, refreshToken);
  }

  /** Clear auth tokens on logout */
  clearTokens(): void {
    this.clearTokensFromStorage();
  }

  /** Check if user has a valid access token */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /** Get current access token */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
