import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { generateOtp } from '../../common/utils/crypto.util';
import { OTP } from '../../common/constants';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private usersService: UsersService,
  ) { }

  /**
   * Generate a secure 6-digit OTP code
   */
  generateOtp(): string {
    return generateOtp(OTP.CODE_LENGTH);
  }

  /**
   * Hash OTP code using bcrypt
   */
  private async hashOtp(code: string): Promise<string> {
    return bcrypt.hash(code, OTP.SALT_ROUNDS);
  }

  /**
   * Verify OTP code against hashed version
   */
  private async verifyOtpCode(
    plainCode: string,
    hashedCode: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainCode, hashedCode);
  }

  /**
   * Create new OTP record for email
   * Deletes any existing OTP for the email first
   */
  async createOtp(email: string): Promise<{ code: string; expiresAt: Date }> {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing OTP for this email
    await this.otpModel.deleteMany({ email }).exec();

    // Generate new OTP
    const code = this.generateOtp();
    const hashedCode = await this.hashOtp(code);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP.EXPIRY_MINUTES);

    // Create OTP record
    const otpRecord = new this.otpModel({
      email,
      code: hashedCode,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    await otpRecord.save();

    this.logger.log(`OTP created for email: ${email}`);

    return { code, expiresAt };
  }

  /**
   * Verify OTP code for email
   * Handles rate limiting and marks user as verified on success
   */
  async verifyOtp(email: string, code: string): Promise<UserDocument> {
    // Find OTP record
    const otpRecord = await this.otpModel.findOne({ email }).exec();

    if (!otpRecord) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    // Check if already verified
    if (otpRecord.verified) {
      throw new BadRequestException(
        'OTP already used. Please request a new one.',
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await this.otpModel.deleteOne({ email }).exec();
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Check attempts limit
    if (otpRecord.attempts >= OTP.MAX_ATTEMPTS) {
      await this.otpModel.deleteOne({ email }).exec();
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Verify the code
    const isValid = await this.verifyOtpCode(code, otpRecord.code);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = OTP.MAX_ATTEMPTS - otpRecord.attempts;
      throw new BadRequestException(
        `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Mark user as verified
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    await user.save();

    // Delete the OTP record after successful verification
    await this.otpModel.deleteOne({ email }).exec();

    this.logger.log(`Email verified successfully for: ${email}`);

    // Return the verified user
    return user;
  }

  /**
   * Resend OTP to email
   * Creates a new OTP and invalidates the old one
   */
  async resendOtp(email: string): Promise<{ code: string; expiresAt: Date }> {
    return this.createOtp(email);
  }

  /**
   * Delete OTP record for email
   */
  async deleteOtp(email: string): Promise<void> {
    await this.otpModel.deleteOne({ email }).exec();
    this.logger.log(`OTP deleted for email: ${email}`);
  }

  /**
   * Manual cleanup of expired OTPs
   * Note: TTL index handles automatic cleanup, this is for manual triggers
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.otpModel
      .deleteMany({ expiresAt: { $lt: new Date() } })
      .exec();

    this.logger.log(`Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  }

  /**
   * Get OTP status for email (for debugging/admin purposes)
   */
  async getOtpStatus(email: string): Promise<{
    exists: boolean;
    expiresAt?: Date;
    attempts?: number;
  }> {
    const otpRecord = await this.otpModel.findOne({ email }).exec();

    if (!otpRecord) {
      return { exists: false };
    }

    return {
      exists: true,
      expiresAt: otpRecord.expiresAt,
      attempts: otpRecord.attempts,
    };
  }
}
