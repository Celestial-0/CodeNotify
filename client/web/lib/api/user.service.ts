/**
 * User Service
 * API calls for user profile and account operations
 */

import { httpClient } from './http.client';
import type {
  UserProfile,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '@/lib/types/user.types';

export class UserService {
  /**
   * Get current user's profile
   */
  static async getProfile(): Promise<UserProfile> {
    const response = await httpClient.api.get<UserProfile>('/users/profile');
    return response.data;
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    const response = await httpClient.api.put<UserProfile>('/users/profile', data);
    return response.data;
  }

  /**
   * Update current user's preferences
   */
  static async updatePreferences(data: UpdatePreferencesDto): Promise<UserProfile> {
    const response = await httpClient.api.put<UserProfile>(
      '/users/profile',
      { preferences: data }
    );
    return response.data;
  }

  /**
   * Deactivate current user's account
   */
  static async deactivateAccount(): Promise<{ message: string }> {
    const response = await httpClient.api.delete<{ message: string }>('/users/profile');
    return response.data;
  }

  /**
   * Activate current user's account
   */
  static async activateAccount(): Promise<{ message: string }> {
    const response = await httpClient.api.put<{ message: string }>('/users/activate');
    return response.data;
  }

  /**
   * Test email notification for current user
   */
  static async testEmailNotification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.api.post<{ success: boolean; message: string }>(
      '/notifications/test/email',
      { email }
    );
    return response.data;
  }

  /**
   * Test WhatsApp notification for current user
   */
  static async testWhatsAppNotification(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.api.post<{ success: boolean; message: string }>(
      '/notifications/test/whatsapp',
      { phoneNumber }
    );
    return response.data;
  }
}
