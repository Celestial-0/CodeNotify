/**
 * Authentication Service
 * API calls for authentication operations
 */

import { api, apiClient } from './client';
import type { 
  SigninFormData, 
  SignupFormData, 
  AuthResponse,
  ForgotPasswordFormData 
} from '@/lib/types/auth';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signin(data: SigninFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signin', data);
    
    // Store tokens in client
    apiClient.storeAuthData(response.data);
    
    return response.data;
  }

  /**
   * Sign up with email, password, and name
   */
  static async signup(data: SignupFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    
    // Store tokens in client
    apiClient.storeAuthData(response.data);
    
    return response.data;
  }

  /**
   * Sign out current user
   */
  static async signout(): Promise<void> {
    try {
      await api.post('/auth/signout');
    } finally {
      // Clear tokens regardless of API response
      apiClient.clearAuth();
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}
