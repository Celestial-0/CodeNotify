import {
  UpdateUserSchema,
  GetUserByIdSchema,
  GetAllUsersSchema,
  UpdateUserRoleSchema,
  UpdateUserRoleBodySchema,
  DeleteUserSchema,
  UpdateUserDto,
  GetUserByIdDto,
  GetAllUsersDto,
  UpdateUserRoleDto,
  UpdateUserRoleBodyDto,
  DeleteUserDto,
  UserPreferences,
} from './user.dto';

describe('User DTOs', () => {
  describe('UpdateUserSchema', () => {
    it('should validate valid update data with all fields', () => {
      const validData = {
        name: 'Updated Name',
        phoneNumber: '+1234567890',
        role: 'admin',
        preferences: {
          platforms: ['codeforces', 'leetcode'],
          alertFrequency: 'daily',
          contestTypes: ['DIV1', 'DIV2'],
          notificationChannels: {
            whatsapp: true,
            email: false,
            push: true,
          },
          notifyBefore: 48,
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with only name', () => {
      const validData = {
        name: 'Updated Name',
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with empty object', () => {
      const validData = {};

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'A',
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        role: 'superadmin',
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate valid roles', () => {
      const userData = { role: 'user' };
      const adminData = { role: 'admin' };

      expect(UpdateUserSchema.safeParse(userData).success).toBe(true);
      expect(UpdateUserSchema.safeParse(adminData).success).toBe(true);
    });

    it('should reject invalid platform in preferences', () => {
      const invalidData = {
        preferences: {
          platforms: ['invalid-platform'],
        },
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate all valid platforms', () => {
      const validData = {
        preferences: {
          platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid alertFrequency', () => {
      const invalidData = {
        preferences: {
          alertFrequency: 'monthly',
        },
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate all valid alertFrequencies', () => {
      const frequencies = ['immediate', 'daily', 'weekly'];

      frequencies.forEach((freq) => {
        const data = {
          preferences: {
            alertFrequency: freq,
          },
        };
        expect(UpdateUserSchema.safeParse(data).success).toBe(true);
      });
    });

    it('should reject notifyBefore less than 1', () => {
      const invalidData = {
        preferences: {
          notifyBefore: 0,
        },
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject notifyBefore greater than 168', () => {
      const invalidData = {
        preferences: {
          notifyBefore: 169,
        },
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate notifyBefore within range', () => {
      const validData1 = { preferences: { notifyBefore: 1 } };
      const validData2 = { preferences: { notifyBefore: 168 } };
      const validData3 = { preferences: { notifyBefore: 24 } };

      expect(UpdateUserSchema.safeParse(validData1).success).toBe(true);
      expect(UpdateUserSchema.safeParse(validData2).success).toBe(true);
      expect(UpdateUserSchema.safeParse(validData3).success).toBe(true);
    });

    it('should validate notification channels', () => {
      const validData = {
        preferences: {
          notificationChannels: {
            whatsapp: true,
            email: false,
            push: true,
          },
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial notification channels', () => {
      const validData = {
        preferences: {
          notificationChannels: {
            whatsapp: true,
          },
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('GetUserByIdSchema', () => {
    it('should validate valid user ID', () => {
      const validData = {
        id: '507f1f77bcf86cd799439011',
      };

      const result = GetUserByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty ID', () => {
      const invalidData = {
        id: '',
      };

      const result = GetUserByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing ID', () => {
      const invalidData = {};

      const result = GetUserByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty string as ID', () => {
      const validData = {
        id: 'any-string-id',
      };

      const result = GetUserByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('GetAllUsersSchema', () => {
    it('should validate with limit and offset', () => {
      const validData = {
        limit: '10',
        offset: '5',
      };

      const result = GetAllUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(5);
      }
    });

    it('should use default values when not provided', () => {
      const validData = {};

      const result = GetAllUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should transform string to number', () => {
      const validData = {
        limit: '50',
        offset: '10',
      };

      const result = GetAllUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(typeof result.data.offset).toBe('number');
      }
    });

    it('should handle zero offset', () => {
      const validData = {
        offset: '0',
      };

      const result = GetAllUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(0);
      }
    });

    it('should handle large numbers', () => {
      const validData = {
        limit: '1000',
        offset: '5000',
      };

      const result = GetAllUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(1000);
        expect(result.data.offset).toBe(5000);
      }
    });
  });

  describe('UpdateUserRoleSchema', () => {
    it('should validate valid user ID', () => {
      const validData = {
        id: '507f1f77bcf86cd799439011',
      };

      const result = UpdateUserRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty ID', () => {
      const invalidData = {
        id: '',
      };

      const result = UpdateUserRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateUserRoleBodySchema', () => {
    it('should validate user role', () => {
      const validData = {
        role: 'user',
      };

      const result = UpdateUserRoleBodySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate admin role', () => {
      const validData = {
        role: 'admin',
      };

      const result = UpdateUserRoleBodySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        role: 'moderator',
      };

      const result = UpdateUserRoleBodySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing role', () => {
      const invalidData = {};

      const result = UpdateUserRoleBodySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('DeleteUserSchema', () => {
    it('should validate valid user ID', () => {
      const validData = {
        id: '507f1f77bcf86cd799439011',
      };

      const result = DeleteUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty ID', () => {
      const invalidData = {
        id: '',
      };

      const result = DeleteUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('DTO Classes', () => {
    it('should create UpdateUserDto instance', () => {
      expect(UpdateUserDto).toBeDefined();
      expect(typeof UpdateUserDto).toBe('function');
    });

    it('should create GetUserByIdDto instance', () => {
      expect(GetUserByIdDto).toBeDefined();
      expect(typeof GetUserByIdDto).toBe('function');
    });

    it('should create GetAllUsersDto instance', () => {
      expect(GetAllUsersDto).toBeDefined();
      expect(typeof GetAllUsersDto).toBe('function');
    });

    it('should create UpdateUserRoleDto instance', () => {
      expect(UpdateUserRoleDto).toBeDefined();
      expect(typeof UpdateUserRoleDto).toBe('function');
    });

    it('should create UpdateUserRoleBodyDto instance', () => {
      expect(UpdateUserRoleBodyDto).toBeDefined();
      expect(typeof UpdateUserRoleBodyDto).toBe('function');
    });

    it('should create DeleteUserDto instance', () => {
      expect(DeleteUserDto).toBeDefined();
      expect(typeof DeleteUserDto).toBe('function');
    });
  });

  describe('UserPreferences Interface', () => {
    it('should match expected structure', () => {
      const preferences = {
        platforms: ['codeforces', 'leetcode'],
        alertFrequency: 'immediate',
        contestTypes: ['DIV1', 'DIV2'],
        notificationChannels: {
          whatsapp: true,
          email: true,
          push: false,
        },
        notifyBefore: 24,
      };

      expect(preferences).toHaveProperty('platforms');
      expect(preferences).toHaveProperty('alertFrequency');
      expect(preferences).toHaveProperty('contestTypes');
      expect(preferences).toHaveProperty('notificationChannels');
      expect(preferences).toHaveProperty('notifyBefore');
    });

    it('should allow optional notificationChannels', () => {
      const preferences: Partial<UserPreferences> = {
        platforms: ['codeforces'],
        alertFrequency: 'daily',
        contestTypes: [],
      };

      expect(preferences.notificationChannels).toBeUndefined();
    });

    it('should allow optional notifyBefore', () => {
      const preferences: Partial<UserPreferences> = {
        platforms: ['codeforces'],
        alertFrequency: 'daily',
        contestTypes: [],
      };

      expect(preferences.notifyBefore).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode in name', () => {
      const validData = {
        name: '测试用户 Tëst',
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle empty contestTypes array', () => {
      const validData = {
        preferences: {
          contestTypes: [],
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle multiple platforms', () => {
      const validData = {
        preferences: {
          platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
        },
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle boundary notifyBefore values', () => {
      const minData = { preferences: { notifyBefore: 1 } };
      const maxData = { preferences: { notifyBefore: 168 } };

      expect(UpdateUserSchema.safeParse(minData).success).toBe(true);
      expect(UpdateUserSchema.safeParse(maxData).success).toBe(true);
    });
  });
});
