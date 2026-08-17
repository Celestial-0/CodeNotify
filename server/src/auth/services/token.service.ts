/**
 * Token Service
 * Handles JWT token generation and refresh logic
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TOKEN } from '../../common/constants';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate access and refresh tokens for a user
   * @param userId - The user's ID
   * @param email - The user's email
   * @param role - The user's role
   * @returns Object containing access and refresh tokens
   */
  async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || jwtSecret;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: TOKEN.ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: TOKEN.REFRESH_TOKEN_EXPIRY,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify a refresh token
   * @param refreshToken - The refresh token to verify
   * @returns The decoded JWT payload
   * @throws UnauthorizedException if token is invalid
   */
  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || jwtSecret;

    return this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: refreshSecret,
    });
  }
}
