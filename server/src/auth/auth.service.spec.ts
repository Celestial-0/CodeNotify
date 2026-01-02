import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import type { UserDocument } from '../users/schemas/user.schema';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: Partial<UserDocument> = {
    _id: new Types.ObjectId('64f8a1b2c3d4e5f6a7b8c9d0'),
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

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phoneNumber: '+1234567890',
  };

  const mockSigninDto: SigninDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateLastLogin: jest.fn(),
      getUserById: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default mocks
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-jwt-secret';
        case 'JWT_REFRESH_SECRET':
          return 'test-refresh-secret';
        default:
          return undefined;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      usersService.createUser.mockResolvedValue(mockUser as UserDocument);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.signup(mockCreateUserDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        12,
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashedPassword',
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'refresh-token',
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          phoneNumber: mockUser.phoneNumber,
          role: mockUser.role,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);

      // Act & Assert
      await expect(service.signup(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      usersService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await service.signin(mockSigninDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockSigninDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'refresh-token',
      );
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          phoneNumber: mockUser.phoneNumber,
          role: mockUser.role,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockSigninDto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false } as UserDocument;
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
    });
  });

  describe('signout', () => {
    it('should successfully sign out a user without refresh token', async () => {
      // Arrange
      const userId = 'user-id';
      usersService.getUserById.mockResolvedValue(mockUser as UserDocument);
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.signout(userId);

      // Assert
      expect(usersService.getUserById).toHaveBeenCalledWith(userId);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
      );
      expect(result).toEqual({ message: 'Successfully signed out' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      usersService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signout(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.getUserById).toHaveBeenCalledWith(userId);
      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token with token rotation', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: refreshToken, // Store plain token now
      } as UserDocument;

      const jwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      jwtService.verifyAsync.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.refreshAccessToken(refreshToken);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(usersService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2); // Both tokens regenerated
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'new-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException if JWT verification fails', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(usersService.getUserById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const jwtPayload = {
        sub: 'non-existent-user',
        email: 'test@example.com',
        role: 'user',
      };

      jwtService.verifyAsync.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalled();
      expect(usersService.getUserById).toHaveBeenCalledWith(
        'non-existent-user',
      );
    });

    it('should throw UnauthorizedException if user has no refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userWithoutRefreshToken = {
        ...mockUser,
        refreshToken: undefined,
      } as UserDocument;
      const jwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jwtService.verifyAsync.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithoutRefreshToken);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalled();
      expect(usersService.getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException if refresh token does not match stored token', async () => {
      // Arrange
      const refreshToken = 'different-refresh-token';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'stored-refresh-token',
      } as UserDocument;
      const jwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jwtService.verifyAsync.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalled();
      expect(usersService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      usersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle JWT token generation failure during signup', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      usersService.createUser.mockResolvedValue(mockUser as UserDocument);
      jwtService.signAsync.mockRejectedValue(
        new Error('JWT generation failed'),
      );

      // Act & Assert
      await expect(service.signup(mockCreateUserDto)).rejects.toThrow(
        'JWT generation failed',
      );
      expect(usersService.createUser).toHaveBeenCalled();
      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should handle JWT token generation failure during signin', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync.mockRejectedValue(
        new Error('JWT generation failed'),
      );

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        'JWT generation failed',
      );
      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should handle JWT token generation failure during token refresh', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: refreshToken,
      };
      const jwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jwtService.verifyAsync.mockResolvedValue(jwtPayload as any);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken as any);
      jwtService.signAsync.mockRejectedValue(
        new Error('JWT generation failed'),
      );

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        'JWT generation failed',
      );
      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hashing failure during signup', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockRejectedValue(new Error('Hashing failed') as never);

      // Act & Assert
      await expect(service.signup(mockCreateUserDto)).rejects.toThrow(
        'Hashing failed',
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison failure during signin', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockRejectedValue(
        new Error('Comparison failed') as never,
      );

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        'Comparison failed',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
