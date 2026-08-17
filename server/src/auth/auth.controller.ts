import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public, CurrentUser } from '../common/decorators';
import { CreateUserDto, SigninDto, type AuthResponse } from './dto/auth.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  PasswordResetResponse,
} from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserDocument } from '../users/schemas/user.schema';
import { GoogleUser } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { EmailNotificationService } from '../notifications/services/email-notification.service';

interface GoogleOAuthRequest extends Request {
  user: GoogleUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailNotificationService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 signups per minute
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 signin attempts per minute
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto): Promise<AuthResponse> {
    return await this.authService.signin(signinDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return await this.authService.signout(user.id);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @Body() body: { refreshToken: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshAccessToken(body.refreshToken);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Guard handles the redirect to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: GoogleOAuthRequest, @Res() res: Response): void {
    const user: GoogleUser = req.user;

    // Set secure HttpOnly cookies
    res.cookie('access_token', user.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with tokens
    const frontendUrl = this.authService.getFrontendUrl();
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${encodeURIComponent(user.accessToken)}&refresh_token=${encodeURIComponent(user.refreshToken)}&user_id=${encodeURIComponent(user.id)}`;

    res.redirect(redirectUrl);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 requests per 10 minutes
  @Post('password/reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<PasswordResetResponse> {
    const result = await this.authService.requestPasswordReset(dto);

    // Send reset code via email if user exists
    if (result.code) {
      await this.emailService.sendPasswordResetEmail(dto.email, result.code);
    }

    return {
      message: result.message,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 attempts per 10 minutes
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<PasswordResetResponse> {
    return await this.authService.resetPassword(dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: UserDocument,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.changePassword(
      user.id,
      user.email,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
