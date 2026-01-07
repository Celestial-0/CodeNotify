import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto, SigninDto, AuthResponse } from './dto/auth.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  PasswordResetResponse,
} from './dto/reset-password.dto';
import type { UserPreferences } from '../users/dto/user.dto';
import { PasswordService } from './services/password.service';
import { TokenService, JwtPayload } from './services/token.service';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) { }

  async signup(createUserDto: CreateUserDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password is provided for email-based signup
    if (!createUserDto.password) {
      throw new ConflictException('Password is required for email-based signup');
    }

    // Hash the password
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    // Create user
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    // Update user with refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
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

    // Check if user has a password
    // OAuth users who haven't set a password yet must use OAuth login
    if (!user.password) {
      throw new UnauthorizedException(
        'No password set for this account. Please use Google sign-in or reset your password to create one.',
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      signinDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

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
        isEmailVerified: user.isEmailVerified,
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
    // Verify the refresh token
    let payload: JwtPayload;
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
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
    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    // Update the stored refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
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
    if (
      user &&
      user.password &&
      (await this.passwordService.verifyPassword(password, user.password))
    ) {
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
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user already exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user for OAuth (no password needed)
      user = await this.usersService.createUser({
        email,
        name,
        // OAuth users don't have passwords
        phoneNumber: undefined,
      } as CreateUserDto);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Set email as verified for OAuth users (if not already verified)
    if (!user.isEmailVerified) {
      await this.usersService.updateEmailVerification(user.id, true);
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    // Update user with refresh token and last login
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isEmailVerified: true, // OAuth users are pre-verified
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Request password reset OTP
   * Works for both regular users and OAuth users
   */
  async requestPasswordReset(
    dto: RequestPasswordResetDto,
  ): Promise<PasswordResetResponse> {
    const { code, expiresAt } =
      await this.otpService.createPasswordResetOtp(dto.email);

    // Return the OTP code and expiry time
    // The controller will handle sending the email
    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    return {
      message: 'Password reset OTP sent to your email',
      expiresIn,
      code, // This will be used by the controller to send email
    } as PasswordResetResponse & { code: string };
  }

  /**
   * Reset password with OTP verification
   * Allows OAuth users to set a password for the first time
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Verify OTP
    const user = await this.otpService.verifyPasswordResetOtp(
      dto.email,
      dto.code,
    );

    // Hash the new password
    const hashedPassword = await this.passwordService.hashPassword(
      dto.newPassword,
    );

    // Update user's password
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password reset successfully. You can now sign in with your new password.',
    };
  }

  /**
   * Change password with current password verification (no OTP required)
   */
  async changePassword(
    userId: string,
    email: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Get user by email (we'll pass email from the authenticated user)
    const user = await this.usersService.findByEmail(email);
    if (!user || user.id !== userId) {
      throw new UnauthorizedException('User not found');
    }

    // Verify user has a password (not OAuth-only user)
    if (!user.password) {
      throw new BadRequestException(
        'Cannot change password for OAuth-only accounts. Please use the forgot password flow to create a password first.',
      );
    }

    // Verify current password
    const isPasswordValid = await this.passwordService.verifyPassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password changed successfully',
    };
  }

  getFrontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }
}
