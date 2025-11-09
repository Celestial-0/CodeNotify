import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../common/common.constants';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
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

    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      mockGetAllAndOverride.mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should call super.canActivate for protected routes', () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      mockGetAllAndOverride.mockReturnValue(false);

      // Mock the super.canActivate method
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      // Cleanup
      superCanActivateSpy.mockRestore();
    });

    it('should call super.canActivate when IS_PUBLIC_KEY is undefined', () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      mockGetAllAndOverride.mockReturnValue(undefined);

      // Mock the super.canActivate method
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      // Cleanup
      superCanActivateSpy.mockRestore();
    });

    it('should check both handler and class for public metadata', () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      const mockHandler = mockContext.getHandler();
      const mockClass = mockContext.getClass();
      mockGetAllAndOverride.mockReturnValue(true);

      // Act
      void guard.canActivate(mockContext);

      // Assert
      expect(mockGetAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockHandler,
        mockClass,
      ]);
    });

    it('should return false when super.canActivate returns false', () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      mockGetAllAndOverride.mockReturnValue(false);

      // Mock the super.canActivate method to return false
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(false);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);

      // Cleanup
      superCanActivateSpy.mockRestore();
    });

    it('should handle async super.canActivate', async () => {
      // Arrange
      const mockContext = createMockExecutionContext();
      mockGetAllAndOverride.mockReturnValue(false);

      // Mock the super.canActivate method to return a Promise
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(Promise.resolve(true));

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);

      // Cleanup
      superCanActivateSpy.mockRestore();
    });
  });
});

/**
 * Helper function to create a mock ExecutionContext
 */
function createMockExecutionContext(): ExecutionContext {
  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    getHandler: jest.fn().mockReturnValue(mockHandler),
    getClass: jest.fn().mockReturnValue(mockClass),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
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
