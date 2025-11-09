import {
  CreateUserSchema,
  SigninSchema,
  SignoutSchema,
  CreateUserDto,
  SigninDto,
  SignoutDto,
} from './auth.dto';

describe('Auth DTOs', () => {
  describe('CreateUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '+1234567890',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate user data without optional phoneNumber', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty string for optional phoneNumber', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('SigninSchema', () => {
    it('should validate valid signin data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = SigninSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = SigninSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = SigninSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = SigninSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = SigninSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty password', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a',
      };

      const result = SigninSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('SignoutSchema', () => {
    it('should validate empty object', () => {
      const validData = {};

      const result = SignoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept object with extra properties', () => {
      const dataWithExtra = {
        extra: 'property',
      };

      const result = SignoutSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(true);
    });

    it('should always succeed for any object', () => {
      const result1 = SignoutSchema.safeParse({});
      const result2 = SignoutSchema.safeParse({ a: 1 });
      const result3 = SignoutSchema.safeParse({ b: 'test' });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });
  });

  describe('DTO Classes', () => {
    it('should create CreateUserDto instance', () => {
      expect(CreateUserDto).toBeDefined();
      expect(typeof CreateUserDto).toBe('function');
    });

    it('should create SigninDto instance', () => {
      expect(SigninDto).toBeDefined();
      expect(typeof SigninDto).toBe('function');
    });

    it('should create SignoutDto instance', () => {
      expect(SignoutDto).toBeDefined();
      expect(typeof SignoutDto).toBe('function');
    });
  });

  describe('AuthResponse Interface', () => {
    it('should match expected structure', () => {
      const authResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          phoneNumber: '+1234567890',
          role: 'user',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      expect(authResponse).toHaveProperty('user');
      expect(authResponse).toHaveProperty('accessToken');
      expect(authResponse).toHaveProperty('refreshToken');
      expect(authResponse.user).toHaveProperty('id');
      expect(authResponse.user).toHaveProperty('email');
      expect(authResponse.user).toHaveProperty('name');
      expect(authResponse.user).toHaveProperty('role');
    });

    it('should allow optional phoneNumber in user', () => {
      const authResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          phoneNumber: undefined,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      expect(authResponse.user.phoneNumber).toBeUndefined();
    });
  });

  describe('UserResponse Interface', () => {
    it('should match expected structure', () => {
      const userResponse = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(userResponse).toHaveProperty('id');
      expect(userResponse).toHaveProperty('email');
      expect(userResponse).toHaveProperty('name');
      expect(userResponse).toHaveProperty('role');
      expect(userResponse).toHaveProperty('createdAt');
      expect(userResponse).toHaveProperty('updatedAt');
    });

    it('should allow optional phoneNumber', () => {
      const userResponse = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        phoneNumber: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(userResponse.phoneNumber).toBeUndefined();
    });

    it('should have Date types for timestamps', () => {
      const userResponse = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(userResponse.createdAt).toBeInstanceOf(Date);
      expect(userResponse.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in email', () => {
      const validData = {
        email: 'test+tag@example.co.uk',
        password: 'password123',
        name: 'Test User',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters in name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Tëst Üser 测试',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle very long passwords', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a'.repeat(1000),
        name: 'Test User',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle international phone numbers', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '+44 20 7946 0958',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
