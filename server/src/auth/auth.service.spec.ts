import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { OtpService } from './otp/otp.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import type { UserDocument } from '../users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let otpService: jest.Mocked<OtpService>;
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

    const mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    };

    const mockTokenService = {
      generateTokens: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const mockOtpService = {
      createPasswordResetOtp: jest.fn(),
      verifyPasswordResetOtp: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    otpService = module.get(OtpService);
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
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      usersService.createUser.mockResolvedValue(mockUser as UserDocument);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.signup(mockCreateUserDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashedPassword',
      });
      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
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
      passwordService.verifyPassword.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      usersService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await service.signin(mockSigninDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        mockSigninDto.password,
        mockUser.password,
      );
      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
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
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      passwordService.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockSigninDto.email,
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
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
        refreshToken: refreshToken,
      } as UserDocument;

      const jwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      tokenService.verifyRefreshToken.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.refreshAccessToken(refreshToken);

      // Assert
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(usersService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
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
      tokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
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

      tokenService.verifyRefreshToken.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenService.verifyRefreshToken).toHaveBeenCalled();
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

      tokenService.verifyRefreshToken.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithoutRefreshToken);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenService.verifyRefreshToken).toHaveBeenCalled();
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

      tokenService.verifyRefreshToken.mockResolvedValue(jwtPayload);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenService.verifyRefreshToken).toHaveBeenCalled();
      expect(usersService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      passwordService.verifyPassword.mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
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
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      usersService.findByEmail.mockResolvedValue(mockUser as UserDocument);
      passwordService.verifyPassword.mockResolvedValue(false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
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
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      usersService.createUser.mockResolvedValue(mockUser as UserDocument);
      tokenService.generateTokens.mockRejectedValue(
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
      passwordService.verifyPassword.mockResolvedValue(true);
      tokenService.generateTokens.mockRejectedValue(
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

      tokenService.verifyRefreshToken.mockResolvedValue(jwtPayload as any);
      usersService.getUserById.mockResolvedValue(userWithRefreshToken as any);
      tokenService.generateTokens.mockRejectedValue(
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
      passwordService.hashPassword.mockRejectedValue(new Error('Hashing failed'));

      // Act & Assert
      await expect(service.signup(mockCreateUserDto)).rejects.toThrow(
        'Hashing failed',
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison failure during signin', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      passwordService.verifyPassword.mockRejectedValue(
        new Error('Comparison failed'),
      );

      // Act & Assert
      await expect(service.signin(mockSigninDto)).rejects.toThrow(
        'Comparison failed',
      );
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });
  });
});
