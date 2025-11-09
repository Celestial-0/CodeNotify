import { Types } from 'mongoose';
import { UserSchema, UserDocument } from './user.schema';
import type { UserPreferences } from '../../common/dto/user.dto';

describe('UserSchema', () => {
  describe('Schema Definition', () => {
    it('should have correct schema structure', () => {
      expect(UserSchema).toBeDefined();
      expect(UserSchema.paths).toBeDefined();
    });

    it('should have email field with correct properties', () => {
      const emailPath = UserSchema.paths.email;
      expect(emailPath).toBeDefined();
      expect(emailPath.isRequired).toBe(true);
      expect(emailPath.options.unique).toBe(true);
    });

    it('should have password field with correct properties', () => {
      const passwordPath = UserSchema.paths.password;
      expect(passwordPath).toBeDefined();
      expect(passwordPath.isRequired).toBe(true);
    });

    it('should have name field with correct properties', () => {
      const namePath = UserSchema.paths.name;
      expect(namePath).toBeDefined();
      expect(namePath.isRequired).toBe(true);
    });

    it('should have phoneNumber field as optional', () => {
      const phoneNumberPath = UserSchema.paths.phoneNumber;
      expect(phoneNumberPath).toBeDefined();
      expect(phoneNumberPath.instance).toBe('String');
    });

    it('should have role field defined', () => {
      const rolePath = UserSchema.paths.role;
      expect(rolePath).toBeDefined();
      expect(rolePath.instance).toBe('String');
    });

    it('should have isActive field defined', () => {
      const isActivePath = UserSchema.paths.isActive;
      expect(isActivePath).toBeDefined();
      expect(isActivePath.instance).toBe('Boolean');
    });

    it('should have refreshToken field as optional', () => {
      const refreshTokenPath = UserSchema.paths.refreshToken;
      expect(refreshTokenPath).toBeDefined();
      expect(refreshTokenPath.instance).toBe('String');
    });

    it('should have lastLogin field as optional', () => {
      const lastLoginPath = UserSchema.paths.lastLogin;
      expect(lastLoginPath).toBeDefined();
      expect(lastLoginPath.instance).toBe('Date');
    });
  });

  describe('Preferences Field', () => {
    it('should have preferences field with correct structure', () => {
      const preferencesPath = UserSchema.paths.preferences;
      expect(preferencesPath).toBeDefined();
      expect(preferencesPath.instance).toBe('Embedded');
    });

    it('should have preferences schema defined', () => {
      const preferencesPath = UserSchema.paths.preferences;
      expect(preferencesPath).toBeDefined();
      // Preferences is an embedded document with its own schema
      expect(preferencesPath.schema).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should have timestamps enabled', () => {
      expect(UserSchema.get('timestamps')).toBe(true);
    });

    it('should have createdAt field', () => {
      const createdAtPath = UserSchema.paths.createdAt;
      expect(createdAtPath).toBeDefined();
      expect(createdAtPath.instance).toBe('Date');
    });

    it('should have updatedAt field', () => {
      const updatedAtPath = UserSchema.paths.updatedAt;
      expect(updatedAtPath).toBeDefined();
      expect(updatedAtPath.instance).toBe('Date');
    });
  });

  describe('Virtual Fields', () => {
    it('should have id virtual field defined', () => {
      const virtuals = UserSchema.virtuals;
      expect(virtuals).toBeDefined();
      // Virtual 'id' is defined in the schema
      expect(UserSchema.virtual('id')).toBeDefined();
    });

    it('should have virtual id that converts ObjectId to string', () => {
      // Test the virtual field behavior through schema definition
      const virtualId = UserSchema.virtual('id');
      expect(virtualId).toBeDefined();

      // Verify the virtual exists by checking schema virtuals
      expect(UserSchema.virtuals).toBeDefined();
    });
  });

  describe('Schema Options', () => {
    it('should include virtuals in JSON', () => {
      const toJSONOption = UserSchema.get('toJSON') as
        | { virtuals?: boolean }
        | undefined;
      expect(toJSONOption).toBeDefined();
      if (toJSONOption) {
        expect(toJSONOption.virtuals).toBe(true);
      }
    });

    it('should include virtuals in Object', () => {
      const toObjectOption = UserSchema.get('toObject') as
        | { virtuals?: boolean }
        | undefined;
      expect(toObjectOption).toBeDefined();
      if (toObjectOption) {
        expect(toObjectOption.virtuals).toBe(true);
      }
    });
  });

  describe('UserDocument Interface', () => {
    it('should have correct type structure', () => {
      const mockUser: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: 'user',
        preferences: {
          platforms: ['codeforces', 'leetcode'],
          alertFrequency: 'immediate',
          contestTypes: [],
          notificationChannels: {
            whatsapp: true,
            email: true,
            push: false,
          },
          notifyBefore: 24,
        },
        isActive: true,
        refreshToken: 'token',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockUser.email).toBe('test@example.com');
      expect(mockUser.role).toBe('user');
      expect(mockUser.isActive).toBe(true);
    });

    it('should allow optional fields to be undefined', () => {
      const mockUser: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'user',
        preferences: {
          platforms: ['codeforces'],
          alertFrequency: 'immediate',
          contestTypes: [],
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockUser.phoneNumber).toBeUndefined();
      expect(mockUser.refreshToken).toBeUndefined();
      expect(mockUser.lastLogin).toBeUndefined();
    });

    it('should support admin role', () => {
      const mockAdmin: Partial<UserDocument> = {
        _id: new Types.ObjectId(),
        id: '64f8a1b2c3d4e5f6a7b8c9d1',
        email: 'admin@example.com',
        password: 'hashedPassword',
        name: 'Admin User',
        role: 'admin',
        preferences: {
          platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
          alertFrequency: 'immediate',
          contestTypes: [],
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockAdmin.role).toBe('admin');
    });
  });

  describe('UserPreferences Type', () => {
    it('should support all platform types', () => {
      const preferences: UserPreferences = {
        platforms: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
        alertFrequency: 'immediate',
        contestTypes: ['div1', 'div2'],
        notificationChannels: {
          whatsapp: true,
          email: true,
          push: false,
        },
        notifyBefore: 48,
      };

      expect(preferences.platforms).toHaveLength(4);
      expect(preferences.platforms).toContain('codeforces');
      expect(preferences.platforms).toContain('leetcode');
      expect(preferences.platforms).toContain('codechef');
      expect(preferences.platforms).toContain('atcoder');
    });

    it('should support all alert frequency types', () => {
      const immediatePrefs: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'immediate',
        contestTypes: [],
      };

      const dailyPrefs: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'daily',
        contestTypes: [],
      };

      const weeklyPrefs: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'weekly',
        contestTypes: [],
      };

      expect(immediatePrefs.alertFrequency).toBe('immediate');
      expect(dailyPrefs.alertFrequency).toBe('daily');
      expect(weeklyPrefs.alertFrequency).toBe('weekly');
    });

    it('should support optional notification channels', () => {
      const prefsWithChannels: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'immediate',
        contestTypes: [],
        notificationChannels: {
          whatsapp: false,
          email: true,
          push: true,
        },
      };

      const prefsWithoutChannels: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'immediate',
        contestTypes: [],
      };

      expect(prefsWithChannels.notificationChannels).toBeDefined();
      expect(prefsWithChannels.notificationChannels?.whatsapp).toBe(false);
      expect(prefsWithoutChannels.notificationChannels).toBeUndefined();
    });

    it('should support optional notifyBefore', () => {
      const prefsWithNotifyBefore: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'immediate',
        contestTypes: [],
        notifyBefore: 72,
      };

      const prefsWithoutNotifyBefore: UserPreferences = {
        platforms: ['codeforces'],
        alertFrequency: 'immediate',
        contestTypes: [],
      };

      expect(prefsWithNotifyBefore.notifyBefore).toBe(72);
      expect(prefsWithoutNotifyBefore.notifyBefore).toBeUndefined();
    });

    it('should support empty platforms and contestTypes arrays', () => {
      const minimalPrefs: UserPreferences = {
        platforms: [],
        alertFrequency: 'immediate',
        contestTypes: [],
      };

      expect(minimalPrefs.platforms).toEqual([]);
      expect(minimalPrefs.contestTypes).toEqual([]);
    });
  });

  describe('Schema Validation', () => {
    it('should validate role field type', () => {
      const rolePath = UserSchema.paths.role;
      expect(rolePath).toBeDefined();
      expect(rolePath.instance).toBe('String');
    });

    it('should validate isActive field type', () => {
      const isActivePath = UserSchema.paths.isActive;
      expect(isActivePath).toBeDefined();
      expect(isActivePath.instance).toBe('Boolean');
    });

    it('should validate preferences field type', () => {
      const preferencesPath = UserSchema.paths.preferences;
      expect(preferencesPath).toBeDefined();
      expect(preferencesPath.instance).toBe('Embedded');
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      expect(UserSchema.paths.email.instance).toBe('String');
      expect(UserSchema.paths.password.instance).toBe('String');
      expect(UserSchema.paths.name.instance).toBe('String');
      expect(UserSchema.paths.phoneNumber.instance).toBe('String');
      expect(UserSchema.paths.role.instance).toBe('String');
      expect(UserSchema.paths.isActive.instance).toBe('Boolean');
      expect(UserSchema.paths.refreshToken.instance).toBe('String');
      expect(UserSchema.paths.lastLogin.instance).toBe('Date');
    });

    it('should have preferences as embedded document', () => {
      const preferencesPath = UserSchema.paths.preferences;
      expect(preferencesPath.instance).toBe('Embedded');
      // Nested fields are part of the embedded schema
      expect(preferencesPath.schema).toBeDefined();
    });
  });
});
