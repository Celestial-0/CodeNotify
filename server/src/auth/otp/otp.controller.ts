import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailNotificationService } from '../../notifications/services/email-notification.service';
import {
  RequestOtpDto,
  VerifyOtpDto,
  ResendOtpDto,
  OtpResponse,
  VerifyOtpResponse,
} from './dto/otp.dto';
import { Public } from '../../common/decorators';

@Controller('auth/otp')
export class OtpController {
  private readonly logger = new Logger(OtpController.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailNotificationService,
  ) {}

  /**
   * Request OTP for email verification
   * POST /auth/otp/request
   */
  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpResponse> {
    try {
      const { code, expiresAt } = await this.otpService.createOtp(dto.email);

      // Send OTP via email
      await this.emailService.sendOtpEmail(dto.email, code);

      const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

      this.logger.log(`OTP requested for email: ${dto.email}`);

      return {
        message: 'OTP sent to your email address',
        expiresIn,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to request OTP for ${dto.email}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Verify OTP code
   * POST /auth/otp/verify
   */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    try {
      await this.otpService.verifyOtp(dto.email, dto.code);

      this.logger.log(`Email verified successfully: ${dto.email}`);

      return {
        message: 'Email verified successfully',
        isEmailVerified: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to verify OTP for ${dto.email}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Resend OTP to email
   * POST /auth/otp/resend
   */
  @Public()
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto): Promise<OtpResponse> {
    try {
      const { code, expiresAt } = await this.otpService.resendOtp(dto.email);

      // Send OTP via email
      await this.emailService.sendOtpEmail(dto.email, code);

      const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

      this.logger.log(`OTP resent for email: ${dto.email}`);

      return {
        message: 'New OTP sent to your email address',
        expiresIn,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to resend OTP for ${dto.email}: ${errorMessage}`,
      );
      throw error;
    }
  }
}
