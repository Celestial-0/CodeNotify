import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';
import type { UserDocument } from '../../users/schemas/user.schema';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockGetAllAndOverride: jest.Mock;

  beforeEach(() => {
    mockGetAllAndOverride = jest.fn();
    reflector = {
      getAllAndOverride: mockGetAllAndOverride,
      get: jest.fn(),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      // Arrange
      const mockContext = createMockExecutionContext({});
      mockGetAllAndOverride.mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user is not present in request', () => {
      // Arrange
      const mockContext = createMockExecutionContext({});
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(false);
    });

    it('should return true if user has required role', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'admin@example.com',
        role: 'admin',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(false);
    });

    it('should return true if user has one of multiple required roles', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['admin', 'user'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user has none of the required roles', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should check both handler and class for roles metadata', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'admin@example.com',
        role: 'admin',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const mockHandler = mockContext.getHandler();
      const mockClass = mockContext.getClass();
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockHandler,
        mockClass,
      ]);
    });

    it('should handle empty roles array', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = [];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle user with admin role accessing admin-only route', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['admin'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle user with user role accessing user-only route', () => {
      // Arrange
      const mockUser: Partial<UserDocument> = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      };
      const mockContext = createMockExecutionContext({ user: mockUser });
      const requiredRoles: Role[] = ['user'];
      mockGetAllAndOverride.mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });
});

/**
 * Helper function to create a mock ExecutionContext
 */
function createMockExecutionContext(
  request: Record<string, unknown>,
): ExecutionContext {
  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    getHandler: jest.fn().mockReturnValue(mockHandler),
    getClass: jest.fn().mockReturnValue(mockClass),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
      getResponse: jest.fn().mockReturnValue({}),
      getNext: jest.fn(),
    }),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn().mockReturnValue('http'),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
  } as unknown as ExecutionContext;
}
