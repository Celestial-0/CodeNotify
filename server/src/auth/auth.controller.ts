import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
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
  ) { }

  @Public()
  @Throttle({ short: { limit: 50, ttl: 60000 } }) // 50 requests per minute
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Throttle({ short: { limit: 100, ttl: 60000 } }) // 100 requests per minute
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

    // Redirect to frontend with tokens
    const frontendUrl = this.authService.getFrontendUrl();
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${user.accessToken}&refresh_token=${user.refreshToken}&user_id=${user.id}`;

    res.redirect(redirectUrl);
  }

  @Public()
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('password/reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<PasswordResetResponse> {
    const result = (await this.authService.requestPasswordReset(dto)) as
      | PasswordResetResponse
      | (PasswordResetResponse & { code: string });

    // Send password reset email
    if ('code' in result) {
      await this.emailService.sendPasswordResetEmail(dto.email, result.code);
    }

    // Return response without the code
    return {
      message: result.message,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('password/reset/verify')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(dto);
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async changePassword(
    @CurrentUser() user: UserDocument,
    @Body() dto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    return this.authService.changePassword(
      user.id,
      user.email,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
