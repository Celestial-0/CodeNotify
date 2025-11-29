import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../auth.service';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: AuthService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string): string | undefined => {
      const configs: Record<string, string> = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
        GOOGLE_CALLBACK_URL: '/auth/google/callback',
      };
      return configs[key] ?? defaultValue;
    }),
  };

  const mockAuthService = {
    validateOAuthUser: jest.fn<Promise<any>, [string, string]>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should configure Google OAuth with correct options', () => {
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
      expect(configService.get).toHaveBeenCalledWith(
        'GOOGLE_CALLBACK_URL',
        '/auth/google/callback',
      );
    });
  });

  describe('validate', () => {
    const mockProfile: Profile = {
      id: 'google-123',
      displayName: 'John Doe',
      name: {
        familyName: 'Doe',
        givenName: 'John',
      },
      emails: [{ value: 'test@example.com', verified: true }],
      photos: [{ value: 'https://example.com/photo.jpg' }],
      provider: 'google',
      profileUrl: 'https://plus.google.com/google-123',
      _raw: '',
      _json: {
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        sub: 'google-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        email: 'test@example.com',
        email_verified: true,
        given_name: 'John',
        family_name: 'Doe',
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
      },
    };

    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';
    const mockDone = jest.fn();

    beforeEach(() => {
      mockDone.mockClear();
    });

    it('should validate and return user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
        role: 'user',
      };

      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);

      await strategy.validate(
        mockAccessToken,
        mockRefreshToken,
        mockProfile,
        mockDone,
      );

      expect(authService.validateOAuthUser).toHaveBeenCalledWith(
        'test@example.com',
        'John Doe',
      );

      expect(mockDone).toHaveBeenCalledWith(null, {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        picture: 'https://example.com/photo.jpg',
        accessToken: mockUser.accessToken,
        refreshToken: mockUser.refreshToken,
      });
    });

    it('should handle missing emails gracefully', async () => {
      const profileWithoutEmail: Profile = {
        ...mockProfile,
        emails: [],
      };

      await strategy.validate(
        mockAccessToken,
        mockRefreshToken,
        profileWithoutEmail,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(
        new UnauthorizedException('No email found from Google'),
        false,
      );
      expect(authService.validateOAuthUser).not.toHaveBeenCalled();
    });

    it('should handle missing name fields', async () => {
      const profileWithoutName: Profile = {
        ...mockProfile,
        name: undefined,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Google User',
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
        role: 'user',
      };

      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);

      await strategy.validate(
        mockAccessToken,
        mockRefreshToken,
        profileWithoutName,
        mockDone,
      );

      expect(authService.validateOAuthUser).toHaveBeenCalledWith(
        'test@example.com',
        'Google User',
      );
    });

    it('should handle auth service errors', async () => {
      mockAuthService.validateOAuthUser.mockRejectedValue(
        new Error('Database error'),
      );

      await strategy.validate(
        mockAccessToken,
        mockRefreshToken,
        mockProfile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(new Error('Database error'), false);
    });

    it('should handle inactive accounts', async () => {
      mockAuthService.validateOAuthUser.mockRejectedValue(
        new UnauthorizedException('Account is deactivated'),
      );

      await strategy.validate(
        mockAccessToken,
        mockRefreshToken,
        mockProfile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(
        new UnauthorizedException('Account is deactivated'),
        false,
      );
    });
  });
});
