import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AUTH } from '../common/common.constants';
import { CreateUserDto, SigninDto, AuthResponse } from '../common/dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import type { UserPreferences } from '../common/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create user
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update user with refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signin(signinDto: SigninDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(signinDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update user with refresh token and last signin
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signout(userId: string): Promise<{ message: string }> {
    // Get user to validate existence
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Clear refresh token from database
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Successfully signed out' };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify the refresh token using JWT_REFRESH_SECRET
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          AUTH.JWT_REFRESH_SECRET,
        ),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user and verify they still exist and are active
    const user = await this.usersService.getUserById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify the refresh token matches the one stored in database
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens (token rotation for better security)
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update the stored refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', AUTH.JWT_SECRET),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          AUTH.JWT_REFRESH_SECRET,
        ),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
    isActive: boolean;
    refreshToken?: string;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOAuthUser(
    email: string,
    name: string,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user already exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user for OAuth
      user = await this.usersService.createUser({
        email,
        name,
        password: '', // No password for OAuth users
        phoneNumber: undefined,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update user with refresh token and last login
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  getFrontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }
}
