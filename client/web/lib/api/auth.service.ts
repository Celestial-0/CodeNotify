/**
 * Authentication Service
 * API calls for authentication operations
 */

import { httpClient } from './http.client';
import type {
  SigninFormData,
  SignupFormData,
  AuthResponse,
  ForgotPasswordFormData,
} from '@/lib/types/auth.types';

// Re-export types for convenience
export type { SigninFormData, SignupFormData, AuthResponse };

// API base URL for OAuth redirects
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signin(data: SigninFormData): Promise<AuthResponse> {
    const response = await httpClient.api.post<AuthResponse>('/auth/signin', data);
    httpClient.storeTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Sign up with email, password, and name
   */
  static async signup(data: SignupFormData): Promise<AuthResponse> {
    const response = await httpClient.api.post<AuthResponse>('/auth/signup', data);
    httpClient.storeTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Sign out current user
   */
  static async signout(): Promise<void> {
    try {
      await httpClient.api.post('/auth/signout');
    } finally {
      httpClient.clearTokens();
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    const response = await httpClient.api.post<{ message: string }>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await httpClient.api.post<{ message: string }>(
      '/auth/reset-password',
      { token, password }
    );
    return response.data;
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return httpClient.isAuthenticated();
  }

  /**
   * Initiate Google OAuth flow
   * Redirects user to Google's OAuth consent screen
   */
  static initiateGoogleOAuth(): void {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  /**
   * Handle Google OAuth callback
   * Extracts tokens from URL and stores them
   */
  static handleOAuthCallback(): {
    success: boolean;
    userId?: string;
    error?: string;
  } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not in browser environment' };
    }

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const userId = params.get('user_id');
    const error = params.get('error');

    if (error) {
      return { success: false, error: decodeURIComponent(error) };
    }

    if (accessToken && refreshToken && userId) {
      httpClient.storeTokens(accessToken, refreshToken);
      return { success: true, userId };
    }

    return { success: false, error: 'Missing authentication tokens' };
  }

  /**
   * Get the Google OAuth URL for the button
   */
  static getGoogleOAuthUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  }

  /**
   * Request OTP for email verification
   */
  static async requestOtp(email: string): Promise<{ message: string; expiresIn?: number }> {
    const response = await httpClient.api.post<{ message: string; expiresIn?: number }>(
      '/auth/otp/request',
      { email }
    );
    return response.data;
  }

  /**
   * Verify OTP code for email
   */
  static async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const response = await httpClient.api.post<AuthResponse>(
      '/auth/otp/verify',
      { email, code }
    );
    // Store the authentication tokens
    httpClient.storeTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Resend OTP to email
   */
  static async resendOtp(email: string): Promise<{ message: string; expiresIn?: number }> {
    const response = await httpClient.api.post<{ message: string; expiresIn?: number }>(
      '/auth/otp/resend',
      { email }
    );
    return response.data;
  }
}
