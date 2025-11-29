import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { AUTH } from '../../common/common.constants';
import { UserDocument } from '../../users/schemas/user.schema';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: Partial<UserDocument> = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    phoneNumber: '+1234567890',
    role: 'user',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
    refreshToken: undefined,
    lastLogin: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  }

  const mockJwtPayload: JwtPayload = {
    sub: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    role: 'user',
    iat: 1234567890,
    exp: 1234567890,
  };

  beforeEach(async () => {
    const mockUsersService = {
      getUserById: jest.fn(),
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') {
          return 'test-jwt-secret';
        }
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should throw error if JWT_SECRET is not defined', () => {
      // Arrange
      const mockConfigServiceWithoutSecret = {
        get: jest.fn().mockReturnValue(undefined),
      };

      // Act & Assert
      expect(() => {
        new JwtStrategy(
          mockConfigServiceWithoutSecret as unknown as ConfigService,
          usersService,
        );
      }).toThrow('JWT_SECRET is not defined in environment variables');
    });

    it('should use default JWT_SECRET from AUTH constants if not in config', () => {
      // Arrange
      const mockConfigServiceWithDefault = {
        get: jest.fn((key: string, defaultValue?: string) => {
          // Return the default value if provided, simulating ConfigService behavior
          return defaultValue || 'fallback-secret';
        }),
      };

      // Act
      const strategyWithDefault = new JwtStrategy(
        mockConfigServiceWithDefault as unknown as ConfigService,
        usersService,
      );

      // Assert
      expect(strategyWithDefault).toBeDefined();
      expect(mockConfigServiceWithDefault.get).toHaveBeenCalledWith(
        'JWT_SECRET',
        AUTH.JWT_SECRET,
      );
    });
  });

  describe('validate', () => {
    it('should return user if user exists and is active', async () => {
      // Arrange
      usersService.getUserById.mockResolvedValue(mockUser as UserDocument);

      // Act
      const result = await strategy.validate(mockJwtPayload);

      // Assert
      expect(usersService.getUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      usersService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        'User not found',
      );
      expect(usersService.getUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.getUserById.mockResolvedValue(inactiveUser as UserDocument);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        'User account is deactivated',
      );
      expect(usersService.getUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should validate payload with different user roles', async () => {
      // Arrange
      const adminUser = { ...mockUser, role: 'admin' };
      const adminPayload = { ...mockJwtPayload, role: 'admin' };
      usersService.getUserById.mockResolvedValue(adminUser as UserDocument);

      // Act
      const result = await strategy.validate(adminPayload);

      // Assert
      expect(usersService.getUserById).toHaveBeenCalledWith(adminPayload.sub);
      expect(result).toEqual(adminUser);
      expect(result.role).toBe('admin');
    });

    it('should handle payload without optional iat and exp fields', async () => {
      // Arrange
      const payloadWithoutOptionalFields = {
        sub: mockJwtPayload.sub,
        email: mockJwtPayload.email,
        role: mockJwtPayload.role,
      };
      usersService.getUserById.mockResolvedValue(mockUser as UserDocument);

      // Act
      const result = await strategy.validate(payloadWithoutOptionalFields);

      // Assert
      expect(usersService.getUserById).toHaveBeenCalledWith(
        payloadWithoutOptionalFields.sub,
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      usersService.getUserById.mockRejectedValue(dbError);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(dbError);
      expect(usersService.getUserById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });
  });
});
