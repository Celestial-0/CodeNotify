import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto, SigninDto } from '../common/dto/auth.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    phoneNumber: '+1234567890',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
    refreshToken: null,
    lastLogin: null,
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
      usersService.createUser.mockResolvedValue(mockUser as any);
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
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);

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
      usersService.findByEmail.mockResolvedValue(mockUser as any);
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
      usersService.findByEmail.mockResolvedValue(mockUser as any);
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
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser as any);

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
      usersService.getUserById.mockResolvedValue(mockUser as any);
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
  });

  describe('error handling', () => {
    it('should handle JWT token generation failure during signup', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      usersService.createUser.mockResolvedValue(mockUser as any);
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
      const userId = mockUser.id;
      const refreshToken = 'refresh-token';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashed-refresh-token',
      };

      usersService.getUserById.mockResolvedValue(userWithRefreshToken as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync.mockRejectedValue(
        new Error('JWT generation failed'),
      );

      // Act & Assert
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
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
