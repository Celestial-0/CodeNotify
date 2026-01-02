import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto, SigninDto, AuthResponse } from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse: AuthResponse = {
    user: {
      id: '64f8a1b2c3d4e5f6a7b8c9d0',
      email: 'test@example.com',
      name: 'Test User',
      phoneNumber: '+1234567890',
      role: 'user',
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const mockUser: Partial<UserDocument> = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '+1234567890',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
    lastLogin: new Date(),
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
    const mockAuthService = {
      signup: jest.fn(),
      signin: jest.fn(),
      signout: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      authService.signup.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.signup(mockCreateUserDto);

      // Assert
      expect(authService.signup).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result.user).toHaveProperty('role');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should handle signup errors', async () => {
      // Arrange
      const error = new Error('Email already exists');
      authService.signup.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signup(mockCreateUserDto)).rejects.toThrow(error);
      expect(authService.signup).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('signin', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      authService.signin.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.signin(mockSigninDto);

      // Assert
      expect(authService.signin).toHaveBeenCalledWith(mockSigninDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle signin errors', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      authService.signin.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signin(mockSigninDto)).rejects.toThrow(error);
      expect(authService.signin).toHaveBeenCalledWith(mockSigninDto);
    });
  });

  describe('signout', () => {
    it('should successfully sign out a user', async () => {
      // Arrange
      const expectedResponse = { message: 'Successfully signed out' };
      authService.signout.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.signout(mockUser as UserDocument);

      // Assert
      expect(authService.signout).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle signout errors', async () => {
      // Arrange
      const error = new Error('Signout failed');
      authService.signout.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.signout(mockUser as UserDocument),
      ).rejects.toThrow(error);
      expect(authService.signout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token with new tokens', async () => {
      // Arrange
      const refreshBody = { refreshToken: 'refresh-token' };
      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token', // Both tokens are new
      };
      authService.refreshAccessToken.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.refreshAccessToken(refreshBody);

      // Assert
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        refreshBody.refreshToken,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle refresh token errors', async () => {
      // Arrange
      const refreshBody = { refreshToken: 'invalid-token' };
      const error = new Error('Invalid refresh token');
      authService.refreshAccessToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshAccessToken(refreshBody)).rejects.toThrow(
        error,
      );
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        refreshBody.refreshToken,
      );
    });
  });
});
