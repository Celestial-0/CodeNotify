/**
 * Admin Service
 * API calls for admin-only operations (user management)
 */

import { httpClient } from './http.client';

// Admin user type
export interface AdminUser {
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
}

export interface PaginatedUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export class AdminService {
  // ==================== User Management ====================

  /**
   * Get all users with pagination
   */
  static async getAllUsers(limit: number = 20, offset: number = 0): Promise<PaginatedUsersResponse> {
    const response = await httpClient.api.get('/users', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<Omit<AdminUser, 'role'>> {
    const response = await httpClient.api.get(`/users/${id}`);
    return response.data;
  }

  /**
   * Update a user's role
   */
  static async updateUserRole(
    userId: string,
    role: 'user' | 'admin'
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    message: string;
  }> {
    const response = await httpClient.api.patch(`/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await httpClient.api.delete(`/users/${userId}`);
    return response.data;
  }
}
