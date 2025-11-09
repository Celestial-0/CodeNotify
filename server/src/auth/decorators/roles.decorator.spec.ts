import 'reflect-metadata';
import { Roles, ROLES_KEY, Role } from './roles.decorator';

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ROLES_KEY', () => {
    it('should be defined as "roles"', () => {
      expect(ROLES_KEY).toBe('roles');
    });
  });

  describe('Role type', () => {
    it('should accept "user" as a valid role', () => {
      const role: Role = 'user';
      expect(role).toBe('user');
    });

    it('should accept "admin" as a valid role', () => {
      const role: Role = 'admin';
      expect(role).toBe('admin');
    });
  });

  describe('Roles decorator', () => {
    it('should return a decorator function', () => {
      // Act
      const decorator = Roles('admin');

      // Assert
      expect(typeof decorator).toBe('function');
    });

    it('should set metadata on target when decorator is applied', () => {
      // Arrange
      class TestController {
        @Roles('admin')
        testMethod() {
          return 'test';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.testMethod,
      ) as Role[];

      // Assert
      expect(metadata).toEqual(['admin']);
    });

    it('should set metadata with multiple roles on target', () => {
      // Arrange
      class TestController {
        @Roles('admin', 'user')
        testMethod() {
          return 'test';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.testMethod,
      ) as Role[];

      // Assert
      expect(metadata).toEqual(['admin', 'user']);
    });

    it('should work with class-level decoration', () => {
      // Arrange
      @Roles('admin')
      class TestController {
        testMethod() {
          return 'test';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(ROLES_KEY, TestController) as Role[];

      // Assert
      expect(metadata).toEqual(['admin']);
    });

    it('should handle user role decoration', () => {
      // Arrange
      class TestController {
        @Roles('user')
        testMethod() {
          return 'test';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.testMethod,
      ) as Role[];

      // Assert
      expect(metadata).toEqual(['user']);
    });

    it('should handle both admin and user roles', () => {
      // Arrange
      class TestController {
        @Roles('admin', 'user')
        adminOrUserMethod() {
          return 'test';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.adminOrUserMethod,
      ) as Role[];

      // Assert
      expect(metadata).toEqual(['admin', 'user']);
    });

    it('should allow multiple decorators on different methods', () => {
      // Arrange
      class TestController {
        @Roles('admin')
        adminMethod() {
          return 'admin';
        }

        @Roles('user')
        userMethod() {
          return 'user';
        }
      }

      // Act
      const adminMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.adminMethod,
      ) as Role[];
      const userMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestController.prototype.userMethod,
      ) as Role[];

      // Assert
      expect(adminMetadata).toEqual(['admin']);
      expect(userMetadata).toEqual(['user']);
    });
  });
});
