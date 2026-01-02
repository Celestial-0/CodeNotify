import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  code: string; // Hashed OTP code

  @Prop({ required: true })
  expiresAt: Date; // TTL index for auto-cleanup

  @Prop({ default: 0 })
  attempts: number; // Failed verification attempts

  @Prop({ default: false })
  verified: boolean; // Whether OTP was successfully verified
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Create TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
